"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserRole } from "@/types/auth.types";
import { ShieldCheck, UserCheck } from "lucide-react";

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, name: string, role: UserRole) => Promise<void>;
  defaultRole?: UserRole;
  isSubmitting?: boolean;
}

export function GoogleSignInModal({
  isOpen,
  onClose,
  onSignIn,
  defaultRole = "CUSTOMER",
  isSubmitting = false,
}: GoogleSignInModalProps) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid Google email address.");
      return;
    }

    setValidationError(null);
    await onSignIn(email.trim(), name.trim(), role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-md">
      <div className="space-y-5">
        {/* Google Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 border border-stone-200">
            <svg className="h-7 w-7" viewBox="0 0 24 24">
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
          </div>
          <h2 className="font-serif text-xl font-light text-stone-900">
            Authenticate with Google ID
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            Provide your real Google account details to store your personalized session in MongoDB.
          </p>
        </div>

        {validationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {validationError}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Your Full Legal Name *
            </label>
            <Input
              placeholder="e.g. Krishna Patil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">
              Google Account Email *
            </label>
            <Input
              type="email"
              placeholder="e.g. yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-medium text-stone-700">
              Clearance Level / Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                  role === "CUSTOMER"
                    ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                    : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Client Member</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                  role === "ADMIN"
                    ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                    : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Vault Admin</span>
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="luxury"
              className="w-full justify-center text-xs h-10"
              isLoading={isSubmitting}
            >
              Confirm Google Sign-In & Save to DB
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center text-xs h-9 text-stone-500 hover:text-stone-800"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
