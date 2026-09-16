"use client";

import React, { useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { IUser } from "@/types/auth.types";

export interface AuthProviderProps {
  initialUser: IUser | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const initializedRef = useRef<boolean | null>(null);

  if (initializedRef.current == null) {
    initializedRef.current = true;
    useAuthStore.setState({
      user: initialUser,
      isAuthenticated: Boolean(initialUser),
      isLoading: false,
    });
  }

  return <>{children}</>;
}
