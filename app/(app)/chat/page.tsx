"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { queryHealthData } from "@/lib/actions/chat";

type Message = {
  role: "user" | "ai";
  content: string;
};

const suggestions = [
  "What was my last HbA1c?",
  "Is my cholesterol improving?",
  "Show my Vitamin D trend",
  "Any abnormal values recently?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "I have access to your full medical archive. Ask me anything about your biomarkers, trends, or past reports.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setIsLoading(true);

    const result = await queryHealthData(messageText);
    setIsLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          result.success && result.text
            ? (result.text as string)
            : result.error || "Something went wrong. Please try again.",
      },
    ]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-[100dvh] md:h-screen animate-in fade-in duration-500">

      {/* Sticky Header */}
      <header className="px-6 pt-10 pb-4 bg-[#F4F3F0]/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1A365D] rounded-[12px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold text-slate-800 tracking-tight leading-none">Ledger AI</h1>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">Your personal health intelligence</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-6">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-7 h-7 bg-[#1A365D] rounded-[10px] flex items-center justify-center shrink-0 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            <div
              className={`px-4 py-3.5 max-w-[80%] text-[15px] leading-relaxed font-medium shadow-sm ${
                msg.role === "user"
                  ? "bg-[#1A365D] text-white rounded-[20px] rounded-br-[6px]"
                  : "bg-white border border-slate-100 text-slate-700 rounded-[20px] rounded-bl-[6px]"
              }`}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 bg-slate-200 rounded-[10px] flex items-center justify-center shrink-0 mb-0.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
          </div>
        ))}

        {/* Loading bubble */}
        {isLoading && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-7 h-7 bg-[#1A365D] rounded-[10px] flex items-center justify-center shrink-0 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="px-5 py-4 bg-white border border-slate-100 rounded-[20px] rounded-bl-[6px] shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion chips — only on first load */}
        {showSuggestions && !isLoading && (
          <div className="pt-2">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[13px] font-semibold rounded-full shadow-sm hover:border-[#1A365D]/40 hover:text-[#1A365D] hover:bg-blue-50 transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input bar — pinned to bottom, above mobile nav */}
      <div className="shrink-0 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-xl border-t border-slate-100 md:pb-4 mb-[72px] md:mb-0">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Show my last HbA1c..."
            className="flex-1 h-12 pl-5 pr-4 bg-slate-50 border-slate-200 text-[15px] font-medium rounded-[16px] focus-visible:ring-1 focus-visible:ring-[#1A365D]/30 shadow-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 bg-[#1A365D] hover:bg-[#12243e] text-white rounded-[16px] shadow-md transition-all disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>

    </div>
  );
}
