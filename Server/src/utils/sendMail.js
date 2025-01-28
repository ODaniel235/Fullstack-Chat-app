import nodemailer from "nodemailer";
const sendOTPByEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTPUSER,
      pass: process.env.SMTPPASSWORD,
    },
  });
  const mailOptions = {
    from: "Chat App",
    to: email,
    subject: "Verify your identity",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Identity</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Inter", sans-serif;
        background-color: #18181b;
        color: #e4e4e7;
      }

      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background: #1f2937;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }

      .email-header {
        background: linear-gradient(90deg, #4f46e5, #9333ea);
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
      }

      .email-body {
        padding: 32px;
        font-size: 16px;
        line-height: 1.6;
        color: #d1d5db;
        text-align: center;
      }

      .email-body p {
        margin: 0 0 16px;
      }

      .otp-box {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin: 24px 0;
      }

      .otp-box span {
        width: 60px;
        height: 60px;
        background: #292524;
        color: #a78bfa;
        border: 2px solid #4f46e5;
        border-radius: 12px;
        font-size: 24px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
        box-sizing: border-box;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeIn 0.8s ease-out;
      }

      .otp-box span:focus {
        outline: none;
        box-shadow: 0 0 10px rgba(75, 192, 192, 0.8);
        transform: scale(1.1);
      }

      .otp-box span:hover {
        transform: scale(1.1);
        border-color: #9333ea;
      }

      .email-footer {
        text-align: center;
        font-size: 14px;
        color: #9ca3af;
        padding: 16px 32px;
        border-top: 1px solid #374151;
      }

      .email-footer a {
        color: #8b5cf6;
        text-decoration: none;
        font-weight: bold;
      }

      .email-footer a:hover {
        text-decoration: underline;
        color: #a78bfa;
      }

      /* Animation for OTP Digits */
      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(-20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Media Queries for mobile responsiveness */
      @media (max-width: 600px) {
        .otp-box {
          gap: 10px;
        }

        .otp-box span {
          width: 50px;
          height: 50px;
          font-size: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">Verify Your Identity</div>
      <div class="email-body">
        <p>Hi ${name},</p>
        <p>
          You're receiving this email because we received a request to verify your identity. Use the OTP below to complete your verification:
        </p>
        <div class="otp-box">
          <span>${otp[0]}</span>
          <span>${otp[1]}</span>
          <span>${otp[2]}</span>
          <span>${otp[3]}</span>
          <span>${otp[4]}</span>
          <span>${otp[5]}</span>
        </div>
        <p>
          If you didn't request this, please ignore this email. Your account remains secure.
        </p>
        <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
          This OTP will expire in 30 minutes.
        </p>
      </div>
      <div class="email-footer">
        <p>
          Need help? <a href="https://wa.me/+2348143709885">Contact Support</a>
        </p>
        <p>©2025 ChatApp. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

`,
  };
  await transporter.sendMail(mailOptions);
};
export default sendOTPByEmail;
