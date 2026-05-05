"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) return toast.error("Passwords do not match.");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, confirmPassword }) });
      const data = await res.json();
      if (!res.ok) toast.error(data.message || "Failed to update password.");
      else { toast.success("Password updated successfully!"); setTimeout(()=>router.push("/login"), 1200); }
    } finally { setIsLoading(false); }
  };

  if (!email) return <div className="flex min-h-screen items-center justify-center">Invalid session.</div>;
  return <div className="flex min-h-screen items-center justify-center bg-[#E3E3E3] p-4"><Toaster />
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-3 text-center text-xl font-semibold">Set a New Password</h1>
      <input className="mb-2 w-full rounded border px-3 py-2" value={email} disabled />
      <input className="mb-2 w-full rounded border px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="New password" />
      <input className="w-full rounded border px-3 py-2" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm password" />
      <button className="mt-4 w-full rounded bg-[#212153] py-2 text-white" disabled={isLoading}>{isLoading?"Updating...":"Update Password"}</button>
    </form></div>;
}

export default function ResetPasswordPage(){ return <Suspense fallback={<div>Loading...</div>}><ResetPasswordComponent/></Suspense>; }
