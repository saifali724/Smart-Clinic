import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

export async function signupDoctor({
  fullName,
  email,
  password,
  phone,
  specialization,
  licenseNumber,
  hospitalName,
  designation,
}) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  const doctorProfile = {
    uid: user.uid,
    fullName: fullName || "",
    email: user.email,
    phone: phone || "",
    specialization: specialization || "",
    licenseNumber: licenseNumber || "",
    hospitalName: hospitalName || "",
    designation: designation || "",
    role: "doctor",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // The account is already created at this point. If saving the profile fails
  // (e.g. database rules), still let the doctor in instead of showing "failed".
  try {
    await setDoc(doc(db, "users", user.uid), doctorProfile);
  } catch (error) {
    console.warn("Account created, but the doctor profile couldn't be saved:", error);
  }

  return doctorProfile;
}

export async function loginDoctor(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Reading the profile is extra — a database error must not block the login.
  let profile = null;
  try {
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    profile = profileSnap.exists() ? profileSnap.data() : null;
  } catch (error) {
    console.warn("Logged in, but the doctor profile couldn't be read:", error);
  }

  return {
    uid: user.uid,
    email: user.email,
    profile,
  };
}

// Old login hook/
export async function loginWithCredentials({ email, password }) {
  return loginDoctor(email, password);
}

export async function logoutDoctor() {
  await signOut(auth);
}