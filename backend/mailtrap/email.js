import dotenv from "dotenv";

dotenv.config();

import {
  passwordResetRequestTemplate,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  
} from "./emailTemplate.js";

import { mailtrapClient, sender } from "./mailtrp.config.js";

export async function sendVerificationEmail(email, verificationToken) {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);

    throw new Error(`Error sending verification email: ${error}`);
  }
}

export async function sendPasswordResetEmail(email, resetURL) {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: passwordResetRequestTemplate(resetURL),  // ✅ clickable <a>
      
      category: "Password Reset",
    });
    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
}

export async function sendResetSuccessEmail(email) {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,

      to: recipient,

      subject: "Password Reset Successful",

      html: PASSWORD_RESET_SUCCESS_TEMPLATE,

      category: "Password Reset",
    });

    console.log("Password reset successful email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset successful email", error);

    throw new Error(`Error sending password reset successful email" ${error}`);
  }
}
