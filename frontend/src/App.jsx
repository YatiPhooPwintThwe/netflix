// App.jsx
import { Route, Routes, Navigate } from "react-router-dom";
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

export default function App() {
  // just read the current user; DO NOT call authCheck here
  const { user } = useAuthStore();

  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUpPage />} />

        {/* Public utility pages */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* “Protected” pages, inline check — no Outlet/guards */}
        <Route path="/watch/:type/:id" element={user ? <WatchPage /> : <Navigate to="/login" replace />} />
        <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/login" replace />} />
        <Route path="/history" element={user ? <SearchHistoryPage /> : <Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
      <Toaster />
    </>
  );
}
