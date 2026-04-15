import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isOnline: boolean | null; // null if checking
  isChecking: boolean;
}

export function ConnectionStatus({ isOnline, isChecking }: ConnectionStatusProps) {
  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        Checking...
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
        <Wifi size={14} />
        <span className="font-medium">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
      <WifiOff size={14} />
      <span className="font-medium">Offline</span>
    </div>
  );
}
