"use client";

import { useEffect } from "react";
import { MessageSquare } from "lucide-react";

export default function ChatsPage() {
  useEffect(() => {
    document.title = "Chats | Acentus";
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground"></div>
  );
}
