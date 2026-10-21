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

export interface IRateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowMs: number;
  identifier?: string;
}

export interface IRateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSec: number;
}

export interface ISession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  familyId: string;
  isRevoked: boolean;
  revokedAt?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  user?: IUser;
  error?: string;
}

