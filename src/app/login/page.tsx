"use client";
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'

// Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      const obj = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        coverImage: data.user.coverImage,
        token: data.token
      }

      sessionStorage.setItem("currentUser", JSON.stringify(obj));
      toast.success("Login successful");

      if (data.user.role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/home");
      }

    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center bg-[#212153] justify-center bg-gsrtc-light p-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-6">
        <div className="flex flex-col items-center">
          <Image src={"/images/gsrtclogo.png"} alt='logo' width={75} height={75} />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm transition-all duration-300 ease-in-out focus:border-gsrtc-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gsrtc-dark"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm transition-all duration-300 ease-in-out focus:border-gsrtc-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gsrtc-dark"
              required
            />
          </div>

          <div className="text-right">
            <Link
              href="/sendemail"
              className="text-sm font-medium text-gsrtc-dark hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* New Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center bg-[#212153] cursor-pointer rounded-lg bg-gsrtc-dark py-3 px-4 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-gsrtc-dark focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <LoadingSpinner />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-gsrtc-dark hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

