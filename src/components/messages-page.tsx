"use client";

import { useState, useEffect, useRef } from "react";
import { getConversations, getThread, sendMessage } from "@/app/actions-messages";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";

type Conversation = {
  other_id: string;
  other_name: string;
  other_role: string;
  last_message: string;
  last_at: string;
  unread_count: number;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export default function MessagesPageClient({ initialThreadWith }: { initialThreadWith?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(initialThreadWith || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ full_name: string; role: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeThread) loadThread(activeThread);
  }, [activeThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    const res = await getConversations();
    if (res.conversations) setConversations(res.conversations);
    setLoading(false);
  };

  const loadThread = async (userId: string) => {
    const res = await getThread(userId);
    if (res.messages) setMessages(res.messages);
    if (res.otherUser) setOtherUser(res.otherUser);
    if (res.currentUserId) setCurrentUserId(res.currentUserId);
    // Refresh conversation list to update unread counts
    const convRes = await getConversations();
    if (convRes.conversations) setConversations(convRes.conversations);
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !activeThread || sending) return;
    setSending(true);
    const result = await sendMessage(activeThread, newMsg);
    if (!result.error) {
      setNewMsg("");
      await loadThread(activeThread);
    }
    setSending(false);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Thread view
  if (activeThread) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a] mb-4">
          <button onClick={() => setActiveThread(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF94]/20 to-[#0088ff]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {(otherUser?.full_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{otherUser?.full_name || "Unknown"}</p>
            <p className="text-gray-500 text-xs capitalize">{otherUser?.role || ""}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.length === 0 && (
            <p className="text-gray-500 text-center text-sm py-10">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? "bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20 rounded-br-md"
                      : "bg-[#111] text-gray-200 border border-[#1a1a1a] rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-[#00FF94]/40" : "text-gray-600"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="pt-4 border-t border-[#1a1a1a] mt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-[#111] border border-[#1a1a1a] rounded-xl focus:outline-none focus:border-[#00FF94]/50 text-white text-sm placeholder:text-gray-600"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMsg.trim()}
              className="p-3 bg-[#00FF94] text-black rounded-xl hover:brightness-90 disabled:opacity-30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-1">Messages</h1>
      <p className="text-gray-500 text-sm mb-8">Your conversations</p>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No messages yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Messages will appear here when you start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const initials = conv.other_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <button
                key={conv.other_id}
                onClick={() => setActiveThread(conv.other_id)}
                className="w-full flex items-center gap-4 p-4 bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl hover:border-[#00FF94]/20 transition-all text-left"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00FF94]/20 to-[#0088ff]/20 border border-white/10 flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-sm font-bold text-white">{initials}</span>
                  {conv.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00FF94] rounded-full flex items-center justify-center">
                      <span className="text-black text-[10px] font-bold">{conv.unread_count}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-medium text-sm ${conv.unread_count > 0 ? "text-white" : "text-gray-300"}`}>
                      {conv.other_name}
                    </span>
                    <span className="text-gray-600 text-xs flex-shrink-0">{formatTime(conv.last_at)}</span>
                  </div>
                  <p className={`text-xs truncate ${conv.unread_count > 0 ? "text-gray-300" : "text-gray-500"}`}>
                    {conv.last_message}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
