"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const OTP_LENGTH = 6;

const VerifyOtpComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleVerify = async (otpString: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: decodeURIComponent(email), otp: otpString }) });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Invalid or expired OTP.");
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        toast.success("OTP verified successfully!");
        setTimeout(() => router.push(`/updatepassword?email=${encodeURIComponent(email)}`), 800);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { const code = otp.join(""); if (code.length === OTP_LENGTH) handleVerify(code); }, [otp]);

  return <div className="flex min-h-screen items-center justify-center bg-[#E3E3E3]"><Toaster />
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow"><h1 className="mb-1 text-xl font-semibold">Enter Verification Code</h1><p className="mb-4 text-sm text-slate-500">A 6-digit code was sent to {email}</p>
      <div className="flex justify-center gap-2">{otp.map((digit, index)=><input key={index} ref={(el)=>{inputRefs.current[index]=el;}} value={digit} onChange={(e)=>{const v=e.target.value; if(isNaN(Number(v))) return; const n=[...otp]; n[index]=v.slice(-1); setOtp(n); if(v && index<OTP_LENGTH-1) inputRefs.current[index+1]?.focus();}} onKeyDown={(e)=>{if(e.key==='Backspace' && !otp[index] && index>0) inputRefs.current[index-1]?.focus();}} maxLength={1} className="h-12 w-12 rounded-md border text-center text-xl font-bold" disabled={isLoading} />)}</div>
    </div></div>;
};

export default function VerifyOtpPage(){ return <Suspense fallback={<div>Loading...</div>}><VerifyOtpComponent/></Suspense>; }
