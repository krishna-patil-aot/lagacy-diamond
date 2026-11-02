import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { ChatConversationModel, IChatConversationDocument } from "@/models/ChatConversation";
import { ChatMessageModel, IChatMessageDocument } from "@/models/ChatMessage";
import {
  IChatConversation,
  IChatMessage,
  IChatParticipant,
  ChatSenderRole,
} from "@/types/chat.types";

// In-memory resilient cache so chat never drops offline during cold starts or transient DB blips
const memoryConversations: Map<string, IChatConversation> = new Map();
const memoryMessages: Map<string, IChatMessage[]> = new Map();

function serializeConversation(doc: IChatConversationDocument): IChatConversation {
  return {
    id: String(doc._id),
    channelId: doc.channelId,
    userId: doc.userId ? String(doc.userId) : undefined,
    participant: {
      name: doc.participant.name,
      email: doc.participant.email,
      phone: doc.participant.phone,
      role: doc.participant.role,
      avatarUrl: doc.participant.avatarUrl,
    },
    lastMessage: doc.lastMessage
      ? {
          content: doc.lastMessage.content,
          sender: doc.lastMessage.sender,
          createdAt: doc.lastMessage.createdAt,
          status: doc.lastMessage.status,
        }
      : undefined,
    unreadCountAdmin: doc.unreadCountAdmin || 0,
    unreadCountUser: doc.unreadCountUser || 0,
    status: doc.status || "ACTIVE",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function serializeMessage(doc: IChatMessageDocument): IChatMessage {
  return {
    id: String(doc._id),
    conversationId: String(doc.conversationId),
    sender: doc.sender,
    senderName: doc.senderName,
    senderEmail: doc.senderEmail,
    senderAvatar: doc.senderAvatar,
    content: doc.content,
    status: doc.status,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    readAt: doc.readAt ? new Date(doc.readAt).toISOString() : undefined,
  };
}

export async function findOrCreateUserConversation(params: {
  channelId: string;
  userId?: string;
  participant: IChatParticipant;
}): Promise<IChatConversation> {
  const normalizedEmail = params.participant.email.toLowerCase().trim();
  const nowIso = new Date().toISOString();

  // Try MongoDB if available
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      // Find by channelId OR email
      const query = {
        $or: [
          { channelId: params.channelId },
          { "participant.email": normalizedEmail },
        ],
      };

      let doc = await ChatConversationModel.findOne(query);

      const safeUserId =
        params.userId && Types.ObjectId.isValid(params.userId)
          ? new Types.ObjectId(params.userId)
          : undefined;

      if (!doc) {
        doc = await ChatConversationModel.create({
          channelId: params.channelId,
          userId: safeUserId,
          participant: {
            name: params.participant.name || "Private Client",
            email: normalizedEmail,
            phone: params.participant.phone || "",
            role: params.participant.role || "GUEST",
            avatarUrl: params.participant.avatarUrl,
          },
          lastMessage: undefined,
          unreadCountAdmin: 0,
          unreadCountUser: 0,
          status: "ACTIVE",
        });
      } else {
        let updated = false;
        if (params.channelId && doc.channelId !== params.channelId) {
          doc.channelId = params.channelId;
          updated = true;
        }
        if (safeUserId && !doc.userId) {
          doc.userId = safeUserId;
          updated = true;
        }
        if (params.participant.name && doc.participant.name !== params.participant.name) {
          doc.participant.name = params.participant.name;
          updated = true;
        }
        if (params.participant.role && doc.participant.role !== params.participant.role) {
          doc.participant.role = params.participant.role;
          updated = true;
        }
        if (updated) {
          await doc.save();
        }
      }

      const serialized = serializeConversation(doc);
      memoryConversations.set(serialized.id, serialized);
      memoryConversations.set(serialized.channelId, serialized);
      return serialized;
    }
  } catch (err) {
    console.warn("MongoDB chat connection fallback, using resilient memory store:", err);
  }

  // Resilient In-Memory Fallback
  for (const existing of memoryConversations.values()) {
    if (
      existing.channelId === params.channelId ||
      existing.participant.email.toLowerCase() === normalizedEmail
    ) {
      existing.channelId = params.channelId;
      existing.participant.name = params.participant.name || existing.participant.name;
      existing.participant.role = params.participant.role || existing.participant.role;
      return existing;
    }
  }

  const fallbackId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fallbackConv: IChatConversation = {
    id: fallbackId,
    channelId: params.channelId,
    userId: params.userId,
    participant: {
      name: params.participant.name || "Private Client",
      email: normalizedEmail,
      phone: params.participant.phone || "",
      role: params.participant.role || "GUEST",
      avatarUrl: params.participant.avatarUrl,
    },
    unreadCountAdmin: 0,
    unreadCountUser: 0,
    status: "ACTIVE",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  memoryConversations.set(fallbackId, fallbackConv);
  memoryConversations.set(params.channelId, fallbackConv);
  return fallbackConv;
}

export async function getConversationById(id: string): Promise<IChatConversation | null> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose && Types.ObjectId.isValid(id)) {
      const doc = await ChatConversationModel.findById(id);
      if (doc) {
        const serialized = serializeConversation(doc);
        memoryConversations.set(serialized.id, serialized);
        return serialized;
      }
    }
  } catch {
    // Fall back to memory
  }

  return memoryConversations.get(id) || null;
}

export async function getAdminConversations(searchQuery?: string): Promise<{
  conversations: IChatConversation[];
  totalUnread: number;
}> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const filter: Record<string, unknown> = {};

      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.trim();
        filter.$or = [
          { "participant.name": { $regex: q, $options: "i" } },
          { "participant.email": { $regex: q, $options: "i" } },
          { "lastMessage.content": { $regex: q, $options: "i" } },
        ];
      }

      const docs = await ChatConversationModel.find(filter)
        .sort({ updatedAt: -1 })
        .limit(100);

      const conversations = docs.map(serializeConversation);
      for (const c of conversations) {
        memoryConversations.set(c.id, c);
      }

      const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCountAdmin || 0), 0);
      return { conversations, totalUnread };
    }
  } catch (err) {
    console.warn("MongoDB admin conversations fetch fallback:", err);
  }

  // Memory fallback
  let list = Array.from(new Set(memoryConversations.values()));
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.participant.name.toLowerCase().includes(q) ||
        c.participant.email.toLowerCase().includes(q) ||
        (c.lastMessage?.content.toLowerCase().includes(q) ?? false)
    );
  }
  list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const totalUnread = list.reduce((acc, conv) => acc + (conv.unreadCountAdmin || 0), 0);
  return { conversations: list, totalUnread };
}

export interface IGetConversationMessagesResult {
  messages: IChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

export async function getConversationMessages(
  conversationId: string,
  limit: number = 40,
  before?: string
): Promise<IGetConversationMessagesResult> {
  const safeLimit = Math.min(Math.max(1, limit), 100);

  try {
    const mongoose = await connectToDatabase();
    if (mongoose && Types.ObjectId.isValid(conversationId)) {
      const convObjectId = new Types.ObjectId(conversationId);
      const query: Record<string, unknown> = {
        conversationId: convObjectId,
      };

      if (before && before.trim()) {
        if (Types.ObjectId.isValid(before.trim())) {
          query._id = { $lt: new Types.ObjectId(before.trim()) };
        } else {
          const parsedDate = new Date(before.trim());
          if (!isNaN(parsedDate.getTime())) {
            query.createdAt = { $lt: parsedDate };
          }
        }
      }

      // Query newest messages first up to limit + 1
      const [docs, totalCount] = await Promise.all([
        ChatMessageModel.find(query)
          .sort({ createdAt: -1 })
          .limit(safeLimit + 1),
        ChatMessageModel.countDocuments({ conversationId: convObjectId }),
      ]);

      const hasMore = docs.length > safeLimit;
      const slicedDocs = hasMore ? docs.slice(0, safeLimit) : docs;

      // Reverse back to ascending order for natural chat display
      const messages = slicedDocs.reverse().map(serializeMessage);
      const nextCursor = messages.length > 0 ? messages[0].id : undefined;

      // Update in-memory cache
      if (!before) {
        memoryMessages.set(conversationId, messages);
      } else {
        const existing = memoryMessages.get(conversationId) || [];
        const mergedMap = new Map<string, IChatMessage>();
        for (const m of [...messages, ...existing]) {
          mergedMap.set(m.id, m);
        }
        const sorted = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        memoryMessages.set(conversationId, sorted);
      }

      return {
        messages,
        hasMore,
        nextCursor,
        totalCount,
      };
    }
  } catch (err) {
    console.warn("MongoDB getConversationMessages fallback:", err);
  }

  // Memory fallback
  const memList = memoryMessages.get(conversationId) || [];
  let filtered = [...memList];

  if (before && before.trim()) {
    const cursor = before.trim();
    const cursorIdx = filtered.findIndex((m) => m.id === cursor);
    if (cursorIdx !== -1) {
      filtered = filtered.slice(0, cursorIdx);
    }
  }

  const totalCount = memList.length;
  const hasMore = filtered.length > safeLimit;
  const sliced = filtered.slice(Math.max(0, filtered.length - safeLimit));
  const nextCursor = sliced.length > 0 ? sliced[0].id : undefined;

  return {
    messages: sliced,
    hasMore,
    nextCursor,
    totalCount,
  };
}

export async function saveChatMessage(params: {
  conversationId: string;
  sender: ChatSenderRole;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  content: string;
}): Promise<{ message: IChatMessage; conversation: IChatConversation }> {
  const nowIso = new Date().toISOString();
  let savedMessage: IChatMessage | null = null;
  let updatedConversation: IChatConversation | null = null;

  try {
    const mongoose = await connectToDatabase();
    if (mongoose && Types.ObjectId.isValid(params.conversationId)) {
      const convDoc = await ChatConversationModel.findById(params.conversationId);
      if (convDoc) {
        const messageDoc = await ChatMessageModel.create({
          conversationId: convDoc._id,
          sender: params.sender,
          senderName: params.senderName,
          senderEmail: params.senderEmail.toLowerCase().trim(),
          senderAvatar: params.senderAvatar,
          content: params.content.trim(),
          status: "SENT",
        });

        convDoc.lastMessage = {
          content: params.content.trim(),
          sender: params.sender,
          createdAt: nowIso,
          status: "SENT",
        };

        if (params.sender === "USER") {
          convDoc.unreadCountAdmin = (convDoc.unreadCountAdmin || 0) + 1;
        } else {
          convDoc.unreadCountUser = (convDoc.unreadCountUser || 0) + 1;
        }

        await convDoc.save();

        savedMessage = serializeMessage(messageDoc);
        updatedConversation = serializeConversation(convDoc);
      }
    }
  } catch (err) {
    console.warn("MongoDB save message fallback:", err);
  }

  // If DB was not available or convDoc not in DB, use memory fallback
  if (!savedMessage || !updatedConversation) {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    savedMessage = {
      id: msgId,
      conversationId: params.conversationId,
      sender: params.sender,
      senderName: params.senderName,
      senderEmail: params.senderEmail,
      senderAvatar: params.senderAvatar,
      content: params.content.trim(),
      status: "SENT",
      createdAt: nowIso,
    };

    let conv = memoryConversations.get(params.conversationId);
    if (!conv) {
      conv = {
        id: params.conversationId,
        channelId: params.conversationId,
        participant: {
          name: params.senderName,
          email: params.senderEmail,
          role: params.sender === "ADMIN" ? "ADMIN" : "CUSTOMER",
        },
        unreadCountAdmin: 0,
        unreadCountUser: 0,
        status: "ACTIVE",
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }

    conv.lastMessage = {
      content: params.content.trim(),
      sender: params.sender,
      createdAt: nowIso,
      status: "SENT",
    };
    conv.updatedAt = nowIso;

    if (params.sender === "USER") {
      conv.unreadCountAdmin = (conv.unreadCountAdmin || 0) + 1;
    } else {
      conv.unreadCountUser = (conv.unreadCountUser || 0) + 1;
    }

    memoryConversations.set(conv.id, conv);
    updatedConversation = conv;
  }

  // Update memory messages list
  const existingMsgs = memoryMessages.get(params.conversationId) || [];
  memoryMessages.set(params.conversationId, [...existingMsgs, savedMessage]);

  return { message: savedMessage, conversation: updatedConversation };
}

export async function markConversationAsRead(
  conversationId: string,
  reader: ChatSenderRole
): Promise<IChatConversation | null> {
  const now = new Date();

  try {
    const mongoose = await connectToDatabase();
    if (mongoose && Types.ObjectId.isValid(conversationId)) {
      const convDoc = await ChatConversationModel.findById(conversationId);
      if (convDoc) {
        if (reader === "ADMIN") {
          convDoc.unreadCountAdmin = 0;
          if (convDoc.lastMessage && convDoc.lastMessage.sender === "USER") {
            convDoc.lastMessage.status = "READ";
          }
          await ChatMessageModel.updateMany(
            { conversationId: convDoc._id, sender: "USER", status: { $ne: "READ" } },
            { $set: { status: "READ", readAt: now } }
          );
        } else {
          convDoc.unreadCountUser = 0;
          if (convDoc.lastMessage && convDoc.lastMessage.sender === "ADMIN") {
            convDoc.lastMessage.status = "READ";
          }
          await ChatMessageModel.updateMany(
            { conversationId: convDoc._id, sender: "ADMIN", status: { $ne: "READ" } },
            { $set: { status: "READ", readAt: now } }
          );
        }

        await convDoc.save();
        const serialized = serializeConversation(convDoc);
        memoryConversations.set(serialized.id, serialized);

        // Always keep in-memory messages array updated in sync
        const cached = memoryMessages.get(serialized.id);
        if (cached) {
          for (const m of cached) {
            if (reader === "ADMIN" && m.sender === "USER") {
              m.status = "READ";
            } else if (reader === "USER" && m.sender === "ADMIN") {
              m.status = "READ";
            }
          }
        }

        return serialized;
      }
    }
  } catch {
    // Memory fallback
  }

  const conv = memoryConversations.get(conversationId);
  if (conv) {
    if (reader === "ADMIN") {
      conv.unreadCountAdmin = 0;
      if (conv.lastMessage && conv.lastMessage.sender === "USER") {
        conv.lastMessage.status = "READ";
      }
    } else {
      conv.unreadCountUser = 0;
      if (conv.lastMessage && conv.lastMessage.sender === "ADMIN") {
        conv.lastMessage.status = "READ";
      }
    }
    const msgs = memoryMessages.get(conversationId);
    if (msgs) {
      for (const m of msgs) {
        if (reader === "ADMIN" && m.sender === "USER") {
          m.status = "READ";
        } else if (reader === "USER" && m.sender === "ADMIN") {
          m.status = "READ";
        }
      }
    }
    return conv;
  }

  return null;
}

export async function getTotalUnreadChatCount(params: {
  role: ChatSenderRole;
  userId?: string;
  email?: string;
}): Promise<number> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      if (params.role === "ADMIN") {
        const res = await ChatConversationModel.aggregate([
          { $match: { status: "ACTIVE" } },
          { $group: { _id: null, total: { $sum: "$unreadCountAdmin" } } },
        ]);
        return res[0]?.total || 0;
      }

      if (params.userId && Types.ObjectId.isValid(params.userId)) {
        const conv = await ChatConversationModel.findOne({
          userId: new Types.ObjectId(params.userId),
        });
        if (conv) return conv.unreadCountUser || 0;
      }

      if (params.email) {
        const conv = await ChatConversationModel.findOne({
          "participant.email": params.email.toLowerCase().trim(),
        });
        if (conv) return conv.unreadCountUser || 0;
      }
    }
  } catch {
    // Memory fallback
  }

  // Memory fallback
  if (params.role === "ADMIN") {
    let total = 0;
    for (const c of memoryConversations.values()) {
      total += c.unreadCountAdmin || 0;
    }
    return total;
  }

  if (params.email) {
    const emailNorm = params.email.toLowerCase().trim();
    for (const c of memoryConversations.values()) {
      if (c.participant.email.toLowerCase() === emailNorm) {
        return c.unreadCountUser || 0;
      }
    }
  }

  return 0;
}
