"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Loader2,
  Check,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import {
  Chat,
  ChatMessage,
  GowaResponse,
  ChatMessagesResult,
  formatMessageTime,
  getDisplayName,
  isGroupJid,
} from "./types";
import { ContactLinkDialog } from "./ContactLinkDialog";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
}

export function ChatView({ chat, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contactName, setContactName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getToken = () => localStorage.getItem("admin_token");

  const fetchContactName = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/contacts/${encodeURIComponent(chat.jid)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setContactName(data.name);
        } else {
          setContactName(null);
        }
      }
    } catch (err) {
      console.error("Error fetching contact:", err);
      setContactName(null);
    }
  }, [chat.jid]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/admin/whatsapp/chat/${encodeURIComponent(
          chat.jid
        )}/messages?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        throw new Error("Error al cargar mensajes");
      }

      const data: GowaResponse<ChatMessagesResult> = await res.json();
      // Reverse to show oldest first
      setMessages((data.results?.data || []).reverse());
    } catch (err: any) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [chat.jid]);

  useEffect(() => {
    fetchMessages();
    fetchContactName();
  }, [fetchMessages, fetchContactName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [chat.jid]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/send/message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: chat.jid,
            message: newMessage.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Error al enviar mensaje");
      }

      // Add optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        chat_jid: chat.jid,
        sender_jid: "me",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        is_from_me: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");

      // Refresh to get real message
      setTimeout(fetchMessages, 1000);
    } catch (err: any) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateAI = async () => {
    if (generatingAI) return;

    try {
      setGeneratingAI(true);
      const token = getToken();

      // Build conversation history from messages
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.is_from_me ? "assistant" : "user",
        content: msg.content,
      }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/generate-response`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jid: chat.jid,
            conversationHistory,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al generar respuesta");
      }

      const data = await res.json();
      setNewMessage(data.response);
      inputRef.current?.focus();
    } catch (err: any) {
      console.error("Error generating AI response:", err);
      alert(err.message || "Error al generar respuesta con IA");
    } finally {
      setGeneratingAI(false);
    }
  };

  const isGroup = isGroupJid(chat.jid);
  const displayName = contactName || getDisplayName(chat.jid, chat.name);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-background shrink-0">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {isGroup ? "G" : getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {isGroup ? "Grupo" : "En línea"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ContactLinkDialog
            jid={chat.jid}
            currentName={getDisplayName(chat.jid, chat.name)}
            onContactUpdated={fetchContactName}
          />
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto overflow-x-hidden min-h-0 min-w-0">
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-start" : "justify-end"
                )}
              >
                <Skeleton
                  className={cn(
                    "h-12 rounded-lg",
                    i % 2 === 0 ? "w-48" : "w-64"
                  )}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No hay mensajes</p>
          </div>
        ) : (
          <div className="space-y-4 min-w-0 w-full">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                    {date}
                  </span>
                </div>
                <div className="space-y-2">
                  {dateMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isGroup={isGroup}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-background shrink-0 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGenerateAI}
            disabled={generatingAI}
            title="Generar respuesta con IA"
          >
            {generatingAI ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 text-purple-500" />
            )}
          </Button>
          <Input
            ref={inputRef}
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isGroup: boolean;
}

function MessageBubble({ message, isGroup }: MessageBubbleProps) {
  const isFromMe = message.is_from_me;
  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex min-w-0", isFromMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-3 py-2 shadow-sm overflow-hidden break-words",
          isFromMe
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted rounded-bl-none"
        )}
      >
        {isGroup && !isFromMe && (
          <p className="text-xs font-semibold mb-1 text-green-600">
            {getDisplayName(message.sender_jid)}
          </p>
        )}

        {message.media_type && message.url && (
          <div className="mb-2">
            {message.media_type === "image" ? (
              <img
                src={message.url}
                alt="Image"
                className="max-w-full rounded"
              />
            ) : (
              <a
                href={message.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                {message.filename || "Descargar archivo"}
              </a>
            )}
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap break-all overflow-hidden" style={{ overflowWrap: 'anywhere' }}>
          {message.content}
        </p>

        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-1",
            isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span className="text-[10px]">{time}</span>
          {isFromMe && <CheckCheck className="h-3.5 w-3.5" />}
        </div>
      </div>
    </div>
  );
}
