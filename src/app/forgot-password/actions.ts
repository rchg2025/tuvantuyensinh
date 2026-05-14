"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  if (!email) redirect("/forgot-password?error=not_found");

  const user = await prisma.systemUser.findUnique({ where: { email } });
  if (!user) {
    redirect("/forgot-password?error=not_found");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15); // Valid for 15 minutes

  try {
    await prisma.systemUser.update({
      where: { email },
      data: { otp, otpExpiry: expiry }
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "cokhinsg@gmail.com", // Fallbacks to let them test it or use env
        pass: process.env.EMAIL_PASS || "ixox jzzy hqkd okqr", // Dummy app password for example or from env
      },
    });

    await transporter.sendMail({
      from: '"Tu Van Tuyen Sinh" <noreply@nsg.edu.vn>',
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 15 phút.`,
      html: `<h3>Mã OTP đặt lại mật khẩu</h3><p>Mã của bạn là: <strong>${otp}</strong></p><p>Mã này có hiệu lực trong 15 phút.</p>`
    });

    redirect(`/forgot-password?step=2&email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Forgot pass error:", err);
    redirect("/forgot-password?error=send_failed");
  }
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const otp = formData.get("otp")?.toString().trim();
  const password = formData.get("password")?.toString().trim();

  if (!email || !otp || !password) redirect("/forgot-password?error=invalid_otp");

  const user = await prisma.systemUser.findUnique({ where: { email } });
  if (!user || user.otp !== otp || !user.otpExpiry || new Date() > user.otpExpiry) {
    redirect(`/forgot-password?step=2&email=${encodeURIComponent(email)}&error=invalid_otp`);
  }

  try {
    await prisma.systemUser.update({
      where: { email },
      data: {
        password: password, // For production, should be hashed!
        otp: null,
        otpExpiry: null
      }
    });
    redirect("/login");
  } catch (err) {
    redirect("/forgot-password?error=db_error");
  }
}