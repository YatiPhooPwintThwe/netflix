import toast from "react-hot-toast";
import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance.js";

export const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isCheckingAuth: false,

  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/api/auth/signup", credentials);
      set({ user: response.data.user, isSigningUp: false });
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
      set({ isSigningUp: false, user: null });
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/api/auth/login", credentials);
      set({ user: response?.data?.user || null, isLoggingIn: false });
      toast.success("Logged In successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      set({ isLoggingIn: false, user: null });
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/api/auth/logout");
      set({ user: null });
      toast.success("Logged Out successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
      return false;
    } finally {
      set({ isLoggingOut: false });
    }
  },

  authCheck: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get("/api/auth/check-auth");
      set({ user: response.data.user, isCheckingAuth: false });
    } catch (error) {
      set({ isCheckingAuth: false, user: null });
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  },

  verifyEmail: async (code) => {
    try {
      const response = await axiosInstance.post("api/auth/verify-email", { code });
      if (response?.data?.user) set({ user: response.data.user });
      toast.success("Email verified successfully");
      return response?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed");
      return null;
    }
  },
}));
