// components/social/LiveChat.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/types/nexus';

interface LiveChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export default function LiveChat({ messages, onSendMessage }: LiveChatProps) {
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !user) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-full max-h-[60vh]">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMine = msg.userId === user?.uid;
            return (
              <motion.div
                key={msg.id ?? msg.timestamp}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {msg.displayName?.charAt(0).toUpperCase() ?? 'U'}
                </div>

                {/* Bubble */}
                <div
                  className={`px-3 py-1.5 rounded-2xl text-sm max-w-[75%] break-words ${
                    isMine
                      ? 'bg-[var(--primary)] text-white rounded-br-sm'
                      : 'bg-white/5 text-[var(--text-primary)] rounded-bl-sm border border-white/10'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs text-[var(--text-secondary)] font-medium mb-0.5">
                      {msg.displayName}
                    </p>
                  )}
                  <p>{msg.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {user && (
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-white/10 bg-[var(--surface)]/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2 rounded-xl bg-[var(--primary)] text-white disabled:opacity-50 transition hover:bg-opacity-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}