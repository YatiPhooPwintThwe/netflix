import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.jsx";
import LoginPage from "./pages/Loginpage";
import SignUpPage from "./pages/SignUppage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import Footer from "./component/Footer.jsx";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import SearchPage from "./pages/SearchPage.jsx";
import SearchHistoryPage from "./pages/SearchHistoryPage.jsx";
import NotFoundPage from "./pages/404Page.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgetPasswordPage from "./pages/ForgetPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";

function App() {
  const { user, isCheckingAuth, authCheck } = useAuthStore();

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
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/watch/:type/:id"
          element={user ? <WatchPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/search"
          element={user ? <SearchPage /> : <Navigate to={"/login"} />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/history"
          element={user ? <SearchHistoryPage /> : <Navigate to={"/login"} />}
        />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Footer />

      <Toaster />
    </>
  );
}

export default App;
