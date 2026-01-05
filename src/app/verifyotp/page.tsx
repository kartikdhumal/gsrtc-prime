"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, TextField, Typography } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

const VerifyOtpComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"default" | "success" | "error">("default");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleVerify = async (otpString: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: decodeURIComponent(email), otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid or expired OTP.");
        setVerificationStatus("error");
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        toast.success("OTP verified successfully!");
        setVerificationStatus("success");
        setTimeout(() => {
            navigate(`/updatepassword?email=${encodeURIComponent(email || "")}`);
        }, 1000);
      }
    } catch (error) {
      toast.error("An unexpected server error occurred." , error);
      setVerificationStatus("error");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === OTP_LENGTH) {
      handleVerify(otpString);
    }
  }, [otp]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    if (pasteData.length === OTP_LENGTH && !isNaN(Number(pasteData))) {
        setOtp(pasteData.split(''));
        inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const getBorderColor = () => {
      if (verificationStatus === 'success') return 'success.main';
      if (verificationStatus === 'error') return 'error.main';
      return 'primary.main';
  }

  if (!email) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Typography color="error">Email parameter is missing.</Typography>
        </Box>
    );
  }

  return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "background.default" }}>
        <Toaster />
        <Box sx={{ width: { xs: "90%", sm: "450px" }, p: 4, borderRadius: "16px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", bgcolor: "background.paper", textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "text.primary" }}>
            Enter Verification Code
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            A {OTP_LENGTH}-digit code was sent to {email}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, index)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                disabled={isLoading || verificationStatus === 'success'}
                inputProps={{ maxLength: 1, style: { textAlign: "center", fontSize: '1.5rem', fontWeight: 'bold' } }}
                sx={{
                  width: "50px",
                  "& .MuifilledInput-root": {
                    "& fieldset": { borderColor: verificationStatus !== 'default' ? getBorderColor() : 'rgba(0, 0, 0, 0.23)' },
                    "&.Mui-focused fieldset": { borderColor: getBorderColor() },
                    "&:hover fieldset": { borderColor: verificationStatus !== 'default' ? getBorderColor() : 'text.primary' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
  );
};

const VerifyOtpPage = () => (
  <Suspense fallback={<Box>Loading...</Box>}>
    <VerifyOtpComponent />
  </Suspense>
);

export default VerifyOtpPage;