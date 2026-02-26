"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquareText, Send, Loader2, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import our secure Server Action
import { queryHealthData } from "@/lib/actions/chat";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "I am ready to query your medical archive. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Call the AI securely through our Server Action
    const result = await queryHealthData(userMessage);

    setIsLoading(false);

    if (result.success && result.text) {
      setMessages(prev => [...prev, { role: "ai", content: result.text as string }]);
    } else {
      setMessages(prev => [...prev, { role: "ai", content: result.error || "An error occurred while querying your data." }]);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-2xl mx-auto pb-20">
      
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Intelligence</h1>
        <p className="text-slate-500 mt-2 font-medium leading-relaxed">
          Ask precise questions about your historical biomarker data.
        </p>
      </header>

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            
            {msg.role === "ai" && (
              <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                <Activity className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Ledger AI</span>
              </div>
            )}

            <div className={`px-5 py-3.5 max-w-[85%] text-[15px] leading-relaxed font-medium ${
              msg.role === "user" 
                ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm shadow-sm" 
                : "bg-white border border-slate-200/60 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm"
            }`}>
              {msg.content}
            </div>

          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col items-start">
             <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                <Activity className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Ledger AI</span>
              </div>
            <div className="px-5 py-4 bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm shadow-sm">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-16 md:bottom-20 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 z-20">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto relative flex items-center">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Show my last HbA1c..."
            className="w-full h-14 pl-5 pr-14 bg-slate-50 border-slate-200 text-base font-medium rounded-2xl focus-visible:ring-slate-300 shadow-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-2 h-10 w-10 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>

    </div>
  );
}