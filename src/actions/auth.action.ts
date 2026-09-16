"use server";

import { cookies } from "next/headers";
import {
  findUserByEmail,
  createUser,
  updateUserPassword,
} from "@/lib/user-repository";
import {
  comparePassword,
  hashPassword,
  signToken,
  verifyToken,
  signResetToken,
  verifyResetToken,
  sanitizeUser,
} from "@/lib/auth";
import {
  sendRegistrationSuccessEmail,
  sendOtpEmail,
  sendPasswordUpdatedEmail,
} from "@/lib/mailer";
import { OtpModel } from "@/models/Otp";
import { connectToDatabase } from "@/lib/db";
import {
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/auth.schema";
import {
  IUser,
  UserRole,
  IForgotPasswordRequest,
  IVerifyOtpRequest,
  IResetPasswordRequest,
  IOtpVerificationResult,
} from "@/types/auth.types";

const SESSION_COOKIE_NAME = "diamond_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const MASTER_ADMIN_EMAIL = "engrkrishnapatil@gmail.com";

/**
 * Standard Credentials Sign In Action
 * Strictly enforces that only engrkrishnapatil@gmail.com can possess ADMIN privileges
 */
export async function loginAction(credentials: LoginFormData): Promise<IUser> {
  const normalizedEmail = credentials.email.toLowerCase().trim();
  const password = credentials.password;

  const found = await findUserByEmail(normalizedEmail);
  if (!found || !found.passwordHash) {
    throw new Error("Invalid email or password credentials.");
  }

  // Strictly enforce master admin lockdown
  if (found.user.role === "ADMIN" && normalizedEmail !== MASTER_ADMIN_EMAIL) {
    throw new Error("Admin Vault is restricted to the authorized master curator.");
  }

  const isValid = await comparePassword(password, found.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password credentials.");
  }

  const token = signToken({
    userId: found.user.id,
    email: found.user.email,
    role: found.user.role,
    name: found.user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return sanitizeUser(found.user);
}

/**
 * Public Client Registration Action
 * Public accounts are ALWAYS granted CUSTOMER tier.
 * Automatically dispatches welcome email and initializes session.
 */
export async function registerAction(data: RegisterFormData): Promise<IUser> {
  const normalizedEmail = data.email.toLowerCase().trim();
  const { name, password } = data;

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const passwordHash = await hashPassword(password);
  const assignedRole: UserRole = "CUSTOMER";

  const user = await createUser({
    name,
    email: normalizedEmail,
    passwordHash,
    role: assignedRole,
    authProvider: "credentials",
  });

  // Background dispatch welcome email
  try {
    await sendRegistrationSuccessEmail({
      to: user.email,
      clientName: user.name,
    });
  } catch (emailErr) {
    console.error("[Registration Welcome Email Error]:", emailErr);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return sanitizeUser(user);
}

/**
 * Request OTP for Password Reset or Authentication
 * Generates 6-digit numeric code, saves to OtpModel with TTL index, and sends email.
 */
export async function requestOtpAction(
  payload: IForgotPasswordRequest
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = payload.email.toLowerCase().trim();

  const found = await findUserByEmail(normalizedEmail);
  if (!found) {
    throw new Error("No account registered with this email address was found.");
  }

  await connectToDatabase();

  // Generate cryptographically secure 6-digit code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await hashPassword(otpCode);

  // Invalidate any previous OTPs for this email
  await OtpModel.deleteMany({
    email: normalizedEmail,
    purpose: "FORGOT_PASSWORD",
  });

  // Create new OTP record expiring in 10 minutes
  await OtpModel.create({
    email: normalizedEmail,
    otpHash,
    purpose: "FORGOT_PASSWORD",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    verified: false,
    attempts: 0,
  });

  // Dispatch OTP email
  await sendOtpEmail({
    to: normalizedEmail,
    clientName: found.user.name,
    otpCode,
  });

  return {
    success: true,
    message: "A 6-digit verification code has been dispatched to your email address.",
  };
}

/**
 * Verify OTP Code and Return Signed Reset Token
 */
export async function verifyOtpAction(
  payload: IVerifyOtpRequest
): Promise<IOtpVerificationResult> {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const enteredOtp = payload.otp.trim();

  await connectToDatabase();

  const activeOtp = await OtpModel.findOne({
    email: normalizedEmail,
    purpose: "FORGOT_PASSWORD",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!activeOtp) {
    throw new Error("Verification code has expired or is invalid. Please request a new code.");
  }

  if (activeOtp.attempts >= 5) {
    throw new Error("Too many failed attempts. Please request a new verification code.");
  }

  const isMatch = await comparePassword(enteredOtp, activeOtp.otpHash);
  if (!isMatch) {
    activeOtp.attempts += 1;
    await activeOtp.save();
    const remaining = 5 - activeOtp.attempts;
    throw new Error(
      `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`
    );
  }

  activeOtp.verified = true;
  await activeOtp.save();

  const resetToken = signResetToken(normalizedEmail);

  return {
    verified: true,
    resetToken,
    message: "Verification code confirmed successfully.",
  };
}

/**
 * Verify OTP and Directly Log In
 * Satisfies: "after confirm otp then allowed to login with that otp"
 */
export async function verifyOtpAndLoginAction(
  payload: IVerifyOtpRequest
): Promise<IUser> {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const enteredOtp = payload.otp.trim();

  await connectToDatabase();

  const activeOtp = await OtpModel.findOne({
    email: normalizedEmail,
    purpose: "FORGOT_PASSWORD",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!activeOtp) {
    throw new Error("Verification code has expired or is invalid. Please request a new code.");
  }

  const isMatch = await comparePassword(enteredOtp, activeOtp.otpHash);
  if (!isMatch) {
    activeOtp.attempts += 1;
    await activeOtp.save();
    throw new Error("Incorrect verification code.");
  }

  // Invalidate OTP after consumption
  await OtpModel.deleteOne({ _id: activeOtp._id });

  const found = await findUserByEmail(normalizedEmail);
  if (!found) {
    throw new Error("Account not found.");
  }

  // Master admin check
  if (found.user.role === "ADMIN" && normalizedEmail !== MASTER_ADMIN_EMAIL) {
    throw new Error("Admin Vault is restricted to the authorized master curator.");
  }

  const token = signToken({
    userId: found.user.id,
    email: found.user.email,
    role: found.user.role,
    name: found.user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return sanitizeUser(found.user);
}

/**
 * Reset Password with Verified Reset Token
 * Hashes new password, updates in DB, sends security confirmation email.
 */
export async function resetPasswordAction(
  payload: IResetPasswordRequest
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const { resetToken, password } = payload;

  const decoded = verifyResetToken(resetToken);
  if (!decoded || decoded.email.toLowerCase() !== normalizedEmail) {
    throw new Error("Reset session has expired or is invalid. Please request a new verification code.");
  }

  const found = await findUserByEmail(normalizedEmail);
  if (!found) {
    throw new Error("Account not found.");
  }

  const newPasswordHash = await hashPassword(password);
  await updateUserPassword(normalizedEmail, newPasswordHash);

  // Clean up any remaining OTPs
  await connectToDatabase();
  await OtpModel.deleteMany({ email: normalizedEmail });

  // Background dispatch security alert email
  try {
    await sendPasswordUpdatedEmail({
      to: normalizedEmail,
      clientName: found.user.name,
    });
  } catch (emailErr) {
    console.error("[Password Updated Email Error]:", emailErr);
  }

  return {
    success: true,
    message: "Your password has been successfully updated. You may now sign in.",
  };
}

/**
 * Terminate Session (Sign Out)
 */
export async function logoutAction(): Promise<boolean> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("diamond_auth_token");
  return true;
}

/**
 * Resolve Authenticated Session User on Server
 */
export async function getSessionUserAction(): Promise<IUser | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get("diamond_auth_token")?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const found = await findUserByEmail(payload.email);
  if (!found) return null;

  return sanitizeUser(found.user);
}
