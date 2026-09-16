export type UserRole = "ADMIN" | "CUSTOMER";

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  authProvider: "credentials" | "google";
  createdAt: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type OtpPurpose = "FORGOT_PASSWORD" | "LOGIN_VERIFY";

export interface IOtpDocument {
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface IResetPasswordRequest {
  email: string;
  resetToken: string;
  password: string;
  confirmPassword: string;
}

export interface IOtpVerificationResult {
  verified: boolean;
  resetToken?: string;
  message: string;
}

export type ForgotPasswordStep =
  | "REQUEST_OTP"
  | "VERIFY_OTP"
  | "RESET_PASSWORD"
  | "SUCCESS";

