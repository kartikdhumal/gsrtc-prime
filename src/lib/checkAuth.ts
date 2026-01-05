"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isTokenValid } from "@/lib/authHelper";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const userData = sessionStorage.getItem("currentUser");

    if (!userData) {
      router.replace("/login");
      return;
    }

    const { token } = JSON.parse(userData);
    const valid = isTokenValid(token);

    if (!valid) {
      sessionStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);
}
