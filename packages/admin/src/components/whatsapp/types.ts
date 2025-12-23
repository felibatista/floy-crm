// WhatsApp API Response Types

export interface GowaResponse<T = any> {
  code: string;
  message: string;
  results: T;
}

export interface LoginResult {
  qr_duration: number;
  qr_link: string;
}

export interface LoginWithCodeResult {
  pair_code: string;
}

export interface Device {
  name: string;
  device: string;
}

export interface ConnectionStatus {
  connected: boolean;
  devices: Device[];
}

export interface Chat {
  jid: string;
  name: string;
  last_message_time: string;
  ephemeral_expiration: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
  unread_count?: number;
  is_group?: boolean;
}

export interface ChatMessage {
  id: string;
  chat_jid: string;
  sender_jid: string;
  content: string;
  timestamp: string;
  is_from_me: boolean;
  media_type?: string | null;
  filename?: string | null;
  url?: string | null;
  file_length?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChatListPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface ChatListResult {
  data: Chat[];
  pagination: ChatListPagination;
}

export interface ChatMessagesResult {
  data: ChatMessage[];
  pagination: ChatListPagination;
  chat_info: Chat;
}

export interface Contact {
  jid: string;
  name: string;
}

export interface SendMessageResult {
  message_id: string;
  status: string;
}

export interface UserInfo {
  verified_name: string;
  status: string;
  picture_id: string;
  devices: Array<{
    User: string;
    Agent: number;
    Device: string;
    Server: string;
    AD: boolean;
  }>;
}

export interface UserAvatar {
  url: string;
  id: string;
  type: string;
}

// Helper function to format JID
export function formatJid(phone: string): string {
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Remove leading + if present
  const withoutPlus = cleaned.replace(/^\+/, "");
  // Add WhatsApp suffix
  return `${withoutPlus}@s.whatsapp.net`;
}

// Helper to get display name from JID
export function getDisplayName(jid: string, name?: string): string {
  if (name) return name;
  // Extract phone number from JID
  const phone = jid.split("@")[0];
  return phone;
}

// Helper to check if JID is a group
export function isGroupJid(jid: string): boolean {
  return jid.endsWith("@g.us");
}

// Format timestamp for display
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return "Ayer";
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
