"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IRefreshTokenResponse, IUser } from "@/types/auth.types";

export interface IUseAuthSessionReturn {
  isRefreshing: boolean;
  isLoggingOut: boolean;
  refreshSession: () => Promise<boolean>;
  logout: (allDevices?: boolean) => Promise<boolean>;
}

/**
 * Custom Hook: useAuthSession
 * Encapsulates client-side enterprise session lifecycle controls:
 * 1. Explicit / Background token rotation.
 * 2. Device-specific or global multi-device session revocation.
 */
export function useAuthSession(onUserUpdated?: (user: IUser | null) => void): IUseAuthSessionReturn {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();

  // 1. Explicit or Silent Token Refresh
  const refreshSession = useCallback(async (): Promise<boolean> => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const json = (await res.json()) as IRefreshTokenResponse;
      if (res.ok && json.success) {
        if (json.user && onUserUpdated) {
          onUserUpdated(json.user);
        }
        return true;
      }

      // Session revoked or expired
      if (onUserUpdated) {
        onUserUpdated(null);
      }
      return false;
    } catch (err) {
      console.error("[useAuthSession] Token refresh failed:", err);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [onUserUpdated]);

  // 2. Enterprise Session Revocation & Logout
  const logout = useCallback(
    async (allDevices: boolean = false): Promise<boolean> => {
      setIsLoggingOut(true);
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ allDevices }),
        });

        const json = (await res.json()) as { success: boolean; message?: string; error?: string };
        if (json.success) {
          if (onUserUpdated) {
            onUserUpdated(null);
          }
          toast.success(
            allDevices
              ? "All active device sessions revoked successfully."
              : "Signed out securely."
          );
          router.push("/login");
          router.refresh();
          return true;
        } else {
          toast.error("Logout failed", { description: json.error });
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to sign out";
        toast.error("Logout Error", { description: msg });
        return false;
      } finally {
        setIsLoggingOut(false);
      }
    },
    [onUserUpdated, router]
  );

  return {
    isRefreshing,
    isLoggingOut,
    refreshSession,
    logout,
  };
}
