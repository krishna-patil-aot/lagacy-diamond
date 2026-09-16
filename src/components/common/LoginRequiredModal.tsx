"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Lock,
  LogIn,
  UserPlus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

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
  title = "Sign In Required to Place Order",
  description = "Certified foundry diamond acquisitions require an authenticated client account for tamper-proof GIA/IGI inscription verification and insured Brink's armored delivery.",
}: LoginRequiredModalProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const redirectParam = encodeURIComponent(pathname || "/diamonds");

  return (
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
          {/* 1. Standard Email Sign-In */}
          <Link
            href={`/login?redirect=${redirectParam}`}
            onClick={onClose}
            className="block w-full"
          >
            <Button
              variant="luxury"
              size="md"
              className="w-full justify-center text-xs h-11"
            >
              <LogIn className="h-3.5 w-3.5 mr-2" />
              Sign In with Email &amp; Password
            </Button>
          </Link>

          {/* 2. Register Account */}
          <Link
            href={`/register?redirect=${redirectParam}`}
            onClick={onClose}
            className="block w-full"
          >
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center text-xs h-11"
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
  );
}
