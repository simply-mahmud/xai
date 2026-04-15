import { useState, useEffect, useCallback } from 'react';
import { Settings, Trash2, Bot } from 'lucide-react';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import type { Message } from './components/MessageBubble';
import { SettingsPanel } from './components/SettingsPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { streamChatResponse, testConnection, DEFAULT_MODEL, fetchLocalModels } from './services/ollama';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [baseUrl, setBaseUrl] = useState(() => {
    return localStorage.getItem('ollama_base_url') || import.meta.env.VITE_OLLAMA_BASE_URL || 'http://192.168.0.113:11434';
  });

  const [activeModel, setActiveModel] = useState(() => {
    return localStorage.getItem('ollama_model') || DEFAULT_MODEL;
  });

  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const checkStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    const ok = await testConnection(baseUrl);
    setIsOnline(ok);
    setIsCheckingStatus(false);
    
    // Auto-sync initial model if it was completely missing from the server
    if (ok) {
      const models = await fetchLocalModels(baseUrl);
      if (models.length > 0 && !models.includes(activeModel)) {
        setActiveModel(models[0]);
        localStorage.setItem('ollama_model', models[0]);
      }
    }
  }, [baseUrl, activeModel]);

  // Initial and periodic health check
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleSaveSettings = (newUrl: string, newModel: string) => {
    setBaseUrl(newUrl);
    setActiveModel(newModel);
    localStorage.setItem('ollama_base_url', newUrl);
    localStorage.setItem('ollama_model', newModel);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const startTime = Date.now();
      const assistantId = (Date.now() + 1).toString();
      
      // Initialize an empty assistant message placeholder
      setMessages((prev) => [
        ...prev, 
        { id: assistantId, role: 'assistant', content: '', responseTimeMs: undefined }
      ]);
      
      let fullResponse = '';

      await streamChatResponse(content, activeModel, baseUrl, (chunk) => {
        fullResponse += chunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        );
      }, controller.signal);

      const responseTimeMs = Date.now() - startTime;
      
      // Update the final message with the total response time metric
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantId 
            ? { ...msg, responseTimeMs } 
            : msg
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User manually stopped the generation.
        setIsLoading(false);
        setAbortController(null);
        return;
      }
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `Error: ${error.message || 'Failed to communicate with Ollama.'}` 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-gray-800 text-lg leading-tight px-0">xAI</h1>
              <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-default group">
                <span className="text-[10px] text-gray-500 font-medium">Built with</span>
                <span className="text-[10px] inline-block animate-pulse group-hover:animate-bounce">❤️</span>
                <span className="text-[10px] font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">Mahmud</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-medium tracking-wide">
              MODEL: <span className="text-blue-600 font-semibold uppercase">{activeModel}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ConnectionStatus isOnline={isOnline} isChecking={isCheckingStatus} />
          
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          
          <button 
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <ChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        onSelectPrompt={handleSendMessage}
        activeModel={activeModel}
      />

      {/* Input Area */}
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading} 
        onStop={handleStopGeneration} 
      />

      {/* Settings Modal */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        baseUrl={baseUrl}
        activeModel={activeModel}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;
