"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLoginForm } from "@/hooks/useAuthForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Gem, Mail, Lock } from "lucide-react";

import { siteConfig } from "@/config/site.config";

export default function LoginPage() {
  const { form, isSubmitting, error, submitLogin } = useLoginForm();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
            <Gem className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-light tracking-tight text-stone-900">
            {siteConfig.brandName} Client Sign In
          </h1>
          <p className="text-xs text-stone-500">
            Access your solar-cultivated diamond vault, courier certificates, and curator orders.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <React.Suspense fallback={null}>
          <LoginRestrictedAlert />
        </React.Suspense>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(submitLogin)} className="space-y-4">

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Email Address
            </label>
            <Input
              type="email"
              placeholder={`client@${siteConfig.domain}`}
              icon={<Mail className="h-4 w-4 text-stone-400" />}
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-700">
                Vault Access Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-amber-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4 text-stone-400" />}
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <Button
            type="submit"
            variant="luxury"
            className="w-full justify-center h-11 text-xs font-medium"
            isLoading={isSubmitting}
          >
            Access Vault Account
          </Button>
        </form>


        {/* Switch to Register */}
        <div className="text-center text-xs text-stone-500">
          <span>Do not possess a vault account? </span>
          <Link
            href="/register"
            className="font-medium text-stone-900 hover:underline"
          >
            Register Membership
          </Link>
        </div>
      </div>
    </div>
  );
}


function LoginRestrictedAlert() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  if (errorParam !== "restricted") return null;

  return (
    <div className="rounded-xl border border-amber-300/80 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
      <strong>Restricted Access:</strong> Admin Vault access is strictly reserved for the authorized master administrator (engrkrishnapatil@gmail.com).
    </div>
  );
}

