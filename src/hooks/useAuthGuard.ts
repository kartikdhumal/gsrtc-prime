"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const useAuthGuard = () => {
  const [user, setUser] = useState<any>(null);
  
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = sessionStorage.getItem("currentUser");

    if (!storedUser) {
      toast.error("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Invalid user data in session storage");
      sessionStorage.removeItem("currentUser");
      router.push("/login");
    }
  }, [router]);

  return user;
};
