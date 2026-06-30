import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Sparkles, Phone, Bot, Check, Minimize2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function DesktopSupportWidgets() {
  const { clickToWhatsAppSupport, isOffline } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('nuvvo_support_chat');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // safe fallback
    }
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: "👋 Hello! I'm Nuvvo AI, your personal culinary chatbot assistant. Ask me anything about our signature Biryanis, food tracking, franchise opportunities, or discounts!",
        timestamp: new Date().toISOString()
      }
    ];
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save conversation state
  useEffect(() => {
    try {
      localStorage.setItem('nuvvo_support_chat', JSON.stringify(messages));
    } catch (e) {
      // safe fail
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }

    const newUserMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Chatbot response error');
      }

      const data = await response.json();
      const newBotMessage: ChatMessage = {
        id: `msg_b_${Date.now()}`,
        role: 'assistant',
        content: data.response || "I am processing your request. Please ask another question or click the WhatsApp button to call real-time support!",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (err) {
      // Local smart support assistant fallback if backend is offline/failed
      setTimeout(() => {
        const lower = text.toLowerCase();
        let reply = "I'm experiencing a quick connection delay, but I'm happy to help! For immediate priority escalation, please click the green WhatsApp icon to call our 24/7 Support Desk.";
        
        if (lower.includes("track") || lower.includes("order") || lower.includes("status")) {
          reply = "You can view and track your orders in real-time under the 'Orders' tab in our Bottom Navigation menu. Our simulator provides full live GPS mapping, driver telemetry coordinates, and speed progress indicators.";
        } else if (lower.includes("biryani") || lower.includes("spicy") || lower.includes("rice")) {
          reply = "Craving elite spices? Our top selection is the Gourmet Dum Biryani, cooked with select organic basmati grains and authentic cardamom masala over charcoal.";
        } else if (lower.includes("franchise") || lower.includes("partner") || lower.includes("business")) {
          reply = "We are currently accepting high-revenue food franchise applications! Navigate to our 'Franchise' screen in the side/profile controls to inspect our interactive dynamic ROI simulator.";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
          reply = "Hi there! Welcome to Nuvvo. I am here to help you order, track, or assist you with any questions!";
        } else if (lower.includes("pizza") || lower.includes("burger") || lower.includes("cheese")) {
          reply = "Try out our gourmet fire-oven Pizzas and hand-crafted Angus Burgers under the Fast Food collections! Rated exceptionally high in local high-demand zones.";
        } else if (lower.includes("coupon") || lower.includes("discount") || lower.includes("offer")) {
          reply = "Check out our dynamic coupons page in the checkout screen! We currently have a 'WELCOME100' or 'FREEDEL' discount active for immediate cashbacks.";
        }

        const fallbackBotMsg: ChatMessage = {
          id: `msg_fb_${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackBotMsg]);
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all support assistant messages?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: 'msg_welcome_reset',
          role: 'assistant',
          content: "Chat cleared! How can I assist you with your culinary questions today?",
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(resetMsg);
    }
  };

  const presetQueries = [
    "📍 Where is my order?",
    "🔥 Best Biryani recommendations?",
    "💼 Tell me about Nuvvo Franchise",
    "🎟️ Is there a discount coupon?"
  ];

  return (
    <>
      {/* Floating Action Buttons Area - Hidden on small viewports, visible on desktop (md+) */}
      <div 
        id="desktop-support-action-dock"
        className="fixed bottom-6 right-6 z-[200] hidden md:flex flex-col items-end gap-3 pointer-events-auto"
      >
        {/* WhatsApp Float Trigger Button */}
        <button
          onClick={() => clickToWhatsAppSupport('Support Query: Hi Nuvvo Team!')}
          className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative group border border-emerald-400/20"
          title="Direct WhatsApp Support Line"
          id="desktop-whatsapp-support-btn"
        >
          <span className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-30 pointer-events-none" />
          <Phone className="w-5 h-5" />
          
          {/* Tooltip */}
          <span className="absolute right-14 bg-zinc-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-wide uppercase pointer-events-none shadow-md">
            WhatsApp Support (8328355812)
          </span>
        </button>

        {/* AI Chatbot Float Trigger Button */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative group border ${
            isOpen 
              ? 'bg-zinc-900 text-white border-zinc-800' 
              : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white border-purple-500/20'
          }`}
          title="AI Assistant Chatbot"
          id="desktop-ai-chatbot-btn"
        >
          {isOpen ? <X className="w-5 h-5" /> : (
            <>
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-amber-500 rounded-full text-[8.5px] font-black text-amber-950 shadow-sm">
                AI
              </span>
            </>
          )}
          
          {/* Tooltip */}
          <span className="absolute right-14 bg-zinc-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-wide uppercase pointer-events-none shadow-md">
            {isOpen ? 'Close Chatbot' : 'AI Assistant Chatbot'}
          </span>
        </button>
      </div>

      {/* Interactive Chatbot Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            id="desktop-support-chatbot-window"
            className="fixed bottom-22 right-6 z-[210] hidden md:flex flex-col w-[380px] h-[540px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 dark:from-purple-900 dark:to-zinc-900 p-4 text-white flex items-center justify-between border-b border-purple-500/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl relative">
                  <Bot className="w-5 h-5 text-purple-200" />
                  <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-purple-850" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-wide uppercase">Nuvvo AI Assistant</h3>
                    <span className="text-[8px] bg-amber-500 text-amber-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">3.5</span>
                  </div>
                  <p className="text-[10px] text-purple-200 font-mono">Culinary Support Concierge</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear Chat History"
                  className="p-1.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-purple-200 hover:text-white transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Collapse Chat"
                  className="p-1.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-purple-200 hover:text-white transition cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Conversation stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-zinc-950/20 scrollbar-none">
              {messages.map((m) => {
                const isBot = m.role === 'assistant';
                return (
                  <div 
                    key={m.id}
                    className={`flex gap-2 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                        🤖
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className={`text-[11.5px] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isBot 
                          ? 'bg-white dark:bg-zinc-850 text-zinc-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-800/50 rounded-tl-none shadow-sm' 
                          : 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-500/10'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[8.5px] text-zinc-400 dark:text-zinc-500 font-mono block px-1.5">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing simulation */}
              {loading && (
                <div className="flex gap-2 max-w-[85%] mr-auto text-left">
                  <div className="w-7 h-7 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0 text-xs">
                    🤖
                  </div>
                  <div className="bg-white dark:bg-zinc-850 text-zinc-800 dark:text-zinc-100 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-zinc-800/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Presets Prompt Chips */}
            <div className="p-3 border-t border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-900 space-y-1.5">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-mono">Suggested Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {presetQueries.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q.substring(2))} // strip emoji for search value
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-purple-50 dark:bg-zinc-850 dark:hover:bg-purple-950/20 text-zinc-650 dark:text-zinc-350 hover:text-purple-700 dark:hover:text-purple-400 border border-slate-150 dark:border-zinc-800 rounded-xl text-[9.5px] font-extrabold cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Support deep-link helper bar */}
            <div className="px-4 py-2 bg-emerald-500/10 dark:bg-emerald-500/5 border-t border-b border-emerald-500/20 flex items-center justify-between text-[9.5px] text-zinc-650 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                Need human assistance immediately?
              </span>
              <button
                onClick={() => clickToWhatsAppSupport('Urgent Callback Request!')}
                className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                Chat on WhatsApp ↗
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3.5 bg-white dark:bg-zinc-900 flex items-center gap-2 border-t border-slate-100 dark:border-zinc-850"
            >
              <input
                type="text"
                placeholder="Ask Nuvvo AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-zinc-850 text-zinc-850 dark:text-zinc-100 rounded-2xl px-4 py-2.5 border border-slate-100 dark:border-zinc-800 text-[11px] font-medium focus:outline-none focus:border-purple-500 transition-colors"
                id="chatbot-message-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-100 dark:disabled:bg-zinc-800 text-white disabled:text-zinc-400 rounded-2xl transition shadow-md hover:shadow-purple-500/15 cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95"
                id="chatbot-submit-btn"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
