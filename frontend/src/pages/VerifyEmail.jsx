import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore.js";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setCode(["", "", "", "", "", ""]);
    setHasInteracted(false);
  }, []);

  const doVerify = useCallback(
    async (verificationCode) => {
      setIsLoading(true);
      try {
        await verifyEmail(verificationCode);
        toast.success("Email verified successfully");
        localStorage.removeItem("emailChanged");
        navigate("/login");
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Invalid or expired code"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [verifyEmail, navigate]
  );

  const handleChange = (index, value) => {
    const v = value.replace(/\D/g, ""); // digits only
    const next = [...code];
    setHasInteracted(true);

    if (v.length > 1) {
      const pasted = v.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
      setCode(next);

      const lastFilled = next.findLastIndex((d) => d !== "");
      const focusIndex = lastFilled < 5 ? lastFilled + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      next[index] = v;
      setCode(next);
      if (v && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    const next = [...code];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] || "";
    setCode(next);
    setHasInteracted(true);
    // Auto-submit is handled by the effect below.
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (
      !hasInteracted ||
      verificationCode.length !== 6 ||
      code.some((d) => d === "" || isNaN(d))
    ) {
      return;
    }
    doVerify(verificationCode);
  };

  useEffect(() => {
    const allValid = code.every((d) => d !== "" && !isNaN(d));
    if (hasInteracted && allValid) {
      const t = setTimeout(() => doVerify(code.join("")), 300);
      return () => clearTimeout(t);
    }
  }, [code, hasInteracted, doVerify]);

  return (
    <div className="h-screen w-full hero-bg">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/">
          <img src="/netflix-logo.png" alt="logo" className="w-52" />
        </Link>
      </header>

      <div className="flex flex-col justify-center items-center p-6 sm:p-12 w-full max-w-lg mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-md bg-white/5 rounded-2xl px-6 py-8 shadow-lg w-full max-w-sm border border-white/10"
        >
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="h-12 w-12 rounded-xl bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors" />
              <h2 className="text-2xl font-bold text-center mb-4 text-red-500">
                Verify your email
              </h2>
              <p className="text-center text-sm text-base-content/60 mb-6">
                Enter the 6-digit code sent to your email address
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || code.some((d) => !d)}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Motion.button>
          </form>
        </Motion.div>
      </div>
    </div>
  );
}
