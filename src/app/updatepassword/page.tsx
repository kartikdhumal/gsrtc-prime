"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, TextField, Button, Typography, createTheme } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResetPasswordComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = { password: "", confirmPassword: "" };
    let isValid = true;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be 8+ characters with uppercase, lowercase, number, and special character.";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update password.");
      } else {
        toast.success("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      toast.error("An unexpected server error occurred." , error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Typography color="error">Invalid session. Email parameter is missing.</Typography>
        </Box>
    );
  }

  return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "background.default" }}>
        <Toaster />
        <Box sx={{ width: { xs: "90%", sm: "450px" }, p: 4, borderRadius: "16px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", bgcolor: "background.paper", textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
            Set a New Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Email" variant="filled" margin="normal"
              type="email" value={email || ""} disabled
              sx={{ bgcolor: "#e0e0e0", borderRadius: "8px" }}
            />
            <TextField
              fullWidth label="New Password" variant="filled" margin="normal" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password} helperText={errors.password}
              disabled={isLoading} sx={{ borderRadius: "8px" }}
            />
            <TextField
              fullWidth label="Confirm New Password" variant="filled" margin="normal" type="password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
              disabled={isLoading} sx={{ borderRadius: "8px" }}
            />
            <Button
              type="submit" fullWidth variant="contained" disabled={isLoading}
              sx={{ mt: 2, p: 1.5, bgcolor: "primary.main", borderRadius: "8px", "&:hover": { bgcolor: "#343478" } }}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </Box>
      </Box>
  );
};

const ResetPasswordPage = () => (
  <Suspense fallback={<Box>Loading...</Box>}>
    <ResetPasswordComponent />
  </Suspense>
);

export default ResetPasswordPage;