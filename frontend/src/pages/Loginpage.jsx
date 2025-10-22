import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password.trim()) return toast.error("Password is required");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;

    const payload = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    const ok = await login(payload);
    if (ok) navigate("/");
  };

  return (
    <div className="h-screen w-full hero-bg">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/">
          <img src="/netflix-logo.png" alt="logo" className="w-52" />
        </Link>
      </header>

      <div className="flex justify-center items-center mt-20 mx-3">
        <div className="w-full max-w-md p-8 space-y-6 bg-black/60 rounded-lg shadow-md">
          <h1 className="text-center text-white text-2xl font-bold mb-4">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="text-sm font-medium text-gray-300 block">
                  Email
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>

                <input
                  type="email"
                  className="w-full pl-11 pr-3 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="text-sm font-medium text-gray-300 block">
                  Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-11 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right mt-1 text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="link link-primary"
              >
                <Link
                  to="/forgot-password"
                  className="font-semibold text-red-600 hover:text-red-700 underline"
                >
                  Forgot Password
                </Link>
              </button>
            </div>

            <div className="form-control pt-4">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-3 mt-4">
            <p className="mt-4 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-red-600 hover:text-red-700 underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
