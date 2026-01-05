"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const Register = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");

  const validate = () => {
    let newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setSuccess("");

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await axios.post("/api/register", {
        name,
        email,
        password,
      });

      if (res.status === 201) {
        toast.success("Account created successfully!");
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setErrors({ general: err.response?.data?.error || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#212153",
        }}
      >
        <Box
          sx={{
            width: { xs: "90%", sm: "400px" },
            p: 4,
            borderRadius: "16px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            component="h5"
            gutterBottom
            sx={{ color: "text.primary", fontWeight: "bold" }}
          >
            Welcome to GSRTC!
          </Typography>

          {errors.general && (
            <Typography sx={{ color: "red", mb: 1 }}>{errors.general}</Typography>
          )}
          {success && (
            <Typography sx={{ color: "green", mb: 1 }}>{success}</Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ borderRadius: "8px" }}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ borderRadius: "8px" }}
            />

            <TextField
              fullWidth
              label="Password"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ borderRadius: "8px" }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                p: 1.5,
                bgcolor: "primary.main",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#343478" },
              }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, color: "text.primary" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ textDecoration: "none", color: "#212153" }}>
              Login
            </Link>
          </Typography>
        </Box>
      </Box>
  );
};

export default Register;
