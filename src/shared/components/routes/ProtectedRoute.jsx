// src/shared/components/routes/ProtectedRoute.jsx

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export function ProtectedRoute({ children }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (isCheckingAuth) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-[#070B15] text-white">
        <div className="rounded-[18px] border border-[#26354F] bg-[#121827] px-[28px] py-[22px] text-center shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
          <p className="text-[15px] font-bold text-[#08D4E9]">
            Checking secure session...
          </p>
          <p className="mt-[8px] text-[12px] font-medium text-[#8EA6BE]">
            Please wait while we verify your login.
          </p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;