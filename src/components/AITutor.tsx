import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Plus, Loader2, Sparkles, Bot, User as UserIcon, BookOpen } from "lucide-react";
import { AITutorConversation } from "../types";
import { apiFetch } from "../lib/api";

export const AITutor: React.FC = () => {
  const [conversations, setConversations] = useState<AITutorConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return localStorage.getItem("ai_tutor_active_conv_id") || "";
  });
  const [activeConv, setActiveConv] = useState<AITutorConversation | null>(null);
  const [message, setMessage] = useState<string>(() => {
    return localStorage.getItem("ai_tutor_draft_message") || "";
  });
  const [sending, setSending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync / fetch conversation threads
  const fetchConversations = async (selectFirst = true) => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/v1/ai-tutor/conversations");
      if (res.ok) {
        const data: AITutorConversation[] = await res.json();
        setConversations(data);
        
        const savedConvId = localStorage.getItem("ai_tutor_active_conv_id");
        if (data.length > 0) {
          const match = savedConvId ? data.find((c) => c.id === savedConvId) : null;
          if (match) {
            setActiveConvId(match.id);
            setActiveConv(match);
          } else if (selectFirst) {
            setActiveConvId(data[0].id);
            setActiveConv(data[0]);
            localStorage.setItem("ai_tutor_active_conv_id", data[0].id);
          } else {
            const currentMatch = data.find((c) => c.id === activeConvId);
            if (currentMatch) setActiveConv(currentMatch);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || message;
    if (!textToSend.trim() || sending) return;

    setSending(true);
    if (!customPrompt) {
      setMessage("");
      localStorage.removeItem("ai_tutor_draft_message");
    }

    try {
      const res = await apiFetch("/api/v1/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId || undefined,
          message: textToSend
        })
      });

      if (res.ok) {
        const updatedConversation = await res.json();
        setConversations(prev => prev.map(c => c.id === updatedConversation.id ? updatedConversation : c));
        setActiveConv(updatedConversation);
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const res = await apiFetch("/api/v1/ai-tutor/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Discussion: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` })
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations(prev => [...prev, newConv]);
        setActiveConvId(newConv.id);
        setActiveConv(newConv);
        localStorage.setItem("ai_tutor_active_conv_id", newConv.id);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const prompts = [
    { label: "Recursion Walkthrough", text: "Explain recursion in Python with a clear step-by-step example and stack trace." },
    { label: "Flexbox vs Grid", text: "Compare CSS Flexbox and Grid layouts with practical code examples." },
    { label: "My Weak Competencies", text: "What are my weakest competency domains currently, and what should I study?" },
    { label: "SQL Join Types", text: "Explain the differences between INNER, LEFT, RIGHT, and FULL OUTER joins in SQL." }
  ];

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 text-[#C47C4A] animate-spin" />
        <p className="text-[#A8A29E] text-xs font-semibold">Connecting to curriculum AI tutor...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]" id="ai-tutor-container">
      {/* Thread list sidebar */}
      <div className="md:col-span-4 border-r border-[#2C2C2C] pr-0 md:pr-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
            <div>
              <h3 className="font-semibold text-[#F3EEE6] text-sm">Study Discussions</h3>
              <p className="text-xs text-[#A8A29E]">Contextual curriculum assistance</p>
            </div>
            <button
              type="button"
              onClick={handleCreateConversation}
              className="btn-charcoal-secondary text-xs px-2.5 py-1 min-h-[36px]"
              title="Start New Thread"
            >
              <Plus size={13} className="text-[#C47C4A]" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
            {conversations.map(conv => {
              const isSelected = activeConvId === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setActiveConv(conv);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                    isSelected
                      ? "bg-[#222222] text-[#F3EEE6] border-l-2 border-[#C47C4A] font-semibold"
                      : "bg-[#1B1B1B] hover:bg-[#202020] text-[#A8A29E] border border-[#2C2C2C]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare size={13} className={isSelected ? "text-[#C47C4A]" : "text-[#78716C]"} />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-[#C47C4A]/20 text-[#C47C4A]" : "text-[#78716C]"
                  }`}>
                    {conv.messages?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-[#1B1B1B] border border-[#2C2C2C] rounded-xl text-xs space-y-1.5">
          <div className="font-semibold text-[#D7B87B] flex items-center gap-1.5 font-mono">
            <Sparkles size={13} />
            <span>Grounded Diagnostic Guidance</span>
          </div>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            The tutor automatically factors in your recent exam scores, verified mastery levels, and weak skill gaps.
          </p>
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#222222] border border-[#2C2C2C] text-[#C47C4A] flex items-center justify-center text-xs">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-[#F3EEE6] text-sm">Curriculum & Engineering Tutor</h2>
              <span className="text-xs text-[#A8A29E]">Interactive explanations with grounded code solutions</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 p-4 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl max-h-[390px]">
          {activeConv?.messages && activeConv.messages.length > 0 ? (
            activeConv.messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#2C2C2C] text-[#C47C4A] flex items-center justify-center shrink-0 text-xs mt-1">
                      <Bot size={13} />
                    </div>
                  )}

                  <div className={`p-4 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    isUser 
                      ? "bg-[#C47C4A] text-white" 
                      : "bg-[#222222] border border-[#2C2C2C] text-[#F3EEE6]"
                  }`}>
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    <div className={`text-[10px] mt-1.5 text-right font-mono ${isUser ? "text-white/80" : "text-[#78716C]"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-[#282828] text-[#F3EEE6] flex items-center justify-center shrink-0 text-xs mt-1">
                      <UserIcon size={13} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#A8A29E] space-y-2">
              <BookOpen className="w-8 h-8 text-[#78716C] mx-auto" />
              <p className="text-xs font-semibold text-[#F3EEE6]">Start a conversation with your personalized tutor</p>
              <p className="text-xs text-[#A8A29E] max-w-sm mx-auto">
                Ask about complex programming topics, algorithm complexity, or why an exam question was marked incorrect.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              disabled={sending}
              onClick={() => handleSendMessage(p.text)}
              className="px-3 py-1.5 bg-[#222222] hover:bg-[#282828] border border-[#2C2C2C] text-[#D6D0C7] hover:text-[#F3EEE6] rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a technical or coursework question..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              localStorage.setItem("ai_tutor_draft_message", e.target.value);
            }}
            className="flex-1 px-4 py-2.5 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A]"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="btn-copper-primary text-xs shrink-0"
          >
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
