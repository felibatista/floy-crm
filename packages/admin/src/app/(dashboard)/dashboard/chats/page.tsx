"use client";

import { useEffect } from "react";
import { MessageSquare } from "lucide-react";

export default function ChatsPage() {
  useEffect(() => {
    document.title = "Chats | Acentus";
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
      <MessageSquare className="h-12 w-12 mb-4" />
      <h2 className="text-lg font-medium">Chats de WhatsApp</h2>
      <p className="text-sm">Próximamente</p>
    </div>
  );
}
