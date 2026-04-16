import { useState, useEffect, useCallback } from 'react';
import { Settings, Trash2, Bot, Network, FileDown } from 'lucide-react';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import type { Message } from './components/MessageBubble';
import { SettingsPanel } from './components/SettingsPanel';
import { ConnectionStatus } from './components/ConnectionStatus';
import { AuthScreen } from './components/AuthScreen';
import { streamChatResponse, testConnection, DEFAULT_MODEL, fetchLocalModels } from './services/ollama';
import { downloadChatAsGraph } from './utils/exportGraph';
import { downloadChatAsText } from './utils/exportText';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('xai_auth') === 'true';
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [baseUrl, setBaseUrl] = useState(() => {
    const cachedLocal = localStorage.getItem('ollama_base_url');
    const envUrl = import.meta.env.VITE_OLLAMA_BASE_URL;
    const fallbackUrl = 'http://192.168.0.113:11434';
    
    // Prevent Mixed Content blocks: browsers block http:// IP requests from https:// websites.
    if (window.location.protocol === 'https:') {
      // If we have an env config for HTTPS, always prefer it if cached is insecure
      if (cachedLocal && cachedLocal.startsWith('http://') && !cachedLocal.includes('localhost')) {
        return envUrl || fallbackUrl;
      }
      if (!cachedLocal && envUrl) {
        return envUrl;
      }
    }
    
    return cachedLocal || envUrl || fallbackUrl;
  });

  const [activeModel, setActiveModel] = useState(() => {
    return localStorage.getItem('ollama_model') || DEFAULT_MODEL;
  });
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);

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
      setAvailableModels(models);
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

  // Inactivity Auto-Lock (10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: number;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 10 minutes = 600,000 milliseconds
      timeoutId = window.setTimeout(() => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('xai_auth');
      }, 600000);
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach(event => document.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated]);

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
        { id: assistantId, role: 'assistant', content: '', responseTimeMs: undefined, modelName: activeModel }
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
        content: `Error: ${error.message || 'Failed to communicate with Ollama.'}`,
        modelName: activeModel
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

  if (!isAuthenticated) {
    return <AuthScreen onUnlock={() => {
      sessionStorage.setItem('xai_auth', 'true');
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0 shadow-sm z-10 w-full overflow-hidden">
        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0 mr-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Bot size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight px-0">xAI</h1>
              <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-gray-50 to-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-default group">
                <span className="text-[10px] text-gray-500 font-medium">Built with</span>
                <span className="text-[10px] inline-block animate-pulse group-hover:animate-bounce">❤️</span>
                <span className="text-[10px] font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">Mahmud</span>
              </div>
            </div>
            <p className="text-[9px] sm:text-[11px] text-gray-500 font-medium tracking-wide truncate max-w-[120px] sm:max-w-[200px]">
              MODEL: <span className="text-blue-600 font-semibold uppercase">{activeModel}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div>
            <ConnectionStatus isOnline={isOnline} isChecking={isCheckingStatus} />
          </div>
          
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          
          <button 
            onClick={() => downloadChatAsGraph(messages)}
            disabled={messages.length === 0 || isLoading}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="Download Interactive Graph"
          >
            <Network size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <button 
            onClick={() => downloadChatAsText(messages)}
            disabled={messages.length === 0 || isLoading}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
            title="Download Text File"
          >
            <FileDown size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <button 
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Clear Chat"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div id="chat-window-content" className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        <ChatWindow 
          messages={messages} 
          isLoading={isLoading} 
          onSelectPrompt={handleSendMessage}
          activeModel={activeModel}
        />
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading} 
        onStop={handleStopGeneration}
        activeModel={activeModel}
        availableModels={availableModels}
        onModelChange={(model) => {
          setActiveModel(model);
          localStorage.setItem('ollama_model', model);
        }}
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
