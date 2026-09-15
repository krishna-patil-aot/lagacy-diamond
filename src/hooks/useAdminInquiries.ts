"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  IInquiry,
  InquiryStatus,
  IInquiryStats,
  IAdminInquiriesResponse,
  IUpdateInquiryStatusResponse,
} from "@/types/inquiry.types";
import { toast } from "sonner";
import {
  subscribeToInquiryEvents,
  broadcastInquiryEvent,
  INQUIRY_EVENTS,
} from "@/lib/inquiry-events";
import { useInquiryStore } from "@/store/useInquiryStore";
import { siteConfig } from "@/config/site.config";

export interface IUseAdminInquiriesReturn {
  inquiries: IInquiry[];
  filteredInquiries: IInquiry[];
  paginatedInquiries: IInquiry[];
  stats: IInquiryStats;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  statusFilter: InquiryStatus | "ALL";
  setStatusFilter: (status: InquiryStatus | "ALL") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalFilteredCount: number;
  inspectInquiry: IInquiry | null;
  setInspectInquiry: (inquiry: IInquiry | null) => void;
  handleStatusChange: (id: string, newStatus: InquiryStatus, notes?: string) => Promise<boolean>;
  sendReply: (id: string, replyText: string, newStatus?: InquiryStatus) => Promise<boolean>;
  refetch: () => Promise<void>;
  getWhatsAppLink: (inquiry: IInquiry) => string;
  getEmailLink: (inquiry: IInquiry) => string;
}

const INITIAL_STATS: IInquiryStats = {
  total: 0,
  newCount: 0,
  inProgressCount: 0,
  resolvedCount: 0,
};

export function useAdminInquiries(): IUseAdminInquiriesReturn {
  const { token, user } = useAuthStore();
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [stats, setStats] = useState<IInquiryStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [inspectInquiry, setInspectInquiry] = useState<IInquiry | null>(null);

  const getEffectiveToken = useCallback(() => {
    return (
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("diamond_auth_token")
        : null)
    );
  }, [token]);

  const selectInspectInquiry = useCallback(
    (inquiry: IInquiry | null) => {
      setInspectInquiry(inquiry);
      if (inquiry) {
        const activeToken = getEffectiveToken();
        if (activeToken) {
          void fetch(`/api/inquiries/${inquiry.inquiryNumber}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${activeToken}` },
          });
        }
        void useInquiryStore.getState().markInquiryRead(inquiry.inquiryNumber);
      }
    },
    [getEffectiveToken]
  );

  const loadInquiriesData = useCallback(
    async (showLoadingSpinner: boolean = false) => {
      const activeToken = getEffectiveToken();
      if (!activeToken || user?.role !== "ADMIN") {
        setIsLoading(false);
        return;
      }

      if (showLoadingSpinner) {
        setIsLoading(true);
      }

      try {
        setError(null);
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }
        if (searchQuery.trim()) {
          params.append("q", searchQuery.trim());
        }

        const res = await fetch(`/api/admin/inquiries?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as IAdminInquiriesResponse;
        if (json.success && Array.isArray(json.data)) {
          setInquiries(json.data);
          if (json.stats) {
            setStats(json.stats);
          }
          // Live auto-update currently inspected inquiry thread
          setInspectInquiry((prev) => {
            if (!prev) return null;
            const updated = json.data?.find(
              (item) => item.id === prev.id || item.inquiryNumber === prev.inquiryNumber
            );
            return updated || prev;
          });
        } else {
          setError(json.error || "Failed to load inquiries");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error connecting to server";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [getEffectiveToken, user, statusFilter, searchQuery]
  );

  useEffect(() => {
    let isSubscribed = true;

    async function initialLoad() {
      const activeToken = getEffectiveToken();
      if (!activeToken || user?.role !== "ADMIN") {
        if (isSubscribed) setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }
        if (searchQuery.trim()) {
          params.append("q", searchQuery.trim());
        }

        const res = await fetch(`/api/admin/inquiries?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as IAdminInquiriesResponse;
        if (isSubscribed && json.success && Array.isArray(json.data)) {
          setInquiries(json.data);
          if (json.stats) {
            setStats(json.stats);
          }
          setInspectInquiry((prev) => {
            if (!prev) return null;
            const updated = json.data?.find(
              (item) => item.id === prev.id || item.inquiryNumber === prev.inquiryNumber
            );
            return updated || prev;
          });
        } else if (isSubscribed && !json.success) {
          setError(json.error || "Failed to load inquiries");
        }
      } catch (err) {
        if (isSubscribed) {
          const msg = err instanceof Error ? err.message : "Error connecting to server";
          setError(msg);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    void initialLoad();

    // 1. Instant Real-Time Event Subscription (BroadcastChannel, Storage, CustomEvents)
    const unsubscribe = subscribeToInquiryEvents(() => {
      void loadInquiriesData(false);
    });

    // 2. Fast Heartbeat auto-poll for new messages every 2.5 seconds when admin tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadInquiriesData(false);
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [getEffectiveToken, user, statusFilter, searchQuery, loadInquiriesData]);

  // Client-side instant query filtering
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.inquiryNumber.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [inquiries, statusFilter, searchQuery]);

  // Pagination calculations
  const totalFilteredCount = filteredInquiries.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(startIndex, startIndex + pageSize);
  }, [filteredInquiries, currentPage, pageSize]);

  // Handle inquiry status update (NEW -> IN_PROGRESS -> RESOLVED)
  const handleStatusChange = useCallback(
    async (id: string, newStatus: InquiryStatus, notes?: string): Promise<boolean> => {
      const activeToken = getEffectiveToken();
      if (!activeToken) {
        toast.error("Admin authentication required");
        return false;
      }

      setIsUpdating(true);
      try {
        const res = await fetch(`/api/admin/inquiries/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ status: newStatus, adminNotes: notes }),
        });

        const json = (await res.json()) as IUpdateInquiryStatusResponse;
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Failed to update inquiry status");
        }

        const updated = json.data;
        setInquiries((prev) =>
          prev.map((item) => (item.id === id || item.inquiryNumber === id ? updated : item))
        );

        if (inspectInquiry && (inspectInquiry.id === id || inspectInquiry.inquiryNumber === id)) {
          setInspectInquiry(updated);
        }

        // Refresh stats
        setStats((prev) => {
          const oldStatus = inquiries.find((i) => i.id === id)?.status;
          if (!oldStatus || oldStatus === newStatus) return prev;

          const next = { ...prev };
          if (oldStatus === "NEW") next.newCount = Math.max(0, next.newCount - 1);
          if (oldStatus === "IN_PROGRESS") next.inProgressCount = Math.max(0, next.inProgressCount - 1);
          if (oldStatus === "RESOLVED") next.resolvedCount = Math.max(0, next.resolvedCount - 1);

          if (newStatus === "NEW") next.newCount += 1;
          if (newStatus === "IN_PROGRESS") next.inProgressCount += 1;
          if (newStatus === "RESOLVED") next.resolvedCount += 1;

          return next;
        });

        const statusLabels: Record<InquiryStatus, string> = {
          NEW: "New Inquiry",
          IN_PROGRESS: "In Progress",
          RESOLVED: "Resolved",
        };

        broadcastInquiryEvent(INQUIRY_EVENTS.INQUIRY_STATUS_CHANGED, id);
        toast.success(`Inquiry marked as ${statusLabels[newStatus]}`);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error updating inquiry";
        toast.error(msg);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [getEffectiveToken, inspectInquiry, inquiries]
  );

  // Send official client reply via conversation thread
  const sendReply = useCallback(
    async (id: string, replyText: string, newStatus: InquiryStatus = "IN_PROGRESS"): Promise<boolean> => {
      const activeToken = getEffectiveToken();
      if (!activeToken) {
        toast.error("Admin authentication required");
        return false;
      }

      if (!replyText.trim()) {
        toast.error("Please enter a reply message for the client");
        return false;
      }

      setIsUpdating(true);
      try {
        const res = await fetch(`/api/inquiries/${id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({
            message: replyText.trim(),
            senderRole: "ADMIN",
          }),
        });

        const json = (await res.json()) as { success: boolean; data?: IInquiry; error?: string };
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || "Failed to deliver reply to client");
        }

        const updated = json.data;

        // If status needs explicit change
        if (newStatus !== updated.status) {
          await handleStatusChange(id, newStatus);
        }

        setInquiries((prev) =>
          prev.map((item) => (item.id === id || item.inquiryNumber === id ? updated : item))
        );

        if (inspectInquiry && (inspectInquiry.id === id || inspectInquiry.inquiryNumber === id)) {
          setInspectInquiry(updated);
        }

        // Broadcast event across all tabs & client windows
        broadcastInquiryEvent(INQUIRY_EVENTS.INQUIRY_REPLIED, id, updated.inquiryNumber);

        toast.success("Reply delivered into conversation stream! Client has been notified.");
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error sending reply";
        toast.error(msg);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [getEffectiveToken, inspectInquiry, handleStatusChange]
  );

  // Generate WhatsApp direct chat link with pre-filled greeting
  const getWhatsAppLink = useCallback((inquiry: IInquiry): string => {
    const rawPhone = inquiry.phone.replace(/[^\d]/g, "");
    const greeting = encodeURIComponent(
      `Hello ${inquiry.fullName}, this is the Lead Gemologist from ${siteConfig.brandName}. We received your message regarding "${inquiry.inquiryType.replace(/_/g, " ")}" (Reference: #${inquiry.inquiryNumber}) and would be delighted to assist you.`
    );
    return `https://wa.me/${rawPhone}?text=${greeting}`;
  }, []);

  // Generate mailto link with pre-filled subject
  const getEmailLink = useCallback((inquiry: IInquiry): string => {
    const subject = encodeURIComponent(
      `Re: Your Inquiry with ${siteConfig.brandName} - Reference #${inquiry.inquiryNumber}`
    );
    const body = encodeURIComponent(
      `Dear ${inquiry.fullName},\n\nThank you for contacting ${siteConfig.brandName}.\n\nWe have reviewed your inquiry regarding "${inquiry.inquiryType.replace(/_/g, " ")}":\n"${inquiry.message}"\n\n`
    );
    return `mailto:${inquiry.email}?subject=${subject}&body=${body}`;
  }, []);

  return {
    inquiries,
    filteredInquiries,
    paginatedInquiries,
    stats,
    isLoading,
    isUpdating,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalFilteredCount,
    inspectInquiry,
    setInspectInquiry: selectInspectInquiry,
    handleStatusChange,
    sendReply,
    refetch: () => loadInquiriesData(true),
    getWhatsAppLink,
    getEmailLink,
  };
}
