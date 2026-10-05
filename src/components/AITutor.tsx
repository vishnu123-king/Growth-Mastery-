import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Plus, Loader2, Sparkles, Bot, User as UserIcon, BookOpen, Terminal, CheckCircle2 } from "lucide-react";
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
    fetchConversations(true);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      localStorage.setItem("ai_tutor_active_conv_id", activeConvId);
      const match = conversations.find(c => c.id === activeConvId);
      if (match) {
        setActiveConv(match);
      }
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || message;
    if (!textToSend.trim() || !activeConvId) return;

    if (!customText) {
      setMessage("");
      localStorage.removeItem("ai_tutor_draft_message");
    }
    setSending(true);

    try {
      const res = await apiFetch("/api/v1/ai-tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
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
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-stone-500 text-xs font-semibold">Connecting to curriculum AI tutor...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]" id="ai-tutor-container">
      {/* Thread list sidebar */}
      <div className="md:col-span-4 border-r border-stone-200 pr-0 md:pr-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Study Discussions</h3>
              <p className="text-[11px] text-stone-400">Contextual curriculum assistance</p>
            </div>
            <button
              type="button"
              onClick={handleCreateConversation}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-indigo-200"
              title="Start New Thread"
            >
              <Plus size={13} />
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
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 text-xs font-semibold ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare size={13} className={isSelected ? "text-white" : "text-indigo-600"} />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}>
                    {conv.messages?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-600" />
            <span>Grounded Diagnostic Guidance</span>
          </div>
          <p className="text-[11px] text-indigo-800 leading-relaxed font-sans">
            The tutor automatically factors in your recent exam scores, verified mastery levels, and weak skill gaps.
          </p>
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm">Curriculum & Engineering Tutor</h2>
              <span className="text-[11px] text-stone-400">Interactive explanations with tailored code solutions</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 p-4 bg-stone-50/80 border border-stone-200 rounded-2xl max-h-[390px]">
          {activeConv?.messages && activeConv.messages.length > 0 ? (
            activeConv.messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs mt-1">
                      <Bot size={13} />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isUser 
                      ? "bg-indigo-600 text-white shadow-xs rounded-br-xs" 
                      : "bg-white border border-stone-200 text-stone-900 shadow-2xs rounded-bl-xs"
                  }`}>
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    <div className={`text-[10px] mt-1.5 text-right font-medium ${isUser ? "text-indigo-200" : "text-stone-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-stone-800 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs mt-1">
                      <UserIcon size={13} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-stone-400 space-y-2">
              <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-semibold text-stone-700">Start a conversation with your personalized tutor</p>
              <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
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
              className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
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
            className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
