"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, User } from "lucide-react";
import {
  Chat,
  GowaResponse,
  ChatListResult,
  formatMessageTime,
  getDisplayName,
  isGroupJid,
} from "./types";
import { cn } from "@/lib/utils";

interface ChatsListProps {
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export function ChatsList({ selectedChat, onSelectChat }: ChatsListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contactNames, setContactNames] = useState<Record<string, string>>({});

  const getToken = () => localStorage.getItem("admin_token");

  const fetchContactNames = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/contacts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const contacts = await res.json();
        const namesMap: Record<string, string> = {};
        contacts.forEach((contact: any) => {
          namesMap[contact.jid] = contact.name;
        });
        setContactNames(namesMap);
      }
    } catch (err) {
      console.error("Error fetching contact names:", err);
    }
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/chats?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        throw new Error("Error al cargar chats");
      }

      const data: GowaResponse<ChatListResult> = await res.json();
      setChats(data.results?.data || []);
    } catch (err: any) {
      setError(err.message);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchChats();
    fetchContactNames();
  }, [fetchChats, fetchContactNames]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar chat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="p-2 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No hay chats</p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => {
              const isGroup = isGroupJid(chat.jid);
              const displayName = contactNames[chat.jid] || getDisplayName(chat.jid, chat.name);
              const isSelected = selectedChat?.jid === chat.jid;

              return (
                <button
                  key={chat.jid}
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    "hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      className={
                        isGroup ? "bg-green-500/10 text-green-500" : ""
                      }
                    >
                      {isGroup ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        getInitials(displayName)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">
                        {displayName}
                      </span>
                      {chat.last_message_time && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatMessageTime(chat.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message || "Sin mensajes"}
                      </p>
                      {chat.unread_count && chat.unread_count > 0 && (
                        <Badge
                          variant="default"
                          className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs"
                        >
                          {chat.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
