"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import toast, { Toaster } from "react-hot-toast";
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";

const SendEmail = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);  
  const navigate = useNavigate();
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "User not found");
        setIsLoading(false);
        return;
      }

      const otpCode = data.otp;

      await emailjs.send(
        "service_ekhgoiq",
        "template_bei6puv",
        {
          to_email: email,
          message: otpCode,
        },
        "UotkyMsCOj0Jq6E4g"
      );

      toast.success(`OTP sent successfully! Check your email ${email}`);

      navigate(`/verifyotp?email=${encodeURIComponent(email)}`);

    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Box
        sx={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "100vh", bgcolor: "background.default",
        }}
      >
        <Toaster />
        <Box
          sx={{
            width: { xs: "90%", sm: "400px" }, p: 4, borderRadius: "16px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
            Forgot Password
          </Typography>
          <Box component="form" onSubmit={handleSendOTP}>
            <TextField
              fullWidth label="Enter your email" variant="filled" margin="normal" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ bgcolor: "#e3e3e3", borderRadius: "8px" }} disabled={isLoading}
            />
            <Button
              type="submit" fullWidth variant="contained" disabled={isLoading}
              sx={{
                mt: 2, p: 1.5, bgcolor: "primary.main", borderRadius: "8px",
                "&:hover": { bgcolor: "#343478" },
              }}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </Box>
        </Box>
      </Box>
  );
};

export default SendEmail;