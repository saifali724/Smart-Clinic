// src/features/patientRecord/hooks/useCurrentDoctor.js
// The doctor who is logged in right now — name and specialization come from
// users/{uid}, which the Sign Up screen saves.

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

export function useCurrentDoctor() {
  const [state, setState] = useState({ doctor: null, isLoading: true });

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState({ doctor: null, isLoading: false });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.exists() ? snap.data() : {};
        if (!cancelled) {
          setState({
            doctor: {
              uid: user.uid,
              fullName: profile.fullName || user.displayName || user.email || "",
              specialization: profile.specialization || "",
            },
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Could not load doctor profile:", error);
        if (!cancelled) {
          setState({
            doctor: { uid: user.uid, fullName: user.displayName || user.email || "", specialization: "" },
            isLoading: false,
          });
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}

export default useCurrentDoctor;
