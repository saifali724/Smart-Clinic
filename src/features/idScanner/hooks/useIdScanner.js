// src/features/idScanner/hooks/useIdScanner.js

import { useCallback, useEffect, useRef, useState } from "react";
import { emptyExtractedPatient, patientQueue } from "../data/idScannerContent";
import { extractCnicDataFromImage } from "../services/cnicOcrService";
import { savePatientRecord } from "../services/idScannerService";
import { addPatientToQueue, sortQueueByPriority } from "../services/queueService";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useIdScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [activeView, setActiveView] = useState("scanner");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrRawText, setOcrRawText] = useState("");
  // Queue is always kept in priority order: Critical -> Urgent -> Normal.
  const [patients, setPatients] = useState(() => sortQueueByPriority(patientQueue));
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [formData, setFormData] = useState(emptyExtractedPatient);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const attachStream = useCallback((stream) => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(console.error);
  }, []);

  async function startCamera() {
    setCameraError("");
    setCapturedImage("");
    setOcrStatus("Opening camera...");
    setScanProgress(0);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not available.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      await sleep(150);
      attachStream(stream);
      setOcrStatus("Camera ready. Align CNIC inside the frame.");
      return true;
    } catch (error) {
      console.error("Camera error:", error);
      setCameraOpen(false);
      setOcrStatus("");
      setCameraError("Cannot open camera. Try uploading a CNIC photo instead.");
      return false;
    }
  }

  function captureCnicFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return "";
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/png", 1);
    setCapturedImage(dataUrl);
    return dataUrl;
  }

  async function typeExtractedDetails(extractedData) {
    const finalData = {
      fullName: extractedData.fullName || "",
      fatherName: extractedData.fatherName || "",
      gender: extractedData.gender || "",
      cnic: extractedData.cnic || "",
      dateOfBirth: extractedData.dateOfBirth || "",
      age: extractedData.age || "",
    };
    setFormData(emptyExtractedPatient);
    setActiveView("form");
    for (const key of Object.keys(finalData)) {
      const value = finalData[key];
      for (let i = 0; i <= value.length; i++) {
        setFormData((prev) => ({ ...prev, [key]: value.slice(0, i) }));
        await sleep(14);
      }
    }
  }

  async function runOcrOnImage(imageDataUrl) {
    setIsScanning(true);
    setCameraError("");
    setOcrStatus("Running OCR on CNIC image...");
    setScanProgress(10);

    try {
      const extracted = await extractCnicDataFromImage(imageDataUrl, (pct) => {
        setScanProgress(Math.min(95, Math.max(10, pct)));
      });

      setOcrRawText(extracted.rawText || "");
      setScanProgress(100);
      setOcrStatus("OCR complete. Auto-filling form...");
      await typeExtractedDetails(extracted);
      setOcrStatus("Fields filled. Review and save.");
    } catch (err) {
      console.error("OCR error:", err);
      setCameraError(err.message || "OCR failed. Try a clearer image with good lighting.");
      setOcrStatus("");
      setScanProgress(0);
    } finally {
      setIsScanning(false);
    }
  }

  async function beginScanSession() {
    if (!selectedPatientId || isScanning) return;
    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.id === selectedPatientId ? "Scanning" : p.status === "Scanning" ? "Waiting" : p.status,
      }))
    );
    setFormData(emptyExtractedPatient);
    setOcrRawText("");
    setScanProgress(0);
    await startCamera();
  }

  async function captureAndProcessCnic() {
    if (isScanning) return;
    setOcrStatus("Capturing CNIC photo...");
    setScanProgress(5);
    const frame = captureCnicFrame();
    if (!frame) {
      setCameraError("Frame capture failed.");
      return;
    }
    stopCamera();
    setCapturedImage(frame);
    await runOcrOnImage(frame);
  }

  // NEW — called when user uploads a file
  async function uploadAndProcessCnic(imageDataUrl) {
    if (!selectedPatientId || isScanning) return;
    stopCamera();
    setCapturedImage(imageDataUrl);
    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.id === selectedPatientId ? "Scanning" : p.status === "Scanning" ? "Waiting" : p.status,
      }))
    );
    await runOcrOnImage(imageDataUrl);
  }

  function closeCameraModal() {
    if (isScanning) return;
    stopCamera();
    setOcrStatus("");
    setScanProgress(0);
  }

  function resetScanner() {
    stopCamera();
    setActiveView("scanner");
    setCameraError("");
    setCapturedImage("");
    setIsScanning(false);
    setScanProgress(0);
    setOcrStatus("");
    setOcrRawText("");
    setFormData(emptyExtractedPatient);
  }

  function selectPatient(patient) {
    if (isScanning) return;
    setSelectedPatientId(patient.id);
  }

  // Called by the Registration Desk / Admin section when a patient arrives:
  // assigns the next dynamic Patient ID + anonymised token and re-sorts the
  // queue so Critical entries jump to the top automatically.
  function registerPatientInQueue(priority) {
    setPatients((previousQueue) => addPatientToQueue(previousQueue, priority));
  }

  function updateFormField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function confirmAndSavePatient() {
    if (!selectedPatientId) return;
    setIsSaving(true);
    const payload = {
      patientId: selectedPatientId,
      token: selectedPatient?.token,
      capturedImage,
      ocrRawText,
      ...formData,
      source: "real-camera-tesseract-ocr",
      createdAt: new Date().toISOString(),
    };
    try {
      await savePatientRecord(payload);
      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatientId
            ? { ...p, status: "Completed", time: "Completed just now" }
            : p
        )
      );
      setSelectedPatientId("");
      resetScanner();
    } finally {
      setIsSaving(false);
    }
  }

  return {
    videoRef, canvasRef,
    activeView, cameraOpen, cameraError, capturedImage,
    isScanning, scanProgress, ocrStatus, ocrRawText,
    patients, selectedPatientId, selectedPatient,
    formData, isSaving,
    beginScanSession,
    captureAndProcessCnic,
    uploadAndProcessCnic,
    closeCameraModal,
    resetScanner,
    selectPatient,
    registerPatientInQueue,
    updateFormField,
    confirmAndSavePatient,
  };
}