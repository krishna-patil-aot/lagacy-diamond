"use client";

import React from "react";
import Link from "next/link";
import { useRegisterForm } from "@/hooks/useAuthForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Gem, Mail, Lock, User as UserIcon } from "lucide-react";

import { siteConfig } from "@/config/site.config";

export default function RegisterPage() {
  const { form, isSubmitting, error, submitRegister } = useRegisterForm();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
            <Gem className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-light tracking-tight text-stone-900">
            Acquire Client Membership
          </h1>
          <p className="text-xs text-stone-500">
            Register to curate lab-grown diamonds directly from our foundry and access bespoke pricing.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(submitRegister)} className="space-y-4">

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Full Legal Name
            </label>
            <Input
              placeholder="e.g. Christian Sterling"
              icon={<UserIcon className="h-4 w-4 text-stone-400" />}
              {...register("name")}
              error={errors.name?.message}
            />
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4 text-stone-400" />}
                {...register("password")}
                error={errors.password?.message}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">
                Confirm
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4 text-stone-400" />}
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="luxury"
            className="w-full justify-center h-11 text-xs font-medium"
            isLoading={isSubmitting}
          >
            Create Private Membership
          </Button>
        </form>

        {/* Switch to Login & Forgot Password */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 pt-1">
          <div>
            <span>Already registered? </span>
            <Link
              href="/login"
              className="font-medium text-stone-900 hover:underline"
            >
              Sign In Here
            </Link>
          </div>
          <Link
            href="/forgot-password"
            className="font-medium text-amber-800 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

