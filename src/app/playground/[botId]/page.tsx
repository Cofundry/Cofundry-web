"use client";
import { useState } from "react";
import PlaygroundPage from "@/app/dashboard/bots/[botId]/playground/page";
import { MoreVertical } from "lucide-react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {open && (
    
            <PlaygroundPage  />
         
      )}
    </>
  );
}
