"use client";

import React, { useState } from "react";
import { useAdminInquiries } from "@/hooks/useAdminInquiries";
import { IInquiry, InquiryStatus } from "@/types/inquiry.types";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  Mail,
  MessageSquare,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Phone,
  User,
  Calendar,
  X,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function AdminInquiriesTable() {
  const {
    paginatedInquiries,
    stats,
    isLoading,
    isUpdating,
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
    setInspectInquiry,
    handleStatusChange,
    sendReply,
    refetch,
    getWhatsAppLink,
    getEmailLink,
  } = useAdminInquiries();

  const [notesDraft, setNotesDraft] = useState<string>("");
  const [replyDraft, setReplyDraft] = useState<string>("");

  const startRecord =
    totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  const formatInquiryType = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "NEW":
        return (
          <Badge
            variant="gold"
            className="text-[11px] font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap bg-amber-100 text-amber-900 border-amber-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>New Lead</span>
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap bg-sky-50 text-sky-800 border-sky-300"
          >
            <Clock className="h-3 w-3 text-sky-600 shrink-0" />
            <span>In Progress</span>
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge
            variant="success"
            className="text-[11px] font-mono inline-flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-300"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
            <span>Resolved</span>
          </Badge>
        );
    }
  };

  const handleOpenInspect = (inquiry: IInquiry) => {
    setInspectInquiry(inquiry);
    setNotesDraft(inquiry.adminNotes || "");
    setReplyDraft(inquiry.adminReply || "");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
          <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
            Total Messages
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
            {stats.total}
          </div>
        </div>

        <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-4 shadow-2xs">
          <div className="text-[11px] font-mono text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>New Leads</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1 font-mono">
            {stats.newCount}
          </div>
        </div>

        <div className="bg-sky-50/60 rounded-xl border border-sky-200 p-4 shadow-2xs">
          <div className="text-[11px] font-mono text-sky-800 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-2xl font-bold text-sky-900 mt-1 font-mono">
            {stats.inProgressCount}
          </div>
        </div>

        <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-4 shadow-2xs">
          <div className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider">
            Resolved
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">
            {stats.resolvedCount}
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          <div className="inline-flex items-center gap-1.5 min-w-max">
            {/* Status Filter Tabs */}
            {(["ALL", "NEW", "IN_PROGRESS", "RESOLVED"] as const).map(
              (status) => (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-mono h-8 whitespace-nowrap"
                >
                  {status === "ALL"
                    ? "All Messages"
                    : status === "NEW"
                      ? `New (${stats.newCount})`
                      : status === "IN_PROGRESS"
                        ? "In Progress"
                        : "Resolved"}
                </Button>
              ),
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-8 text-xs bg-stone-50 border-stone-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Rows per page Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono">
            <span className="hidden sm:inline">Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-16 text-xs font-mono bg-stone-50 border-stone-200">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="5"
                  className="text-xs font-mono"
                ></SelectItem>
                <SelectItem value="10" className="text-xs font-mono">
                  10
                </SelectItem>
                <SelectItem value="20" className="text-xs font-mono">
                  20
                </SelectItem>
                <SelectItem value="50" className="text-xs font-mono">
                  50
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="h-8 text-xs"
            title="Refresh Inquiries"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* 3. Inquiries Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-stone-50/80 border-b border-stone-200">
              <TableRow>
                <TableHead className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600">
                  Reference & Date
                </TableHead>
                <TableHead className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600">
                  Client Details
                </TableHead>
                <TableHead className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600">
                  Inquiry Type & Budget
                </TableHead>
                <TableHead className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600">
                  Message Excerpt
                </TableHead>
                <TableHead className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600">
                  Status
                </TableHead>
                <TableHead className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-stone-600 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-stone-100">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-stone-500"
                  >
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-amber-600 mb-2" />
                    <span className="font-mono text-xs">
                      Loading customer inquiries...
                    </span>
                  </TableCell>
                </TableRow>
              ) : paginatedInquiries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-stone-500"
                  >
                    <MessageSquare className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                    <div className="font-medium text-stone-700">
                      No Inquiries Found
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1">
                      {searchQuery
                        ? "No customer inquiries matched your search criteria."
                        : "No customer contact messages received yet."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInquiries.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-amber-50/20 transition-colors cursor-pointer"
                    onClick={() => handleOpenInspect(item)}
                  >
                    {/* Reference & Date */}
                    <TableCell className="py-3.5 px-4 align-middle">
                      <div className="font-mono font-bold text-stone-900">
                        #{item.inquiryNumber}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Client Details */}
                    <TableCell className="py-3.5 px-4 align-middle">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <User className="h-3 w-3 text-stone-400 shrink-0" />
                        <span>{item.fullName}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                        <Mail className="h-3 w-3 text-stone-400 shrink-0" />
                        <span>{item.email}</span>
                      </div>
                      {item.phone && (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-stone-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Inquiry Type & Budget */}
                    <TableCell className="py-3.5 px-4 align-middle">
                      <div className="font-medium text-stone-800">
                        {formatInquiryType(item.inquiryType)}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 space-x-1.5">
                        {item.budgetRange && (
                          <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                            Budget: {item.budgetRange}
                          </span>
                        )}
                        {item.preferredCaratRange && (
                          <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-xs">
                            {item.preferredCaratRange}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Message Excerpt */}
                    <TableCell className="py-3.5 px-4 align-middle max-w-xs">
                      <p className="line-clamp-2 text-stone-600 text-[11px] leading-relaxed">
                        {item.message}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 px-4 align-middle">
                      <div className="space-y-1">
                        {getStatusBadge(item.status)}
                        {item.adminReply && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-800">
                            <ShieldCheck className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>Replied</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      className="py-3.5 px-4 align-middle text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Primary Action: Reply to Client */}
                        <Button
                          type="button"
                          variant="luxury"
                          size="sm"
                          onClick={() => handleOpenInspect(item)}
                          className="h-7 px-2.5 text-[11px] font-mono gap-1.5 shadow-2xs"
                          title="Reply to Client"
                        >
                          <Send className="h-3 w-3" />
                          <span>
                            {item.adminReply ? "Edit Reply" : "Reply"}
                          </span>
                        </Button>

                        {/* 2. View Full Message Details */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInspect(item)}
                          className="h-7 px-2 text-[11px] font-mono gap-1"
                          title="View Full Message"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Button>

                        {/* 3. Status Toggle Quick Action */}
                        {item.status === "NEW" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(item.id, "IN_PROGRESS")
                            }
                            className="h-7 px-2 text-[11px] font-mono text-sky-800 bg-sky-50 border-sky-300 hover:bg-sky-100 gap-1"
                            title="Mark In Progress"
                          >
                            <span>In Progress</span>
                          </Button>
                        )}

                        {item.status === "IN_PROGRESS" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(item.id, "RESOLVED")
                            }
                            className="h-7 px-2 text-[11px] font-mono text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 gap-1"
                            title="Mark as Resolved"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Resolve</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 4. Pagination Controls Footer */}
      {totalFilteredCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-600">
          <div>
            Showing{" "}
            <span className="font-semibold text-stone-900">{startRecord}</span>{" "}
            to <span className="font-semibold text-stone-900">{endRecord}</span>{" "}
            of{" "}
            <span className="font-semibold text-stone-900">
              {totalFilteredCount}
            </span>{" "}
            messages
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Indicators */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
                )
                .map((pageNumber, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNumber - prev > 1;

                  return (
                    <React.Fragment key={pageNumber}>
                      {showEllipsis && (
                        <span className="px-1 text-stone-400">…</span>
                      )}
                      <Button
                        variant={
                          currentPage === pageNumber ? "luxury" : "outline"
                        }
                        size="sm"
                        className={`h-8 w-8 p-0 text-xs font-mono ${
                          currentPage === pageNumber
                            ? "bg-stone-900 text-white font-bold shadow-xs"
                            : "text-stone-700 hover:bg-stone-100"
                        }`}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    </React.Fragment>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 5. Detailed Inquiry Inspection Dialog */}
      {inspectInquiry && (
        <Dialog
          open={Boolean(inspectInquiry)}
          onOpenChange={(open) => !open && setInspectInquiry(null)}
        >
          <DialogContent className="max-w-xl w-[calc(100%-1.5rem)] max-h-[88dvh] overflow-y-auto p-4 sm:p-6 md:p-8 bg-white border border-stone-200 shadow-xl rounded-2xl">
            <DialogHeader className="border-b border-stone-100 pb-3 sm:pb-4 pr-6 sm:pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Inquiry #{inspectInquiry.inquiryNumber}
                </DialogTitle>
                {getStatusBadge(inspectInquiry.status)}
              </div>
              <DialogDescription className="text-[11px] sm:text-xs text-stone-500 mt-1 font-mono">
                Received on{" "}
                {new Date(inspectInquiry.createdAt).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-5 py-2">
              {/* Client Info Card */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4 space-y-2 text-xs">
                <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-700" />
                  <span>{inspectInquiry.fullName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                    <span className="truncate">{inspectInquiry.email}</span>
                  </div>
                  {inspectInquiry.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                      <span>{inspectInquiry.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/60 mt-2">
                  <a
                    href={getEmailLink(inspectInquiry)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-white text-[11px] font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <Mail className="h-3 w-3 text-stone-500" />
                    <span>Email Client</span>
                    <ExternalLink className="h-2.5 w-2.5 text-stone-400" />
                  </a>
                  {inspectInquiry.phone && (
                    <a
                      href={getWhatsAppLink(inspectInquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50/70 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3 text-emerald-600" />
                      <span>WhatsApp Direct</span>
                      <ExternalLink className="h-2.5 w-2.5 text-emerald-500" />
                    </a>
                  )}
                </div>
              </div>

              {/* Inquiry Type & Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="rounded-lg border border-stone-200 p-3 bg-white">
                  <span className="text-[10px] font-mono uppercase text-stone-400">
                    Category
                  </span>
                  <div className="font-semibold text-stone-900 mt-0.5">
                    {formatInquiryType(inspectInquiry.inquiryType)}
                  </div>
                </div>

                <div className="rounded-lg border border-stone-200 p-3 bg-white">
                  <span className="text-[10px] font-mono uppercase text-stone-400">
                    Budget / Carat
                  </span>
                  <div className="font-semibold text-stone-900 mt-0.5">
                    {inspectInquiry.budgetRange || "Flexible"} •{" "}
                    {inspectInquiry.preferredCaratRange || "Any Carat"}
                  </div>
                </div>
              </div>

              {/* Live Conversation Stream / Thread History */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                    <span>Live Consultation Thread ({inspectInquiry.messages?.length || 1} messages):</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    Client: {inspectInquiry.email}
                  </span>
                </span>

                <div className="max-h-56 overflow-y-auto space-y-2.5 rounded-xl border border-stone-200 bg-stone-50/80 p-3 sm:p-4 text-xs">
                  {inspectInquiry.messages && inspectInquiry.messages.length > 0 ? (
                    inspectInquiry.messages.map((m, idx) => {
                      const isAdmin = m.sender === "ADMIN";
                      return (
                        <div
                          key={m.id || idx}
                          className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-mono text-stone-400 mb-0.5 px-1">
                            <span className={isAdmin ? "text-amber-700 font-semibold" : "text-stone-600 font-medium"}>
                              {isAdmin ? "Curator Gemologist" : m.senderName}
                            </span>
                            <span>•</span>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div
                            className={`max-w-[85%] rounded-xl p-2.5 leading-relaxed whitespace-pre-wrap ${
                              isAdmin
                                ? "bg-amber-100/80 text-amber-950 border border-amber-300 rounded-tr-xs"
                                : "bg-white text-stone-800 border border-stone-200 rounded-tl-xs shadow-2xs"
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-stone-200 text-stone-800 leading-relaxed whitespace-pre-wrap">
                      {inspectInquiry.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Official Concierge Client Reply Section (Primary Action) */}
              <div className="space-y-2.5 rounded-xl border border-amber-300 bg-amber-50/50 p-3 sm:p-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>Send Thread Response to Client:</span>
                  </span>
                  {inspectInquiry.repliedAt && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono bg-white text-stone-700 border-amber-300"
                    >
                      {inspectInquiry.isClientRead ? "Read by Client" : "Delivered"}
                    </Badge>
                  )}
                </div>

                {/* Quick Luxury Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-mono text-stone-500 mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setReplyDraft(
                        `Dear ${inspectInquiry.fullName},\n\nWe have verified our certified vault for diamonds matching your preference (${inspectInquiry.preferredCaratRange || "selected specifications"}). Our curation team has earmarked 2 investment-grade Type IIa solitaires with GIA Dossiers for your private review.\n\nWould you like us to arrange a private video salon consultation?`
                      )
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    + Solitaire Curation
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyDraft(
                        `Dear ${inspectInquiry.fullName},\n\nOur master bench jewelers are ready to draft custom 3D CAD renders for your engagement ring setting. We specialize in 18k Yellow Gold, Rose Gold, Midnight Noir Gold, and 950 Platinum.\n\nPlease share your ring size and target delivery date.`
                      )
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    + Custom Ring CAD
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyDraft(
                        `Dear ${inspectInquiry.fullName},\n\nThank you for reaching DarkGem Concierge. We have received your consultation request and our Head Gemologist will reach out directly via call/WhatsApp to discuss your gemstone requirements in detail.`
                      )
                    }
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    + Direct Call Notice
                  </button>
                </div>

                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Type your official concierge response into the conversation stream..."
                  className="w-full text-xs p-3 rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-600 resize-none h-24 text-stone-900 shadow-2xs"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] font-mono text-stone-500 truncate">
                    Recipient: <strong className="text-stone-700">{inspectInquiry.email}</strong>
                  </span>
                  <Button
                    type="button"
                    variant="luxury"
                    size="sm"
                    disabled={isUpdating || !replyDraft.trim()}
                    onClick={async () => {
                      const ok = await sendReply(inspectInquiry.id, replyDraft, "IN_PROGRESS");
                      if (ok) setReplyDraft("");
                    }}
                    className="text-xs font-mono h-8 gap-1.5 shadow-xs px-4 w-full sm:w-auto"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Reply into Thread</span>
                  </Button>
                </div>
              </div>

              {/* Curator Admin Notes */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stone-900">
                  Curator Internal Notes (Private to Admin):
                </span>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Add internal notes on client preferences, phone conversation details, or ring quotes..."
                  className="w-full text-xs p-3 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-600 resize-none h-16 text-stone-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-mono">
                    Status:
                  </span>
                  <Select
                    value={inspectInquiry.status}
                    onValueChange={(val: InquiryStatus) =>
                      handleStatusChange(inspectInquiry.id, val, notesDraft)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs font-mono w-full sm:w-36 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New Lead</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() =>
                      handleStatusChange(
                        inspectInquiry.id,
                        inspectInquiry.status,
                        notesDraft,
                      )
                    }
                    className="text-xs font-mono h-8 w-full sm:w-auto"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
