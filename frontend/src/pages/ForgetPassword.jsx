import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axiosInstance";
import { Link } from "react-router-dom";

export default function ForgetPasswordPage() {
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });

  const validateForm = () => {
    const email = formData.email.trim();
    if (!email) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm() !== true) return;
    try {
      setSending(true);
      await axiosInstance.post("/api/auth/forgot-password", {
        email: formData.email.trim().toLowerCase(),
      });
      toast.success("If that email exists, a reset link has been sent.");
      setFormData({ email: "" });
    } catch (error) {
      toast.error(error.response.data.message || "Email failed");
    } finally {
      setSending(false);
    }
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
            Forgot Password
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

            <div className="form-control pt-4">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-4 text-center">
            If the account exists, we&apos;ll email a reset link.
          </p>
        </div>
      </div>
    </div>
  );
}
