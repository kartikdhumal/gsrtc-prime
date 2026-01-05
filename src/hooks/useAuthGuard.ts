"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useAuthGuard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = sessionStorage.getItem("currentUser");

    if (!storedUser) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Invalid user data in session storage");
      sessionStorage.removeItem("currentUser");
      navigate("/login");
    }
  }, [router]);

  return user;
};
