"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/auth.types";

export interface IUseLoginFormReturn {
  form: UseFormReturn<LoginFormData>;
  isSubmitting: boolean;
  error: string | null;
  submitLogin: (data: LoginFormData) => Promise<void>;
  handleGoogleLogin: (email?: string, name?: string, role?: UserRole) => Promise<void>;
  isGoogleModalOpen: boolean;
  setIsGoogleModalOpen: (open: boolean) => void;
}

export function useLoginForm(): IUseLoginFormReturn {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Login failed");
      }

      login(json.data.user, json.data.token);

      if (json.data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/diamonds");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (
    email?: string,
    name?: string,
    role: UserRole = "CUSTOMER"
  ) => {
    if (!email || !name) {
      setIsGoogleModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

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
      setIsGoogleModalOpen(false);

      if (json.data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/diamonds");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google Sign-In failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    submitLogin,
    handleGoogleLogin,
    isGoogleModalOpen,
    setIsGoogleModalOpen,
  };
}

export interface IUseRegisterFormReturn {
  form: UseFormReturn<RegisterFormData>;
  isSubmitting: boolean;
  error: string | null;
  submitRegister: (data: RegisterFormData) => Promise<void>;
  handleGoogleLogin: (email?: string, name?: string, role?: UserRole) => Promise<void>;
  isGoogleModalOpen: boolean;
  setIsGoogleModalOpen: (open: boolean) => void;
}

export function useRegisterForm(): IUseRegisterFormReturn {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
    },
  });

  const submitRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Registration failed");
      }

      login(json.data.user, json.data.token);

      if (json.data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/diamonds");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (
    email?: string,
    name?: string,
    role: UserRole = "CUSTOMER"
  ) => {
    if (!email || !name) {
      setIsGoogleModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

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
      setIsGoogleModalOpen(false);

      if (json.data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/diamonds");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google Sign-In failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    error,
    submitRegister,
    handleGoogleLogin,
    isGoogleModalOpen,
    setIsGoogleModalOpen,
  };
}
