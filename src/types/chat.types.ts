export type ChatSenderRole = "USER" | "ADMIN";

export type ChatMessageStatus = "SENT" | "DELIVERED" | "READ";

export interface IChatParticipant {
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "GUEST" | "ADMIN";
  avatarUrl?: string;
}

export interface IChatMessage {
  id: string;
  conversationId: string;
  sender: ChatSenderRole;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  content: string;
  status: ChatMessageStatus;
  createdAt: string;
  readAt?: string;
}

export interface IChatConversation {
  id: string;
  channelId: string;
  userId?: string;
  participant: IChatParticipant;
  lastMessage?: {
    content: string;
    sender: ChatSenderRole;
    createdAt: string;
    status: ChatMessageStatus;
  };
  unreadCountAdmin: number;
  unreadCountUser: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface ISendMessageInput {
  conversationId?: string;
  channelId?: string;
  content: string;
  sender: ChatSenderRole;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  participant?: IChatParticipant;
}

export interface IGetConversationsResponse {
  success: boolean;
  conversations: IChatConversation[];
  totalUnread: number;
  error?: string;
}

export interface IGetMessagesResponse {
  success: boolean;
  messages: IChatMessage[];
  conversation: IChatConversation;
  hasMore?: boolean;
  nextCursor?: string;
  totalCount?: number;
  error?: string;
}

export interface ISendMessageResponse {
  success: boolean;
  message: IChatMessage;
  conversation: IChatConversation;
  error?: string;
}

export interface IChatUnreadResponse {
  success: boolean;
  unreadCount: number;
  error?: string;
}

export type ChatConversationViewMode = "TABLE" | "CARDS";

export type ChatRoleFilter = "ALL" | "CUSTOMER" | "GUEST";

export type ChatSortOption = "RECENT" | "UNREAD" | "NAME";

export interface IChatPaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

