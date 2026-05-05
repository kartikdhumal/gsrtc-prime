"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import emailjs from "emailjs-com";

const SendEmail = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "User not found");
      await emailjs.send("service_ekhgoiq", "template_bei6puv", { to_email: email, message: data.otp }, "UotkyMsCOj0Jq6E4g");
      toast.success(`OTP sent successfully! Check your email ${email}`);
      router.push(`/verifyotp?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="flex min-h-screen items-center justify-center bg-[#E3E3E3] p-4"><Toaster />
    <form onSubmit={handleSendOTP} className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-4 text-center text-xl font-semibold">Forgot Password</h1>
      <input className="w-full rounded-lg border px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" disabled={isLoading} />
      <button disabled={isLoading} className="mt-4 w-full rounded-lg bg-[#212153] py-2 font-semibold text-white hover:bg-[#343478]">{isLoading?"Sending...":"Send OTP"}</button>
    </form></div>;
};

export default SendEmail;
