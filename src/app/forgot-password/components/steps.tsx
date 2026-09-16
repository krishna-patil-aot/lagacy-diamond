"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { IUseForgotPasswordReturn } from "@/hooks/use-forgot-password";
import { siteConfig } from "@/config/site.config";

export function RequestOtpStep({ hook }: { hook: IUseForgotPasswordReturn }) {
  const {
    requestForm: {
      register,
      handleSubmit,
      formState: { errors },
    },
    handleRequestOtp,
    isSubmitting,
  } = hook;

  return (
    <form onSubmit={handleSubmit(handleRequestOtp)} className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-medium text-stone-700">
          Registered Email Address
        </label>
        <Input
          type="email"
          placeholder={`client@${siteConfig.domain}`}
          icon={<Mail className="h-4 w-4 text-stone-400" />}
          {...register("email")}
          error={errors.email?.message}
        />
        <p className="mt-1.5 text-[11px] text-stone-500">
          We will dispatch a secure 6-digit one-time verification code to this address.
        </p>
      </div>

      <Button
        type="submit"
        variant="luxury"
        className="w-full justify-center h-11 text-xs font-medium"
        isLoading={isSubmitting}
      >
        Dispatch Verification Code
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-3 w-3 mr-1" /> Back to Vault Sign In
        </Link>
      </div>
    </form>
  );
}

export function VerifyOtpStep({ hook }: { hook: IUseForgotPasswordReturn }) {
  const {
    email,
    verifyForm: {
      register,
      handleSubmit,
      formState: { errors },
    },
    handleVerifyOtp,
    handleVerifyOtpAndLogin,
    handleResendOtp,
    resendCooldown,
    canResend,
    isSubmitting,
    goToStep,
  } = hook;

  return (
    <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-stone-700">
            6-Digit Security Code
          </label>
          <span className="text-[11px] font-mono text-stone-500">{email}</span>
        </div>
        <Input
          type="text"
          maxLength={6}
          placeholder="000000"
          className="text-center tracking-[0.4em] font-mono text-lg font-semibold"
          icon={<KeyRound className="h-4 w-4 text-stone-400" />}
          {...register("otp")}
          error={errors.otp?.message}
        />
        <div className="flex items-center justify-between mt-2 text-[11px]">
          <span className="text-stone-500">Valid for 10 minutes</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isSubmitting}
            className="font-medium text-amber-800 hover:underline disabled:text-stone-400 disabled:no-underline"
          >
            {canResend ? "Resend Code" : `Resend in ${resendCooldown}s`}
          </button>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <Button
          type="submit"
          variant="luxury"
          className="w-full justify-center h-11 text-xs font-medium"
          isLoading={isSubmitting}
        >
          Proceed to Update Password
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleVerifyOtpAndLogin}
          className="w-full justify-center h-11 text-xs border-amber-300/80 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900"
          isLoading={isSubmitting}
        >
          <ShieldCheck className="h-4 w-4 mr-1.5 text-amber-700" />
          Log In Instantly with this Code
        </Button>
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => goToStep("REQUEST_OTP")}
          className="inline-flex items-center text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-3 w-3 mr-1" /> Change Email Address
        </button>
      </div>
    </form>
  );
}

export function ResetPasswordStep({ hook }: { hook: IUseForgotPasswordReturn }) {
  const {
    resetForm: {
      register,
      handleSubmit,
      formState: { errors },
    },
    handleResetPassword,
    isSubmitting,
  } = hook;

  return (
    <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-medium text-stone-700">
          New Vault Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4 text-stone-400" />}
          {...register("password")}
          error={errors.password?.message}
        />
        <p className="mt-1 text-[11px] text-stone-500">Minimum 6 characters</p>
      </div>

      <div>
        <label className="block mb-1 text-xs font-medium text-stone-700">
          Confirm New Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4 text-stone-400" />}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button
        type="submit"
        variant="luxury"
        className="w-full justify-center h-11 text-xs font-medium"
        isLoading={isSubmitting}
      >
        Save New Password &amp; Lock Vault
      </Button>
    </form>
  );
}

export function SuccessStep() {
  return (
    <div className="text-center space-y-5 py-3">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-light text-stone-900">
          Credentials Successfully Updated
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Your vault password has been updated and a security notification was dispatched to your email.
        </p>
      </div>
      <div className="pt-3">
        <Link href="/login">
          <Button variant="luxury" className="w-full justify-center h-11 text-xs font-medium">
            Sign In with New Password
          </Button>
        </Link>
      </div>
    </div>
  );
}
