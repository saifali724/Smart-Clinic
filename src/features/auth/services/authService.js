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

  await setDoc(doc(db, "users", user.uid), doctorProfile);

  return doctorProfile;
}

export async function loginDoctor(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const profileRef = doc(db, "users", user.uid);
  const profileSnap = await getDoc(profileRef);

  return {
    uid: user.uid,
    email: user.email,
    profile: profileSnap.exists() ? profileSnap.data() : null,
  };
}

// Old login hook/
export async function loginWithCredentials({ email, password }) {
  return loginDoctor(email, password);
}

export async function logoutDoctor() {
  await signOut(auth);
}