// App.jsx
import { useEffect } from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "./store/useAuthStore.js";

import HomePage from "./pages/home/HomePage.jsx";
import LoginPage from "./pages/Loginpage";
import SignUpPage from "./pages/SignUppage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SearchHistoryPage from "./pages/SearchHistoryPage.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgetPasswordPage from "./pages/ForgetPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";
import NotFoundPage from "./pages/404Page.jsx";
import Footer from "./component/Footer.jsx";

// ----- Route guards -----
function RequireAuth() {
  const { user } = useAuthStore();
  // If there's no user, never mount children → no data fetch calls → no 401s
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnly() {
  const { user } = useAuthStore();
  // Logged-in users shouldn't see login/signup
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  const { isCheckingAuth, authCheck } = useAuthStore();

  useEffect(() => {
    authCheck();
  }, [authCheck]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen">
        <div className="flex justify-center items-center bg-black h-full">
          <Loader className="animate-spin text-red-600 size-10" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public pages anyone can see */}
        <Route path="/" element={<HomePage />} />
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Public utility pages (no user required) */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected pages: mounted only when user is present */}
        <Route element={<RequireAuth />}>
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/history" element={<SearchHistoryPage />} />
        </Route>

        {/* 404 */}
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
      <Toaster />
    </>
  );
}
