"use client";

import React from "react";
import { useForgotPassword } from "@/hooks/use-forgot-password";
import {
  RequestOtpStep,
  VerifyOtpStep,
  ResetPasswordStep,
  SuccessStep,
} from "./components/steps";
import { Gem } from "lucide-react";

export default function ForgotPasswordPage() {

  const hook = useForgotPassword();
  const { step, error } = hook;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
            <Gem className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-light tracking-tight text-stone-900">
            {step === "REQUEST_OTP" && "Vault Password Recovery"}
            {step === "VERIFY_OTP" && "Verify Security Code"}
            {step === "RESET_PASSWORD" && "Establish New Password"}
            {step === "SUCCESS" && "Vault Secured"}
          </h1>
          <p className="text-xs text-stone-500">
            {step === "REQUEST_OTP" && "Initiate a one-time cryptographic code recovery for your account."}
            {step === "VERIFY_OTP" && "Enter the 6-digit code received via your email."}
            {step === "RESET_PASSWORD" && "Choose a robust new passphrase for vault access."}
            {step === "SUCCESS" && "Your credentials have been securely stored."}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {step === "REQUEST_OTP" && <RequestOtpStep hook={hook} />}
        {step === "VERIFY_OTP" && <VerifyOtpStep hook={hook} />}
        {step === "RESET_PASSWORD" && <ResetPasswordStep hook={hook} />}
        {step === "SUCCESS" && <SuccessStep />}
      </div>
    </div>
  );
}
