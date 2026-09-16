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
import { loginAction, registerAction } from "@/actions/auth.action";
import { apiHandler } from "@/utils/api-handler";
import { useAuthStore } from "@/store/useAuthStore";

export interface IUseLoginFormReturn {
  form: UseFormReturn<LoginFormData>;
  isSubmitting: boolean;
  error: string | null;
  submitLogin: (data: LoginFormData) => Promise<void>;
}

export function useLoginForm(): IUseLoginFormReturn {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

    const result = await apiHandler(() => loginAction(data), {
      showErrorToast: true,
      errorMessage: "Authentication failed",
    });

    if (result.success && result.data) {
      login(result.data);
      if (result.data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/diamonds");
      }
      router.refresh();
    } else if (result.error) {
      setError(result.error.message);
    }

    setIsSubmitting(false);
  };

  return {
    form,
    isSubmitting,
    error,
    submitLogin,
  };
}

export interface IUseRegisterFormReturn {
  form: UseFormReturn<RegisterFormData>;
  isSubmitting: boolean;
  error: string | null;
  submitRegister: (data: RegisterFormData) => Promise<void>;
}

export function useRegisterForm(): IUseRegisterFormReturn {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

    const result = await apiHandler(() => registerAction(data), {
      showErrorToast: false,
    });

    if (result.success && result.data) {
      login(result.data);
      const { toast } = await import("sonner");
      toast.success("Membership Established", {
        description: `Welcome to DarkGems, ${result.data.name}. A confirmation email has been dispatched.`,
      });
      if (result.data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/diamonds");
      }
      router.refresh();
    } else if (result.error) {
      const errorMsg = result.error.message || "Registration failed";
      setError(errorMsg);
      const { toast } = await import("sonner");
      if (
        errorMsg.toLowerCase().includes("already exists") ||
        errorMsg.toLowerCase().includes("already present") ||
        errorMsg.toLowerCase().includes("already registered")
      ) {
        toast.error("Account Already Exists", {
          description: "An account with this email is already registered. Please sign in instead.",
        });
        form.setError("email", {
          type: "manual",
          message: "An account with this email is already registered.",
        });
      } else {
        toast.error("Registration Failed", {
          description: errorMsg,
        });
      }
    }

    setIsSubmitting(false);
  };

  return {
    form,
    isSubmitting,
    error,
    submitRegister,
  };
}
