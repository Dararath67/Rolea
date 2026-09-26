"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams?.get("ref");
    if (refCode) {
      const cleanCode = refCode.trim().toUpperCase();
      localStorage.setItem("rolea_ref_code", cleanCode);
      // Optionally verify with backend
      fetch(`/api/v1/promoter/verify/${cleanCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.valid) {
            console.log("Validated promoter referral code:", cleanCode);
          }
        })
        .catch((err) => console.error("Referral verification error:", err));
    }
  }, [searchParams]);

  return null;
}
