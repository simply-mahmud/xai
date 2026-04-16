import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isOnline: boolean | null; // null if checking
  isChecking: boolean;
}

export function ConnectionStatus({ isOnline, isChecking }: ConnectionStatusProps) {
  if (isChecking) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-1 rounded-md border border-gray-200">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="hidden sm:inline">Checking</span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-1 rounded-md border border-emerald-200" title="Online">
        <Wifi size={14} className="sm:w-[14px] sm:h-[14px] w-3 h-3" />
        <span className="font-medium hidden sm:inline">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-red-600 bg-red-50 px-1.5 sm:px-2 py-1 rounded-md border border-red-200" title="Offline">
      <WifiOff size={14} className="sm:w-[14px] sm:h-[14px] w-3 h-3" />
      <span className="font-medium hidden sm:inline">Offline</span>
    </div>
  );
}
