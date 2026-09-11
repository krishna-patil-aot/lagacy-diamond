"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/auth.types";
import { ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackMessage?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  fallbackMessage = "Access restricted to authenticated Foundry Members.",
}: AuthGuardProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
        <span className="text-xs font-mono text-stone-500 uppercase tracking-widest">
          Verifying Vault Security Clearance...
        </span>
      </div>
    );
  }

  // Not logged in -> Show prompt or redirect
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 border border-stone-200">
          <LogIn className="h-8 w-8 text-amber-700" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-light text-stone-900">
            Sign In Required
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            {fallbackMessage} Please authenticate to access your private orders and armored transit tracking.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
            <Button variant="luxury" className="w-full justify-center text-xs">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Your Account
            </Button>
          </Link>
          <Link href={`/register?redirect=${encodeURIComponent(pathname)}`}>
            <Button variant="outline" className="w-full justify-center text-xs">
              Create New Client Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Role check if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-light text-stone-900">
            Security Clearance Restricted
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            This screen requires verified <span className="font-mono font-bold text-amber-900">{requiredRole}</span> privileges. Your current authenticated role is <span className="font-mono">{user.role}</span>.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="luxury" className="w-full justify-center text-xs">
              Return to Safe Client Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
