import { useState } from 'react';
import { User, Copy, Check, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseTimeMs?: number;
  modelName?: string;
}

interface MessageBubbleProps {
  message: Message;
}

// A custom sub-component for formatting specific code blocks within markdown
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '') || [];
  const language = match[1];

  // ReactMarkdown v9 often passes inline=false for blocked code, but it's safe to check newlines too
  const isBlock = !inline && (match.length > 0 || String(children).includes('\n'));

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render inline `code` blocks
  if (!isBlock) {
    return (
      <code className="bg-[#f0f4f8] text-blue-600 px-[5px] py-[2px] rounded text-[13.5px] font-mono border border-gray-100 mx-0.5" {...props}>
        {children}
      </code>
    );
  }

  // Render multi-line <pre><code> blocks (the classic Markdown codeblock)
  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-gray-200 bg-[#fafafa] shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 font-mono tracking-wide uppercase">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13.5px] leading-[1.65] font-mono text-gray-800 break-normal whitespace-pre">
        <code {...props}>{children}</code>
      </div>
    </div>
  );
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const getAvatarColor = (name: string = 'assistant') => {
    const colors = [
      'bg-red-50 text-red-500 border-red-100',
      'bg-emerald-50 text-emerald-500 border-emerald-100',
      'bg-purple-50 text-purple-500 border-purple-100',
      'bg-orange-50 text-orange-500 border-orange-100',
      'bg-teal-50 text-teal-500 border-teal-100',
      'bg-pink-50 text-pink-500 border-pink-100',
      'bg-indigo-50 text-indigo-500 border-indigo-100',
      'bg-rose-50 text-rose-500 border-rose-100',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`flex gap-3 max-w-[95%] md:max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 border ${isUser ? 'bg-blue-600 text-white border-blue-700' : getAvatarColor(message.modelName)}`}>
          {isUser ? <User size={16} /> : <Bot size={18} />}
        </div>

        {/* Bubble */}
        <div className="group relative min-w-0">
          <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap' 
              : 'bg-white border border-gray-200/60 text-gray-800 rounded-tl-sm'
          }`}>
            {isUser ? (
              message.content
            ) : (
              <div className="prose prose-sm max-w-none prose-slate
                  prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0 prose-p:leading-relaxed
                  prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:my-4 prose-headings:mt-6 prose-headings:first:mt-0
                  prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:pl-0.5
                  prose-hr:my-6 prose-hr:border-gray-200
                  prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown
                  components={{
                    pre: ({ children }: any) => <>{children}</>,
                    code: CodeBlock as any
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Full Message Copy Button (Assistant only) */}
          {!isUser && (
            <button
              onClick={handleCopyMessage}
              className="absolute -right-12 top-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-white border border-transparent hover:border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
              title="Copy entire response"
            >
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </button>
          )}

          {/* Response metrics */}
          {!isUser && message.responseTimeMs && (
            <div className="absolute -bottom-5 left-1 text-[11px] font-medium text-gray-400 opacity-60">
              {(message.responseTimeMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
