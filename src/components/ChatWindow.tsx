import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from './MessageBubble';
import { Bot, Sparkles, Code2, PenTool } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  activeModel: string;
}

export function ChatWindow({ messages, isLoading, onSelectPrompt, activeModel }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const starterPrompts = [
    { icon: <Sparkles size={18} className="text-amber-500" />, text: "Tell me a fun fact about space" },
    { icon: <Code2 size={18} className="text-blue-500" />, text: "How do I reverse a string in Python?" },
    { icon: <PenTool size={18} className="text-emerald-500" />, text: "Help me outline a blog post about AI" },
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 animate-fade-in-up">
          <Bot size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          How can I help you today?
        </h2>
        <p className="text-gray-500 text-sm mb-8 max-w-md text-center leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
          Connected to local Ollama ({activeModel}). Note: Initial response might take a few seconds as the model loads into memory.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl animate-fade-in-up" style={{animationDelay: '300ms'}}>
          {starterPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(prompt.text)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left group flex flex-col gap-3 min-h-[100px]"
            >
              <div className="bg-gray-50 w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                {prompt.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                {prompt.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50/30 p-4 sm:p-6 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
