import React, { useState, useEffect, useRef } from 'react';
import { Send, Stethoscope, User } from 'lucide-react';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '这位病友，我看你面色苍白，眼神空洞，莫非是患了那传说中的"电子阳痿"？快快说出你的症状，本神医为你把把脉。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const conversationHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));
    conversationHistory.push({ role: 'user', content: userMsg });

    const response = await aiService.chat(conversationHistory);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="tcm-card flex flex-col h-[500px] w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 border-b border-tcm-wood pb-2 mb-4">
        <Stethoscope className="text-tcm-red" />
        <h2 className="font-serif text-xl">神医问诊室</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-4 p-2 mb-4 scrollbar-thin scrollbar-thumb-tcm-wood">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-tcm-wood text-tcm-light' : 'bg-tcm-red text-tcm-light'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Stethoscope size={16} />}
              </div>
              <div className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-tcm-green text-tcm-light rounded-tr-none' : 'bg-white border border-tcm-wood rounded-tl-none'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-tcm-red text-tcm-light flex items-center justify-center animate-pulse">
              <Stethoscope size={16} />
            </div>
            <div className="p-3 bg-white border border-tcm-wood rounded-lg rounded-tl-none animate-pulse text-sm">
              神医正在翻阅医书...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="描述你的症状（如：买了黑神话不敢开...）"
          className="flex-1 bg-white border border-tcm-wood rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tcm-green"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-tcm-red text-tcm-light p-2 rounded-full hover:bg-tcm-wood transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};