"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAdminChat } from "@/hooks/useAdminChat";
import { ChatMessageBubble, ChatDateDivider } from "@/components/chat/ChatMessageBubble";
import { groupMessagesByDateAndSender } from "@/lib/chat-utils";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Search,
  Send,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCw,
  Loader2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Users,
  LayoutDashboard,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { ChatSortOption } from "@/types/chat.types";

interface AdminLiveChatProps {
  onExit?: () => void;
  initialConversationId?: string;
}

const CANNED_REPLIES = [
  "Welcome to DarkGems Atelier! I am the Master Curator. How may I assist with your gemstone curation today?",
  "Your Type IIa diamond has passed sovereign GIA laser inscription and is safely in vault storage.",
  "Our Geneva master jewelers are currently hand-forging the bespoke solitaire setting.",
  "Your consignment has been dispatched via fully insured Brink's armored courier. You will receive OTP release upon delivery.",
  "Would you like me to reserve this stone in the vault while we confirm your carat and setting preferences?",
];

export function AdminLiveChat({ onExit, initialConversationId }: AdminLiveChatProps) {
  const {
    filteredConversations,
    paginatedConversations,
    paginationState,
    activeConversation,
    messages,
    filteredMessages,
    hasMoreMessages,
    isLoadingEarlier,
    loadEarlierMessages,
    totalMessageCount,
    isLoading,
    isLoadingMessages,
    isSending,
    totalUnread,
    searchQuery,
    setSearchQuery,
    filterUnreadOnly,
    setFilterUnreadOnly,
    roleFilter,
    setRoleFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    pageSize,
    setPageSize,
    goToPage,
    nextPage,
    prevPage,
    inChatSearch,
    setInChatSearch,
    adminDraft,
    setAdminDraft,
    selectConversation,
    selectConversationById,
    handleSendReply,
    refreshConversations,
    messagesContainerRef,
    isSoundEnabled,
    setIsSoundEnabled,
  } = useAdminChat();

  // If initialConversationId was provided (e.g. from notification click or URL), open it immediately
  useEffect(() => {
    if (initialConversationId) {
      void selectConversationById(initialConversationId);
    }
  }, [initialConversationId, selectConversationById]);

  // Listen to custom window event "darkgems_open_admin_chat" for in-page instant notification clicks
  useEffect(() => {
    const handleOpenChatEvent = (e: Event) => {
      const custom = e as CustomEvent<{ conversationId?: string }>;
      if (custom.detail?.conversationId) {
        void selectConversationById(custom.detail.conversationId);
      }
    };

    window.addEventListener("darkgems_open_admin_chat", handleOpenChatEvent);
    return () => window.removeEventListener("darkgems_open_admin_chat", handleOpenChatEvent);
  }, [selectConversationById]);

  const [isSearchInChatOpen, setIsSearchInChatOpen] = useState<boolean>(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendReply();
    }
  };

  const formatTime = (isoString?: string): string => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // Group messages by Date and consecutive clusters for multiple message management
  const messageDateGroups = useMemo(() => {
    return groupMessagesByDateAndSender(filteredMessages);
  }, [filteredMessages]);

  // Lock document body scroll while full-screen admin live chat is open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#efeae2] h-full w-full min-h-0 overflow-hidden font-sans select-none sm:select-auto">
      {/* ------------------------------------------------------------------ */}
      {/* SCREEN 1: CLIENT INQUIRY DIRECTORY (Data-Table & Pagination View)  */}
      {/* ------------------------------------------------------------------ */}
      {!activeConversation ? (
        <div className="flex flex-col h-full min-h-0 bg-stone-100/90 overflow-hidden">
          {/* Top Pinned Header */}
          <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Return to Admin Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Exit to Dashboard</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              )}

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-800 border border-amber-400/40 text-amber-200 shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-sm sm:text-base font-semibold tracking-wide text-white truncate">
                      Atelier Client Directory &amp; Live Chats
                    </h2>
                    {totalUnread > 0 && (
                      <span className="rounded-full bg-emerald-500 text-white px-2 py-0.2 text-[11px] font-mono font-bold animate-pulse shrink-0">
                        {totalUnread} Unread
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-400 truncate hidden xs:block">
                    Manage real-time inquiries, customer orders, and guest leads.
                  </p>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Table vs Grid Cards View Toggle */}
              <div className="flex items-center bg-stone-800 rounded-xl p-0.5 border border-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode("TABLE")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "TABLE" ? "bg-stone-700 text-white shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                  title="Data Table View"
                  aria-label="Table View"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("CARDS")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "CARDS" ? "bg-stone-700 text-white shadow-xs" : "text-stone-400 hover:text-white"
                  }`}
                  title="Card Grid View"
                  aria-label="Cards View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title={isSoundEnabled ? "Mute notification sound" : "Enable notification sound"}
              >
                {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-stone-500" />}
              </button>

              <button
                type="button"
                onClick={() => void refreshConversations()}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title="Refresh client list"
              >
                <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search Bar & Multi-Category Filter Bar */}
          <div className="p-3 sm:p-4 bg-white border-b border-stone-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search clients by name, email, or message preview..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs sm:text-sm h-10 bg-stone-50 border-stone-200 rounded-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sorting */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
                <button
                  type="button"
                  onClick={() => {
                    setFilterUnreadOnly(false);
                    setRoleFilter("ALL");
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    !filterUnreadOnly && roleFilter === "ALL"
                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  All ({filteredConversations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    filterUnreadOnly
                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>Unread</span>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-emerald-600 text-white px-1.5 py-0.2 text-[10px] font-mono font-bold">
                      {totalUnread}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterUnreadOnly(false);
                    setRoleFilter(roleFilter === "CUSTOMER" ? "ALL" : "CUSTOMER");
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    roleFilter === "CUSTOMER"
                      ? "bg-amber-600 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Customers Only
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilterUnreadOnly(false);
                    setRoleFilter(roleFilter === "GUEST" ? "ALL" : "GUEST");
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    roleFilter === "GUEST"
                      ? "bg-stone-700 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Guests
                </button>
              </div>

              {/* Sort Selector with Shadcn Select */}
              <div className="w-[180px]">
                <Select
                  value={sortBy}
                  onValueChange={(val) => setSortBy(val as ChatSortOption)}
                >
                  <SelectTrigger className="h-9.5 rounded-xl border-stone-200 bg-stone-50 text-xs text-stone-800 hover:bg-white transition-colors">
                    <div className="flex items-center gap-1.5 truncate">
                      <ArrowUpDown className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                      <SelectValue placeholder="Sort clients..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECENT">Sort: Recent Activity</SelectItem>
                    <SelectItem value="UNREAD">Sort: Most Unread</SelectItem>
                    <SelectItem value="NAME">Sort: Client Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* User Conversations Container (Data Table or Cards) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 overscroll-contain">
            <div className="max-w-6xl mx-auto w-full space-y-4">
              {isLoading && paginatedConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                  <span className="text-xs font-mono">Syncing client directory...</span>
                </div>
              ) : paginatedConversations.length === 0 ? (
                <div className="py-20 px-4 text-center max-w-md mx-auto space-y-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-500 border border-stone-200 shadow-xs">
                    <MessageSquare className="h-7 w-7 text-stone-400 stroke-1" />
                  </div>
                  <h3 className="font-serif text-base font-semibold text-stone-800">
                    No Client Inquiries Found
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {searchQuery || roleFilter !== "ALL" || filterUnreadOnly
                      ? "No clients matched your filter or search query. Try clearing your filters."
                      : "When a private client or guest sends an inquiry, their channel appears here instantly."}
                  </p>
                  {(searchQuery || roleFilter !== "ALL" || filterUnreadOnly) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setRoleFilter("ALL");
                        setFilterUnreadOnly(false);
                      }}
                      className="text-xs mt-2"
                    >
                      Reset All Filters
                    </Button>
                  )}
                </div>
              ) : viewMode === "TABLE" ? (
                /* -------------------------------------------------------- */
                /* PROPER RESPONSIVE DATA-TABLE FOR MANAGING MULTIPLE USERS */
                /* -------------------------------------------------------- */
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-stone-50/80 hover:bg-stone-50/80 border-b border-stone-200">
                        <TableHead className="py-3 px-4 sm:px-6 font-semibold text-stone-600">Client Dossier</TableHead>
                        <TableHead className="py-3 px-4 font-semibold text-stone-600">Role</TableHead>
                        <TableHead className="py-3 px-4 font-semibold text-stone-600">Status</TableHead>
                        <TableHead className="py-3 px-4 font-semibold text-stone-600">Latest Inquiry</TableHead>
                        <TableHead className="py-3 px-4 font-semibold text-right text-stone-600">Time</TableHead>
                        <TableHead className="py-3 px-4 sm:px-6 font-semibold text-right text-stone-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedConversations.map((conv) => {
                        const hasUnread = conv.unreadCountAdmin > 0;
                        const lastMsgTime = formatTime(conv.lastMessage?.createdAt || conv.updatedAt);

                        return (
                          <TableRow
                            key={conv.id}
                            onClick={() => selectConversation(conv)}
                            className={`group transition-colors duration-150 cursor-pointer ${
                              hasUnread
                                ? "bg-amber-50/40 hover:bg-amber-50/80 font-medium"
                                : "hover:bg-stone-50/80"
                            }`}
                          >
                            {/* 1. Client Dossier */}
                            <TableCell className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-200 font-serif font-bold text-sm border border-amber-400/30 shadow-2xs group-hover:scale-105 transition-transform">
                                    {conv.participant.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                                    {conv.participant.name}
                                  </p>
                                  <p className="text-[11px] font-mono text-stone-500 truncate">
                                    {conv.participant.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* 2. Role */}
                            <TableCell className="py-3.5 px-4">
                              <Badge
                                variant="outline"
                                className={`text-[9px] uppercase font-mono py-0.5 px-2 ${
                                  conv.participant.role === "CUSTOMER"
                                    ? "bg-amber-100 text-amber-900 border-amber-300"
                                    : "bg-stone-100 text-stone-700 border-stone-300"
                                }`}
                              >
                                {conv.participant.role}
                              </Badge>
                            </TableCell>

                            {/* 3. Status & Unread */}
                            <TableCell className="py-3.5 px-4">
                              {hasUnread ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[11px] font-mono font-bold animate-pulse">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                  {conv.unreadCountAdmin} New
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-400 font-mono">
                                  Seen
                                </span>
                              )}
                            </TableCell>

                            {/* 4. Latest Message Preview */}
                            <TableCell className="py-3.5 px-4 max-w-xs">
                              <p className="text-xs text-stone-600 truncate">
                                {conv.lastMessage ? (
                                  <>
                                    {conv.lastMessage.sender === "ADMIN" && (
                                      <span className="text-stone-400 font-normal">You: </span>
                                    )}
                                    {conv.lastMessage.content}
                                  </>
                                ) : (
                                  <span className="italic text-stone-400">Channel initiated</span>
                                )}
                              </p>
                            </TableCell>

                            {/* 5. Time */}
                            <TableCell className="py-3.5 px-4 text-right">
                              <span className="text-xs font-mono text-stone-500 whitespace-nowrap">
                                {lastMsgTime}
                              </span>
                            </TableCell>

                            {/* 6. Actions */}
                            <TableCell className="py-3.5 px-4 sm:px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectConversation(conv);
                                  }}
                                  className="inline-flex items-center gap-1 bg-stone-900 group-hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
                                >
                                  <span>Chat</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* -------------------------------------------------------- */
                /* CARDS VIEW (For Mobile & Alternative Layout)             */
                /* -------------------------------------------------------- */
                <div className="space-y-3">
                  {paginatedConversations.map((conv) => {
                    const hasUnread = conv.unreadCountAdmin > 0;
                    const lastMsgTime = formatTime(conv.lastMessage?.createdAt || conv.updatedAt);

                    return (
                      <div
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`group relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          hasUnread
                            ? "bg-amber-50/50 border-amber-300 hover:border-amber-400 hover:bg-amber-50/80 shadow-xs"
                            : "bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/90 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-amber-200 font-serif font-bold text-lg border border-amber-400/30 shadow-xs group-hover:scale-105 transition-transform">
                              {conv.participant.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-stone-900 group-hover:text-amber-900 transition-colors truncate">
                                {conv.participant.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-[9px] uppercase font-mono py-0 px-1.5 ${
                                  conv.participant.role === "CUSTOMER"
                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                    : "bg-stone-100 text-stone-600 border-stone-200"
                                }`}
                              >
                                {conv.participant.role}
                              </Badge>
                              {hasUnread && (
                                <span className="rounded-full bg-emerald-600 text-white px-2 py-0.2 text-[10px] font-mono font-bold animate-pulse">
                                  {conv.unreadCountAdmin} New
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-500 font-mono truncate">
                              {conv.participant.email}
                            </p>

                            <p
                              className={`text-xs truncate max-w-xl ${
                                hasUnread ? "font-semibold text-stone-900" : "text-stone-600"
                              }`}
                            >
                              {conv.lastMessage ? (
                                <>
                                  {conv.lastMessage.sender === "ADMIN" && (
                                    <span className="text-stone-400 font-normal">You: </span>
                                  )}
                                  {conv.lastMessage.content}
                                </>
                              ) : (
                                <span className="italic text-stone-400">Conversation started</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          <div className="text-left sm:text-right">
                            <span className="text-xs font-mono text-stone-500">
                              {lastMsgTime}
                            </span>
                            <div className="text-[10px] text-emerald-600 font-medium hidden sm:block">
                              Active Channel
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-stone-900 group-hover:bg-amber-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-xs transition-colors shrink-0">
                            <span>Open Chat</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* PAGINATION CONTROLS BAR (Scalable for 100s of Clients)       */}
              {/* ------------------------------------------------------------ */}
              {filteredConversations.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
                  {/* Left: Summary and Page Size */}
                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <span>
                      Showing{" "}
                      <strong className="text-stone-900">
                        {paginationState.startIndex + 1}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-stone-900">
                        {paginationState.endIndex}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-stone-900">
                        {paginationState.totalItems}
                      </strong>{" "}
                      clients
                    </span>

                    <div className="hidden xs:flex items-center gap-1.5">
                      <span className="text-stone-400">|</span>
                      <span className="text-[11px] text-stone-500">Rows:</span>
                      <div className="w-[72px]">
                        <Select
                          value={String(pageSize)}
                          onValueChange={(val) => setPageSize(Number(val))}
                        >
                          <SelectTrigger className="h-7.5 rounded-lg border-stone-200 bg-stone-50 text-xs px-2 hover:bg-white transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Right: Previous / Page Numbers / Next */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={prevPage}
                      disabled={!paginationState.hasPrevPage}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: paginationState.totalPages }, (_, i) => i + 1).map((pg) => {
                        // Show first page, last page, and pages around current page
                        if (
                          pg === 1 ||
                          pg === paginationState.totalPages ||
                          (pg >= currentPage - 1 && pg <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={`page-${pg}`}
                              type="button"
                              onClick={() => goToPage(pg)}
                              className={`h-8 w-8 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                pg === currentPage
                                  ? "bg-stone-900 text-white font-bold shadow-xs"
                                  : "text-stone-600 hover:bg-stone-100 border border-stone-200"
                              }`}
                            >
                              {pg}
                            </button>
                          );
                        } else if (
                          (pg === 2 && currentPage > 3) ||
                          (pg === paginationState.totalPages - 1 && currentPage < paginationState.totalPages - 2)
                        ) {
                          return (
                            <span key={`dots-${pg}`} className="px-1 text-xs text-stone-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={!paginationState.hasNextPage}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* SCREEN 2: DEDICATED FULL-SCREEN CHAT APPLICATION (Pinned Top/Bottom) */
        /* ------------------------------------------------------------------ */
        <div className="flex flex-col h-full min-h-0 bg-[#efeae2] overflow-hidden">
          {/* Top Pinned Navigation Header (NEVER SCROLLS) */}
          <div className="p-2.5 sm:p-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0 gap-2 sm:gap-3 z-10">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Back button to return to client list */}
              <button
                type="button"
                onClick={() => selectConversation(null)}
                className="flex items-center justify-center h-8 w-8 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium border border-stone-700 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                title="Return to client list"
                aria-label="Back to client list"
              >
                <ChevronLeft className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline sm:ml-1">Back</span>
              </button>

              {/* Client Profile Header */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <div className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl bg-stone-800 border border-amber-400/40 text-amber-200 font-serif font-bold text-xs sm:text-sm">
                    {activeConversation.participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-stone-900" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {activeConversation.participant.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[8px] sm:text-[9px] py-0 px-1 font-mono text-amber-300 border-amber-500/40 bg-amber-500/10 shrink-0"
                    >
                      {activeConversation.participant.role}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 font-mono truncate hidden xs:block">
                    {activeConversation.participant.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & In-Chat Search */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* In-Conversation Message Search Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchInChatOpen(!isSearchInChatOpen);
                  if (isSearchInChatOpen) setInChatSearch("");
                }}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                  isSearchInChatOpen || inChatSearch
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-stone-300 hover:text-white hover:bg-stone-800"
                }`}
                title="Search within conversation"
                aria-label="Search conversation messages"
              >
                <Search className="h-4 w-4" />
              </button>

              <Link
                href={`/orders?search=${encodeURIComponent(activeConversation.participant.email)}`}
                className="hidden md:inline-flex items-center gap-1.5 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl font-medium transition-colors text-xs border border-stone-700 shadow-xs"
                title="Look up orders for this client"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Client Orders</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="hidden sm:flex p-1.5 sm:p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title={isSoundEnabled ? "Mute notification sound" : "Enable notification sound"}
              >
                {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-stone-500" />}
              </button>

              <button
                type="button"
                onClick={() => void refreshConversations()}
                className="hidden sm:flex p-1.5 sm:p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                title="Refresh messages"
              >
                <RotateCw className={`h-4 w-4 ${isLoadingMessages ? "animate-spin" : ""}`} />
              </button>

              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="hidden md:flex items-center gap-1 text-xs text-stone-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Return to Admin Dashboard"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </button>
              )}
            </div>
          </div>

          {/* In-Conversation Message Search Bar (Expandable) */}
          {isSearchInChatOpen && (
            <div className="bg-stone-800 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 border-b border-stone-700 shrink-0 animate-in slide-in-from-top-2 duration-150">
              <Search className="h-4 w-4 text-stone-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search text in this chat history..."
                value={inChatSearch}
                onChange={(e) => setInChatSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-stone-400 focus:outline-hidden"
              />
              {inChatSearch && (
                <span className="text-[11px] font-mono text-stone-400 shrink-0">
                  {filteredMessages.length} match{filteredMessages.length === 1 ? "" : "es"}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setInChatSearch("");
                  setIsSearchInChatOpen(false);
                }}
                className="p-1 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Messages Area (Pinned in middle, luxury WhatsApp textured background, NO page scroll) */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 bg-[#efeae2] bg-[radial-gradient(#d3cbbe_0.8px,transparent_0.8px)] [background-size:16px_16px] overscroll-contain"
          >
            {/* Centered reading column for luxury readability */}
            <div className="max-w-4xl mx-auto w-full space-y-1">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-24 text-stone-500 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
                  <span className="text-xs font-mono">Decrypting consultation channel...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-20 text-stone-500 space-y-2 max-w-sm mx-auto">
                  <Clock className="h-8 w-8 mx-auto stroke-1 text-stone-400" />
                  <p className="text-xs font-semibold text-stone-800">
                    {inChatSearch ? "No messages matched your search." : "No messages in this channel yet."}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {inChatSearch
                      ? `Try searching for different keywords or clear your search.`
                      : `Send an official curator response below to begin real-time consultation with ${activeConversation.participant.name}.`}
                  </p>
                </div>
              ) : (
                <>
                  {/* Cursor-Based History Loading: Load Earlier Messages */}
                  {hasMoreMessages && (
                    <div className="flex justify-center pb-2 select-none">
                      <button
                        type="button"
                        onClick={() => void loadEarlierMessages()}
                        disabled={isLoadingEarlier}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-300 text-[11px] font-mono shadow-2xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isLoadingEarlier ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-amber-700" />
                            <span>Retrieving earlier archive...</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-stone-400" />
                            <span>Load earlier messages ({totalMessageCount - messages.length} remaining)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Grouped Messages with Date Dividers and Cluster Stacking */}
                  {messageDateGroups.map((dateGroup, groupIdx) => (
                    <div key={`date-group-${groupIdx}`} className="space-y-1">
                      <ChatDateDivider dateLabel={dateGroup.dateLabel} />
                      {dateGroup.items.map((item) => (
                        <ChatMessageBubble
                          key={item.message.id}
                          message={item.message}
                          isSelf={item.message.sender === "ADMIN"}
                          showSenderHeader={false}
                          isFirstInCluster={item.isFirstInCluster}
                          isLastInCluster={item.isLastInCluster}
                        />
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Canned Quick Responses Bar (Pinned at Bottom, Sleek & Compact) */}
          <div className="bg-[#efeae2]/90 backdrop-blur-xs px-3 py-1.5 border-t border-stone-200/60 shrink-0">
            <div className="max-w-4xl mx-auto w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-500 shrink-0 flex items-center gap-1 font-bold">
                <Sparkles className="h-2.5 w-2.5 text-amber-600" /> Canned:
              </span>
              {CANNED_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAdminDraft(reply)}
                  className="whitespace-nowrap rounded-full bg-white/90 hover:bg-white border border-stone-200/90 px-2.5 py-0.5 text-[10px] sm:text-[11px] text-stone-700 transition-all shrink-0 cursor-pointer shadow-2xs hover:border-amber-400 active:scale-95"
                >
                  {reply.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar (Pinned at Bottom - Single-line auto-expand, ZERO page scrolling needed) */}
          <div className="p-2 sm:p-3 bg-white border-t border-stone-200 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
            <form
              onSubmit={(e) => void handleSendReply(e)}
              className="max-w-4xl mx-auto w-full flex items-center gap-2"
            >
              <div className="flex-1 relative rounded-2xl border border-stone-300 focus-within:border-emerald-600 bg-stone-50 transition-colors">
                <textarea
                  rows={1}
                  value={adminDraft}
                  onChange={(e) => setAdminDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${activeConversation.participant.name}...`}
                  className="w-full resize-none bg-transparent px-3.5 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden max-h-24 leading-normal"
                />
              </div>

              <button
                type="submit"
                disabled={!adminDraft.trim() || isSending}
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#005c4b] hover:bg-[#004a3c] disabled:bg-stone-300 text-white shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                title="Send curator reply"
                aria-label="Send curator reply"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white ml-0.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
