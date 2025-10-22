export const VERIFICATION_EMAIL_TEMPLATE = `

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>

    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Netflix Team</p>

  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>

</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>

    </div>

    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>

    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>

    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Netflix Team</p>

  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>

</body>
</html>
`;

// emailTemplates.js
export const passwordResetRequestTemplate = (resetURL) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f5;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:#4caf50;color:#fff;text-align:center;padding:28px 20px;font-family:Arial, Helvetica, sans-serif;font-size:28px;font-weight:700;">
                Password Reset
              </td>
            </tr>

            <tr>
              <td style="padding:28px 24px;font-family:Arial, Helvetica, sans-serif;color:#111;line-height:1.6;">
                <p>Hello,</p>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <p>To reset your password, click the button below:</p>

                <p style="text-align:center;margin:28px 0;">
                  <a href="${resetURL}" target="_blank"
                     style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;">
                    Reset Password
                  </a>
                </p>

                <p style="color:#555;">This link will expire in 1 hour for security reasons.</p>
                <p>Best regards,<br/>Netflix Team</p>
              </td>
            </tr>

            <tr>
              <td style="text-align:center;color:#777;background:#fafafa;padding:16px;font-size:12px;font-family:Arial, Helvetica, sans-serif;">
                This is an automated message, please do not reply to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;


