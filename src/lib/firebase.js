// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQ0gV0W-_rj_cU982_8MQ41n3yXl8Nx2M",
  authDomain: "smart-clinic-b5b6d.firebaseapp.com",
  projectId: "smart-clinic-b5b6d",
  storageBucket: "smart-clinic-b5b6d.firebasestorage.app",
  messagingSenderId: "710160364636",
  appId: "1:710160364636:web:5235f01cae46aec879e299",
  measurementId: "G-P0H5SMKNBZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;