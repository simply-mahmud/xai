import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Lock, ArrowRight, Unlock, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onUnlock: () => void;
}

export function AuthScreen({ onUnlock }: AuthScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'mahmud';
    
    if (password === CORRECT_PASSWORD) {
      setError(false);
      setIsUnlocking(true);
      setTimeout(() => {
        onUnlock();
      }, 1000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword('');
    }
  };

  return (
    <div className={`fixed inset-0 bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 z-50 overflow-hidden transition-opacity duration-1000 ${isUnlocking ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background glowing orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[30rem] h-[30rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className={`relative z-10 w-full max-w-sm flex flex-col items-center transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        
        {/* Animated Logo Section */}
        <div className="relative mb-6 sm:mb-8 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-40 group-hover:opacity-75 group-hover:blur-2xl transition duration-500 animate-pulse"></div>
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-900 border border-gray-700/50 rounded-3xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden">
            <Sparkles className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 text-yellow-400/50 w-4 h-4 sm:w-5 sm:h-5 animate-ping" />
            <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform duration-500 tracking-tighter">
              xAI
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">System Restricted</h1>
        <p className="text-gray-400 text-[13px] sm:text-sm mb-8 sm:mb-10 text-center max-w-xs leading-relaxed px-4 sm:px-0">
          Please enter the master password to access the artificial intelligence core.
        </p>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full relative">
          <div className="transform transition-all duration-300">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400">
                {isUnlocking ? <Unlock size={20} className="text-green-400" /> : <Lock size={20} />}
              </div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isUnlocking}
                placeholder="Enter password..."
                className={`w-full bg-gray-900/60 border ${error ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : isUnlocking ? 'border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-gray-700 focus:border-blue-500'} rounded-2xl py-3.5 sm:py-4 pl-11 sm:pl-12 pr-12 sm:pr-14 text-base sm:text-[15px] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-all backdrop-blur-sm`}
                autoFocus
              />
              <button 
                type="submit"
                disabled={!password || isUnlocking}
                className={`absolute right-2 p-2.5 rounded-xl transition-all ${!password ? 'text-gray-600' : isUnlocking ? 'bg-green-500/20 text-green-400' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/50 hover:scale-105 active:scale-95'}`}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          
          <div className="h-6 mt-3">
            {error && <p className="text-red-400 text-xs text-center animate-pulse">Incorrect authorization code.</p>}
            {isUnlocking && <p className="text-green-400 text-xs text-center animate-pulse">Access granted. Initiating...</p>}
          </div>
        </form>

        {/* Builder Badge */}
        <div className="mt-6 sm:mt-8">
          <div className="flex items-center gap-1.5 bg-gray-800/40 border border-gray-700/50 px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md group cursor-default hover:bg-gray-800/60 transition-colors">
            <span className="text-[11px] text-gray-400 font-medium">Built with</span>
            <span className="text-[11px] inline-block animate-pulse group-hover:animate-bounce">❤️</span>
            <span className="text-[11px] font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pl-0.5 tracking-wide">Mahmud</span>
          </div>
        </div>

      </div>
    </div>
  );
}
