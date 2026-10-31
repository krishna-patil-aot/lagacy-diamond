import { IChatMessage } from "@/types/chat.types";

export interface IGroupedMessageItem {
  message: IChatMessage;
  showSenderHeader: boolean;
  isFirstInCluster: boolean;
  isLastInCluster: boolean;
}

export interface IMessageDateGroup {
  dateLabel: string;
  items: IGroupedMessageItem[];
}

export function formatChatDateLabel(isoString?: string): string {
  if (!isoString) return "Recent";
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return d.toLocaleDateString(undefined, { weekday: "long" });
    }

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Recent";
  }
}

export function groupMessagesByDateAndSender(messages: IChatMessage[]): IMessageDateGroup[] {
  if (!messages || messages.length === 0) return [];

  const groups: IMessageDateGroup[] = [];
  let currentDateLabel = "";
  let currentGroupItems: IGroupedMessageItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prevMsg = i > 0 ? messages[i - 1] : null;
    const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;

    const dateLabel = formatChatDateLabel(msg.createdAt);

    if (dateLabel !== currentDateLabel) {
      if (currentGroupItems.length > 0) {
        groups.push({ dateLabel: currentDateLabel, items: currentGroupItems });
      }
      currentDateLabel = dateLabel;
      currentGroupItems = [];
    }

    const isSameSenderAsPrev =
      prevMsg !== null &&
      prevMsg.sender === msg.sender &&
      formatChatDateLabel(prevMsg.createdAt) === dateLabel &&
      Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 300000;

    const isSameSenderAsNext =
      nextMsg !== null &&
      nextMsg.sender === msg.sender &&
      formatChatDateLabel(nextMsg.createdAt) === dateLabel &&
      Math.abs(new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 300000;

    const isFirstInCluster = !isSameSenderAsPrev;
    const isLastInCluster = !isSameSenderAsNext;
    const showSenderHeader = isFirstInCluster;

    currentGroupItems.push({
      message: msg,
      showSenderHeader,
      isFirstInCluster,
      isLastInCluster,
    });
  }

  if (currentGroupItems.length > 0) {
    groups.push({ dateLabel: currentDateLabel, items: currentGroupItems });
  }

  return groups;
}

