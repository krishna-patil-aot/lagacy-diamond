import { connectToDatabase } from "@/lib/db";
import { InquiryModel } from "@/models/Inquiry";
import {
  IInquiry,
  ICreateInquiryInput,
  InquiryStatus,
  IInquiryStats,
} from "@/types/inquiry.types";

const memoryInquiries: IInquiry[] = [];

export function sanitizeInquiryDoc(doc: {
  _id?: string | { toString(): string };
  id?: string;
  inquiryNumber?: string;
  fullName: string;
  email: string;
  phone?: string;
  inquiryType: IInquiry["inquiryType"];
  preferredCaratRange?: string;
  budgetRange?: string;
  message: string;
  messages?: IInquiry["messages"];
  status: InquiryStatus;
  adminNotes?: string;
  adminReply?: string;
  repliedAt?: Date | string | null;
  repliedBy?: string | null;
  isClientRead?: boolean | null;
  unreadClientCount?: number | null;
  unreadAdminCount?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}): IInquiry {
  const idStr = String(doc.id || doc._id || "");
  const inquiryNumberStr = doc.inquiryNumber || `INQ-${idStr.slice(-6).toUpperCase()}`;

  // Ensure messages array exists and contains at least initial inquiry
  const messages =
    Array.isArray(doc.messages) && doc.messages.length > 0
      ? doc.messages
      : [
          {
            id: `msg-${idStr}-init`,
            sender: "CLIENT" as const,
            senderName: doc.fullName || "Valued Client",
            senderEmail: doc.email || "",
            message: doc.message || "",
            createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          },
        ];

  return {
    id: idStr,
    inquiryNumber: inquiryNumberStr,
    fullName: doc.fullName || "Valued Client",
    email: doc.email || "",
    phone: doc.phone || "",
    inquiryType: doc.inquiryType || "GENERAL_INQUIRY",
    preferredCaratRange: doc.preferredCaratRange || "",
    budgetRange: doc.budgetRange || "",
    message: doc.message || "",
    messages,
    status: doc.status || "NEW",
    adminNotes: doc.adminNotes || "",
    adminReply: doc.adminReply || "",
    repliedAt: doc.repliedAt ? new Date(doc.repliedAt).toISOString() : undefined,
    repliedBy: doc.repliedBy || "",
    isClientRead: Boolean(doc.isClientRead),
    unreadClientCount: typeof doc.unreadClientCount === "number" ? doc.unreadClientCount : 0,
    unreadAdminCount: typeof doc.unreadAdminCount === "number" ? doc.unreadAdminCount : 0,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}

export async function createInquiry(input: ICreateInquiryInput): Promise<IInquiry> {
  const mongoose = await connectToDatabase();
  const inquiryNumber = `INQ-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const initialMessage = {
    id: `msg-${Date.now()}`,
    sender: "CLIENT" as const,
    senderName: input.fullName.trim(),
    senderEmail: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    createdAt: nowIso,
  };

  if (mongoose) {
    const newDoc = await InquiryModel.create({
      inquiryNumber,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || "",
      inquiryType: input.inquiryType || "GENERAL_INQUIRY",
      preferredCaratRange: input.preferredCaratRange?.trim() || "",
      budgetRange: input.budgetRange?.trim() || "",
      message: input.message.trim(),
      messages: [initialMessage],
      status: "NEW",
      unreadClientCount: 0,
      unreadAdminCount: 1,
    });

    return sanitizeInquiryDoc(newDoc.toObject());
  }

  // Memory fallback
  const memoryInquiry: IInquiry = {
    id: `mem-${inquiryNumber}`,
    inquiryNumber,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || "",
    inquiryType: input.inquiryType || "GENERAL_INQUIRY",
    preferredCaratRange: input.preferredCaratRange?.trim() || "",
    budgetRange: input.budgetRange?.trim() || "",
    message: input.message.trim(),
    messages: [initialMessage],
    status: "NEW",
    unreadClientCount: 0,
    unreadAdminCount: 1,
    createdAt: nowIso,
  };

  memoryInquiries.unshift(memoryInquiry);
  return memoryInquiry;
}

export async function getAllInquiriesAdmin(
  statusFilter?: InquiryStatus | "ALL",
  searchQuery?: string
): Promise<IInquiry[]> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const query: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== "ALL") {
      query.status = statusFilter;
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const regex = new RegExp(searchQuery.trim(), "i");
      query.$or = [
        { inquiryNumber: regex },
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { message: regex },
      ];
    }

    const docs = await InquiryModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(sanitizeInquiryDoc);
  }

  // Memory fallback
  let list = memoryInquiries;
  if (statusFilter && statusFilter !== "ALL") {
    list = list.filter((item) => item.status === statusFilter);
  }
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.inquiryNumber.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function getInquiryById(id: string): Promise<IInquiry | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    let doc;
    try {
      doc = await InquiryModel.findById(id).lean();
    } catch {
      doc = await InquiryModel.findOne({ inquiryNumber: id.toUpperCase() }).lean();
    }
    if (!doc) return null;
    return sanitizeInquiryDoc(doc);
  }

  const found = memoryInquiries.find(
    (item) => item.id === id || item.inquiryNumber.toUpperCase() === id.toUpperCase()
  );
  return found || null;
}

export async function updateInquiryStatus(
  id: string,
  newStatus: InquiryStatus,
  adminNotes?: string,
  adminReply?: string
): Promise<IInquiry | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    let doc = await InquiryModel.findById(id);
    if (!doc) {
      doc = await InquiryModel.findOne({ inquiryNumber: id.toUpperCase() });
    }
    if (!doc) return null;

    doc.status = newStatus;
    if (typeof adminNotes === "string") {
      doc.adminNotes = adminNotes;
    }
    if (typeof adminReply === "string" && adminReply.trim()) {
      doc.adminReply = adminReply.trim();
      doc.repliedAt = new Date();
      doc.isClientRead = false;
    }

    await doc.save();
    return sanitizeInquiryDoc(doc.toObject());
  }

  const index = memoryInquiries.findIndex(
    (item) => item.id === id || item.inquiryNumber.toUpperCase() === id.toUpperCase()
  );
  if (index === -1) return null;

  const current = memoryInquiries[index];
  const updated: IInquiry = {
    ...current,
    status: newStatus,
    adminNotes: typeof adminNotes === "string" ? adminNotes : current.adminNotes,
    adminReply: typeof adminReply === "string" ? adminReply.trim() : current.adminReply,
    repliedAt: typeof adminReply === "string" ? new Date().toISOString() : current.repliedAt,
    isClientRead: typeof adminReply === "string" ? false : current.isClientRead,
    updatedAt: new Date().toISOString(),
  };

  memoryInquiries[index] = updated;
  return updated;
}

export async function replyToInquiry(
  idOrNumber: string,
  replyText: string,
  adminEmail: string,
  newStatus: InquiryStatus = "IN_PROGRESS"
): Promise<IInquiry | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    let doc = await InquiryModel.findById(idOrNumber);
    if (!doc) {
      doc = await InquiryModel.findOne({ inquiryNumber: idOrNumber.toUpperCase() });
    }
    if (!doc) return null;

    doc.adminReply = replyText.trim();
    doc.repliedAt = new Date();
    doc.repliedBy = adminEmail;
    doc.status = newStatus;
    doc.isClientRead = false;

    await doc.save();
    return sanitizeInquiryDoc(doc.toObject());
  }

  const index = memoryInquiries.findIndex(
    (item) => item.id === idOrNumber || item.inquiryNumber.toUpperCase() === idOrNumber.toUpperCase()
  );
  if (index === -1) return null;

  const current = memoryInquiries[index];
  const updated: IInquiry = {
    ...current,
    adminReply: replyText.trim(),
    repliedAt: new Date().toISOString(),
    repliedBy: adminEmail,
    status: newStatus,
    isClientRead: false,
    updatedAt: new Date().toISOString(),
  };

  memoryInquiries[index] = updated;
  return updated;
}

export async function getClientInquiriesByEmail(email: string): Promise<IInquiry[]> {
  const mongoose = await connectToDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  if (mongoose) {
    const docs = await InquiryModel.find({ email: normalizedEmail })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(sanitizeInquiryDoc);
  }

  return memoryInquiries
    .filter((item) => item.email.toLowerCase() === normalizedEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markInquiryAsReadByClient(
  idOrNumber: string,
  clientEmail?: string
): Promise<IInquiry | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const filter: Record<string, unknown> = {};
    if (idOrNumber.startsWith("INQ-")) {
      filter.inquiryNumber = idOrNumber.toUpperCase();
    } else {
      filter._id = idOrNumber;
    }
    if (clientEmail) {
      filter.email = clientEmail.trim().toLowerCase();
    }

    const doc = await InquiryModel.findOne(filter);
    if (!doc) return null;

    doc.isClientRead = true;
    doc.unreadClientCount = 0;
    await doc.save();
    return sanitizeInquiryDoc(doc.toObject());
  }

  const index = memoryInquiries.findIndex(
    (item) =>
      (item.id === idOrNumber || item.inquiryNumber.toUpperCase() === idOrNumber.toUpperCase()) &&
      (!clientEmail || item.email.toLowerCase() === clientEmail.trim().toLowerCase())
  );
  if (index === -1) return null;

  memoryInquiries[index].isClientRead = true;
  memoryInquiries[index].unreadClientCount = 0;
  return memoryInquiries[index];
}

export async function markInquiryAsReadByAdmin(idOrNumber: string): Promise<IInquiry | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const filter: Record<string, unknown> = {};
    if (idOrNumber.toUpperCase().startsWith("INQ-")) {
      filter.inquiryNumber = idOrNumber.toUpperCase();
    } else {
      filter._id = idOrNumber;
    }

    const doc = await InquiryModel.findOne(filter);
    if (!doc) return null;

    doc.unreadAdminCount = 0;
    await doc.save();
    return sanitizeInquiryDoc(doc.toObject());
  }

  const cleanKey = idOrNumber.toUpperCase();
  const index = memoryInquiries.findIndex(
    (item) => item.id === idOrNumber || item.inquiryNumber.toUpperCase() === cleanKey
  );
  if (index === -1) return null;

  memoryInquiries[index].unreadAdminCount = 0;
  return memoryInquiries[index];
}

export async function getAllUnreadInquiriesAdmin(): Promise<{ inquiries: IInquiry[]; unreadCount: number }> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const docs = await InquiryModel.find({
      $or: [
        { unreadAdminCount: { $gt: 0 } },
        { status: "NEW" },
      ],
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(40)
      .lean();

    const inquiries = docs.map(sanitizeInquiryDoc);
    const unreadCount = inquiries.reduce(
      (acc, curr) => acc + (curr.unreadAdminCount && curr.unreadAdminCount > 0 ? curr.unreadAdminCount : 1),
      0
    );

    return { inquiries, unreadCount };
  }

  const inquiries = memoryInquiries
    .filter((item) => (item.unreadAdminCount && item.unreadAdminCount > 0) || item.status === "NEW")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = inquiries.reduce(
    (acc, curr) => acc + (curr.unreadAdminCount && curr.unreadAdminCount > 0 ? curr.unreadAdminCount : 1),
    0
  );

  return { inquiries, unreadCount };
}

export async function getInquiriesByTicketNumbers(ticketNumbers: string[]): Promise<IInquiry[]> {
  if (!ticketNumbers.length) return [];
  const cleanNumbers = ticketNumbers.map((t) => t.trim().toUpperCase()).filter(Boolean);
  if (!cleanNumbers.length) return [];

  const mongoose = await connectToDatabase();
  if (mongoose) {
    const docs = await InquiryModel.find({
      inquiryNumber: { $in: cleanNumbers },
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();
    return docs.map(sanitizeInquiryDoc);
  }

  return memoryInquiries
    .filter((item) => cleanNumbers.includes(item.inquiryNumber.toUpperCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getInquiryByNumber(inquiryNumber: string): Promise<IInquiry | null> {
  const cleanNumber = inquiryNumber.trim().toUpperCase();
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const doc = await InquiryModel.findOne({ inquiryNumber: cleanNumber }).lean();
    if (!doc) return null;
    return sanitizeInquiryDoc(doc);
  }

  const found = memoryInquiries.find((i) => i.inquiryNumber.toUpperCase() === cleanNumber);
  return found || null;
}

export async function getInquiryStats(): Promise<IInquiryStats> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const [total, newCount, inProgressCount, resolvedCount] = await Promise.all([
      InquiryModel.countDocuments({}),
      InquiryModel.countDocuments({ status: "NEW" }),
      InquiryModel.countDocuments({ status: "IN_PROGRESS" }),
      InquiryModel.countDocuments({ status: "RESOLVED" }),
    ]);

    return { total, newCount, inProgressCount, resolvedCount };
  }

  return {
    total: memoryInquiries.length,
    newCount: memoryInquiries.filter((i) => i.status === "NEW").length,
    inProgressCount: memoryInquiries.filter((i) => i.status === "IN_PROGRESS").length,
    resolvedCount: memoryInquiries.filter((i) => i.status === "RESOLVED").length,
  };
}

export async function addInquiryMessage(
  idOrNumber: string,
  input: {
    sender: "CLIENT" | "ADMIN" | "SYSTEM";
    senderName: string;
    senderEmail: string;
    message: string;
  }
): Promise<IInquiry | null> {
  const mongoose = await connectToDatabase();
  const nowIso = new Date().toISOString();
  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: input.sender,
    senderName: input.senderName.trim(),
    senderEmail: input.senderEmail.trim().toLowerCase(),
    message: input.message.trim(),
    createdAt: nowIso,
  };

  if (mongoose) {
    const isNum = idOrNumber.toUpperCase().startsWith("INQ-");
    let doc = isNum
      ? await InquiryModel.findOne({ inquiryNumber: idOrNumber.toUpperCase() })
      : await InquiryModel.findById(idOrNumber);

    if (!doc && !isNum) {
      doc = await InquiryModel.findOne({ inquiryNumber: idOrNumber.toUpperCase() });
    }
    if (!doc) return null;

    if (!Array.isArray(doc.messages)) {
      doc.messages = [
        {
          id: `msg-init-${doc._id}`,
          sender: "CLIENT",
          senderName: doc.fullName || "Client",
          senderEmail: doc.email || "",
          message: doc.message || "",
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : nowIso,
        },
      ];
    }

    doc.messages.push(newMessage);

    if (input.sender === "ADMIN") {
      doc.adminReply = input.message.trim();
      doc.repliedAt = new Date();
      doc.repliedBy = input.senderEmail;
      doc.isClientRead = false;
      doc.unreadClientCount = (doc.unreadClientCount || 0) + 1;
      if (doc.status === "NEW") {
        doc.status = "IN_PROGRESS";
      }
    } else {
      doc.isClientRead = true;
      doc.unreadAdminCount = (doc.unreadAdminCount || 0) + 1;
      if (doc.status === "RESOLVED") {
        doc.status = "IN_PROGRESS";
      }
    }

    await doc.save();
    return sanitizeInquiryDoc(doc.toObject());
  }

  // Memory fallback
  const cleanKey = idOrNumber.toUpperCase();
  const index = memoryInquiries.findIndex(
    (i) => i.id === idOrNumber || i.inquiryNumber.toUpperCase() === cleanKey
  );
  if (index === -1) return null;

  const current = memoryInquiries[index];
  const messages = [...(current.messages || [])];
  messages.push(newMessage);

  const updated: IInquiry = {
    ...current,
    messages,
    updatedAt: nowIso,
  };

  if (input.sender === "ADMIN") {
    updated.adminReply = input.message.trim();
    updated.repliedAt = nowIso;
    updated.repliedBy = input.senderEmail;
    updated.isClientRead = false;
    updated.unreadClientCount = (updated.unreadClientCount || 0) + 1;
    if (updated.status === "NEW") updated.status = "IN_PROGRESS";
  } else {
    updated.isClientRead = true;
    updated.unreadAdminCount = (updated.unreadAdminCount || 0) + 1;
    if (updated.status === "RESOLVED") updated.status = "IN_PROGRESS";
  }

  memoryInquiries[index] = updated;
  return updated;
}

