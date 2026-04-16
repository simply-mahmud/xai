import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Square, Cpu } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  onStop?: () => void;
  activeModel?: string;
  availableModels?: string[];
  onModelChange?: (model: string) => void;
}

export function ChatInput({ onSend, disabled, onStop, activeModel, availableModels = [], onModelChange }: ChatInputProps) {
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
          placeholder={disabled ? "Waiting for response..." : "Message Assistant of Mahmud (Shift+Enter for new line)"}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none overflow-y-auto text-base sm:text-[15px] placeholder-gray-400 disabled:opacity-50 min-h-[52px]"
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
      
      <div className="max-w-3xl mx-auto mt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2 sm:gap-0 px-1">
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          {availableModels && availableModels.length > 0 && (
            <div className="flex flex-shrink-0 items-center justify-between max-w-[140px] sm:max-w-none text-gray-500 hover:text-blue-600 transition-colors bg-white border border-gray-200 hover:border-blue-200 rounded-lg px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Cpu size={14} className="flex-shrink-0" />
                <select
                  value={activeModel}
                  onChange={(e) => onModelChange && onModelChange(e.target.value)}
                  className="text-[12px] font-medium bg-transparent focus:outline-none cursor-pointer appearance-none pr-2 truncate"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model} className="text-gray-800">
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Builder Badge (Mobile Only) */}
          <div className="flex sm:hidden items-center gap-1 bg-gradient-to-r from-gray-50 to-white border border-gray-200 px-2.5 py-[3px] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-default group shrink-0">
            <span className="text-[10px] text-gray-500 font-medium">Built with</span>
            <span className="text-[10px] inline-block animate-pulse group-hover:animate-bounce">❤️</span>
            <span className="text-[10px] font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">Mahmud</span>
          </div>
        </div>
        
        <p className="text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">
          Responds in English only · AI responses may be inaccurate.
        </p>
      </div>
    </div>
  );
}
