import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSend, disabled, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // reset after send
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-100 p-4 shrink-0">
      <div className="max-w-3xl mx-auto relative group">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled && !onStop}
          placeholder={disabled ? "Waiting for response..." : "Message Ollama (Shift+Enter for new line)"}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none overflow-y-auto text-[15px] placeholder-gray-400 disabled:opacity-50 min-h-[52px]"
          rows={1}
        />
        
        {disabled && onStop ? (
          <button
            onClick={onStop}
            className="absolute right-2 bottom-2 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm animate-fade-in-up"
            title="Stop Generating"
          >
            <Square fill="currentColor" size={18} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Send size={18} className={input.trim() ? "" : "opacity-80"} />
          </button>
        )}
      </div>
      
      <div className="max-w-3xl mx-auto mt-2 text-center">
        <p className="text-[11px] text-gray-400">
          AI generated responses may be inaccurate.
        </p>
      </div>
    </div>
  );
}
