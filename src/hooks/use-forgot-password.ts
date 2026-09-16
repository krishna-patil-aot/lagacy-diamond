"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  ForgotPasswordFormData,
  VerifyOtpFormData,
  ResetPasswordFormData,
} from "@/lib/validations/auth.schema";
import {
  requestOtpAction,
  verifyOtpAction,
  verifyOtpAndLoginAction,
  resetPasswordAction,
} from "@/actions/auth.action";
import { apiHandler } from "@/utils/api-handler";
import { useAuthStore } from "@/store/useAuthStore";
import { ForgotPasswordStep } from "@/types/auth.types";
import { toast } from "sonner";

export interface IUseForgotPasswordReturn {
  step: ForgotPasswordStep;
  email: string;
  isSubmitting: boolean;
  error: string | null;
  resendCooldown: number;
  canResend: boolean;
  requestForm: UseFormReturn<ForgotPasswordFormData>;
  verifyForm: UseFormReturn<VerifyOtpFormData>;
  resetForm: UseFormReturn<ResetPasswordFormData>;
  handleRequestOtp: (data: ForgotPasswordFormData) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  handleVerifyOtp: (data: VerifyOtpFormData) => Promise<void>;
  handleVerifyOtpAndLogin: () => Promise<void>;
  handleResetPassword: (data: ResetPasswordFormData) => Promise<void>;
  goToStep: (step: ForgotPasswordStep) => void;
  resetAll: () => void;
}

export function useForgotPassword(): IUseForgotPasswordReturn {
  const router = useRouter();
  const { login } = useAuthStore();

  const [step, setStep] = useState<ForgotPasswordStep>("REQUEST_OTP");
  const [email, setEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // 1. Request OTP Form
  const requestForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // 2. Verify OTP Form
  const verifyForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", otp: "" },
  });

  // 3. Reset Password Form
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      resetToken: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    const targetEmail = data.email.toLowerCase().trim();
    const result = await apiHandler(() => requestOtpAction({ email: targetEmail }), {
      showErrorToast: true,
      errorMessage: "Could not dispatch verification code",
    });

    if (result.success) {
      setEmail(targetEmail);
      verifyForm.setValue("email", targetEmail);
      resetForm.setValue("email", targetEmail);
      setStep("VERIFY_OTP");
      setResendCooldown(60);
      toast.success("Security Code Dispatched", {
        description: `A 6-digit verification code was sent to ${targetEmail}`,
      });
    } else if (result.error) {
      setError(result.error.message);
    }

    setIsSubmitting(false);
  };

  // Resend OTP
  const handleResendOtp = useCallback(async () => {
    if (!email || resendCooldown > 0) return;
    setIsSubmitting(true);
    setError(null);

    const result = await apiHandler(() => requestOtpAction({ email }), {
      showErrorToast: true,
      errorMessage: "Could not resend verification code",
    });

    if (result.success) {
      setResendCooldown(60);
      toast.success("New Code Dispatched", {
        description: "A refreshed verification code was sent to your email",
      });
    } else if (result.error) {
      setError(result.error.message);
    }

    setIsSubmitting(false);
  }, [email, resendCooldown]);

  // Step 2A: Verify OTP and proceed to Reset Password
  const handleVerifyOtp = async (data: VerifyOtpFormData) => {
    setIsSubmitting(true);
    setError(null);

    const result = await apiHandler(
      () => verifyOtpAction({ email: data.email, otp: data.otp }),
      {
        showErrorToast: true,
        errorMessage: "Verification failed",
      }
    );

    if (result.success && result.data?.resetToken) {
      setResetToken(result.data.resetToken);
      resetForm.setValue("resetToken", result.data.resetToken);
      setStep("RESET_PASSWORD");
      toast.success("Code Verified", {
        description: "Please establish your new vault access password.",
      });
    } else if (result.error) {
      setError(result.error.message);
    }

    setIsSubmitting(false);
  };

  // Step 2B: Verify OTP and Directly Log In
  const handleVerifyOtpAndLogin = async () => {
    const enteredOtp = verifyForm.getValues("otp");
    if (!enteredOtp || enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await apiHandler(
      () => verifyOtpAndLoginAction({ email, otp: enteredOtp }),
      {
        showErrorToast: true,
        errorMessage: "Instant login failed",
      }
    );

    if (result.success && result.data) {
      login(result.data);
      toast.success("Authentication Confirmed", {
        description: `Welcome back, ${result.data.name}`,
      });
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

  // Step 3: Establish New Password
  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      setError("Reset session expired. Please verify your code again.");
      setStep("REQUEST_OTP");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await apiHandler(
      () =>
        resetPasswordAction({
          email: data.email,
          resetToken: data.resetToken,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      {
        showErrorToast: true,
        errorMessage: "Failed to update password",
      }
    );

    if (result.success) {
      setStep("SUCCESS");
      toast.success("Password Updated", {
        description: "Your vault access password has been successfully established.",
      });
    } else if (result.error) {
      setError(result.error.message);
    }

    setIsSubmitting(false);
  };

  const goToStep = (targetStep: ForgotPasswordStep) => {
    setError(null);
    setStep(targetStep);
  };

  const resetAll = () => {
    setError(null);
    setStep("REQUEST_OTP");
    setEmail("");
    setResetToken(null);
    requestForm.reset();
    verifyForm.reset();
    resetForm.reset();
  };

  return {
    step,
    email,
    isSubmitting,
    error,
    resendCooldown,
    canResend: resendCooldown === 0,
    requestForm,
    verifyForm,
    resetForm,
    handleRequestOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleVerifyOtpAndLogin,
    handleResetPassword,
    goToStep,
    resetAll,
  };
}
