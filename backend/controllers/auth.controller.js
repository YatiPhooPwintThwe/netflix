import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generatetoken.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
} from "../mailtrap/email.js";
export async function signup(req, res) {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    password = String(password).trim();
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with at least 1 uppercase, lowercase and special letter",
      });
    }

    const existing = await User.findOne({ $or: [{ email }, { name }] });

    if (existing) {
      const msg =
        existing.email === email
          ? "Email already in use"
          : "Username already in use";

      return res.status(409).json({ success: false, message: msg });
    }

    const verificationToken = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiresAt: expiresAt,
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error("Verification email failed", emailError.message);
    }

    generateTokenAndSetCookie(user._id, res);

    return res.status(201).json({
      success: true,

      message: "User created successfully",

      user: { name: user.name, email: user.email, image: user.image },
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateTokenAndSetCookie(user._id, res);
    return res.status(201).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { code } = req.body;
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);

    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export async function forgotPassword(req, res) {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hr
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log("Reset Link:", resetLink);
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      success: true,
      message: "Password reset link is sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const password = (req.body?.password ?? req.body?.newPassword ?? "").trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include upper, lower, number, special",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const same = await bcrypt.compare(password, user.password);
    if (same) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendResetSuccessEmail(user.email);

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}



export async function checkAuth(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    res.set("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id ?? req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
