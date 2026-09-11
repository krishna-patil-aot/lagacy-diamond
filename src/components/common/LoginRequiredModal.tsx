"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoogleSignInModal } from "@/components/common/GoogleSignInModal";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/auth.types";
import {
  Lock,
  LogIn,
  UserPlus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount?: number;
  onLoginSuccess?: () => void;
  title?: string;
  description?: string;
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  cartCount = 0,
  onLoginSuccess,
  title = "Sign In Required to Place Order",
  description = "Certified foundry diamond acquisitions require an authenticated client account for tamper-proof GIA/IGI inscription verification and insured Brink's armored delivery.",
}: LoginRequiredModalProps) {
  const pathname = usePathname();
  const { login } = useAuthStore();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async (email: string, name: string, role: UserRole) => {
    setIsSubmitting(true);
    try {
      const encodedName = encodeURIComponent(name.trim());
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=0F172A&color=F8FAFC&bold=true`;

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        googleId: `goog-${Date.now()}`,
        avatarUrl,
        role,
      };

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Google Sign-In failed");
      }

      login(json.data.user, json.data.token);
      toast.success(`Welcome, ${json.data.user.name}!`, {
        description: "Authenticated successfully. You can now proceed with your order.",
      });

      setIsGoogleModalOpen(false);
      onClose();

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google Sign-In failed";
      toast.error("Authentication Error", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectParam = encodeURIComponent(pathname || "/diamonds");

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        className="max-w-md p-6 sm:p-7"
      >
        <div className="space-y-6 text-center">
          {/* Lock Emblem & Cart Badge */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-stone-50 border border-stone-800 shadow-md">
              <Lock className="h-6 w-6 text-amber-300" />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-950 font-mono text-[9px] font-bold">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>

            {cartCount > 0 && (
              <Badge variant="gold" className="text-[10px] font-mono gap-1 py-0.5 px-2">
                <ShoppingBag className="h-3 w-3" />
                <span>{cartCount} diamond(s) reserved in your vault cart</span>
              </Badge>
            )}
          </div>

          {/* Heading & Context */}
          <div className="space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* 1. Direct Google 1-Click Sign-In */}
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-stone-300/90 bg-white py-2.5 px-4 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 hover:border-stone-400 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Instant Sign In with Google</span>
            </button>

            {/* 2. Standard Email Sign-In */}
            <Link
              href={`/login?redirect=${redirectParam}`}
              onClick={onClose}
              className="block w-full"
            >
              <Button
                variant="luxury"
                size="md"
                className="w-full justify-center text-xs h-10"
              >
                <LogIn className="h-3.5 w-3.5 mr-2" />
                Sign In with Email & Password
              </Button>
            </Link>

            {/* 3. Register Account */}
            <Link
              href={`/register?redirect=${redirectParam}`}
              onClick={onClose}
              className="block w-full"
            >
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center text-xs h-10"
              >
                <UserPlus className="h-3.5 w-3.5 mr-2" />
                Register New Client Account
              </Button>
            </Link>
          </div>

          {/* Security Guarantee Note */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Selections remain saved in your vault cart while signing in</span>
          </div>
        </div>
      </Dialog>

      {/* Embedded Google Sign-In Dialog for seamless checkout auth */}
      {isGoogleModalOpen && (
        <GoogleSignInModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSignIn={handleGoogleSignIn}
          defaultRole="CUSTOMER"
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
