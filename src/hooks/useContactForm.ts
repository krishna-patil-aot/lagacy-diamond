"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { IContactInquiry, IContactResponse } from "@/types/contact.types";

const INITIAL_FORM: IContactInquiry = {
  fullName: "",
  email: "",
  phone: "",
  inquiryType: "CUSTOM_ENGAGEMENT_RING",
  preferredCaratRange: "1.0 - 2.0 ct",
  budgetRange: "₹50,000 - ₹2,00,000",
  message: "",
};

export function useContactForm() {
  const [formData, setFormData] = useState<IContactInquiry>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const updateField = useCallback(
    <K extends keyof IContactInquiry>(field: K, value: IContactInquiry[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const submitInquiry = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
        toast.error("Please fill in your name, email, and message.");
        return;
      }

      setIsSubmitting(true);
      toast.loading("Sending your message to our Diamond Experts...", { id: "contact-submit" });

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = (await response.json()) as IContactResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to send your message. Please try again.");
        }

        setIsSuccess(true);
        setFormData(INITIAL_FORM);
        toast.success("Thank you! Our diamond expert will connect with you shortly.", {
          id: "contact-submit",
          duration: 6000,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error submitting request";
        toast.error(errorMsg, { id: "contact-submit" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData]
  );

  const resetSuccess = useCallback(() => {
    setIsSuccess(false);
  }, []);

  return {
    formData,
    updateField,
    submitInquiry,
    isSubmitting,
    isSuccess,
    resetSuccess,
  };
}
