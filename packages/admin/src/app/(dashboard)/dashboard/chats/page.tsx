"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Settings, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  QRLogin,
  ChatsList,
  ChatView,
  Chat,
  ConnectionStatus,
  AutoResponseSettings,
} from "@/components/whatsapp";
import { cn } from "@/lib/utils";

export default function ChatsPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    document.title = "Chats | Acentus";
  }, []);

  const getToken = () => localStorage.getItem("admin_token");

  const checkConnection = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data: ConnectionStatus = await res.json();
        setIsConnected(data.connected);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleLogout = async () => {
    try {
      const token = getToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/logout`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsConnected(false);
      setSelectedChat(null);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  // Show loading state
  if (isConnected === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login if not connected
  if (!isConnected) {
    return <QRLogin onConnected={() => setIsConnected(true)} />;
  }

  // Main chat interface
  return (
    <div className="h-[calc(99vh-var(--header-height))] flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-green-500">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Conectado
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AutoResponseSettings />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={checkConnection}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar estado
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Desconectar
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat layout */}
      <div className="flex-1 flex min-h-0 min-w-0">
        {/* Chats list - hidden on mobile when chat is selected */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r flex-shrink-0",
            showMobileChat && "hidden md:block"
          )}
        >
          <ChatsList
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
          />
        </div>

        {/* Chat view */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            !showMobileChat && "hidden md:flex"
          )}
        >
          {selectedChat ? (
            <ChatView chat={selectedChat} onBack={handleBackToList} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Selecciona un chat</p>
              <p className="text-sm">para comenzar a conversar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
