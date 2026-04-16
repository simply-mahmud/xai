import { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { testConnection, fetchLocalModels } from '../services/ollama';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  activeModel: string;
  onSave: (url: string, model: string) => void;
}

export function SettingsPanel({ isOpen, onClose, baseUrl, activeModel, onSave }: SettingsPanelProps) {
  const [localUrl, setLocalUrl] = useState(baseUrl);
  const [localModel, setLocalModel] = useState(activeModel);
  const [testResult, setTestResult] = useState<'success' | 'error' | 'testing' | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalUrl(baseUrl);
      setLocalModel(activeModel);
      loadModels(baseUrl);
    }
  }, [baseUrl, activeModel, isOpen]);

  const loadModels = async (url: string) => {
    setIsFetchingModels(true);
    const models = await fetchLocalModels(url);
    if (models.length > 0) {
      setAvailableModels(models);
      // Auto-select if current model is not found but others exist
      if (!models.includes(localModel) && !models.includes(activeModel)) {
        setLocalModel(models[0]);
      }
    }
    setIsFetchingModels(false);
  };

  if (!isOpen) return null;

  const handleTest = async () => {
    setTestResult('testing');
    const isOk = await testConnection(localUrl);
    setTestResult(isOk ? 'success' : 'error');
    if (isOk) {
      loadModels(localUrl);
    }
  };

  const handleSave = () => {
    onSave(localUrl, localModel);
    setTestResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Server size={18} className="text-blue-500" />
            Connection & Model Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ollama API Base URL
            </label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => {
                setLocalUrl(e.target.value);
                setTestResult(null);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder="http://192.168.0.113:11434"
            />
            
            {typeof window !== 'undefined' && window.location.protocol === 'https:' && localUrl.startsWith('http://') && !localUrl.includes('localhost') && (
              <div className="flex items-start gap-1.5 mt-2 bg-amber-50 text-amber-700 p-2.5 rounded-lg border border-amber-200/60">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed font-medium">
                  Browsers block HTTP requests from HTTPS sites (Mixed Content). This Local IP won't work here. Use an HTTPS backend URL (like a Cloudflare Tunnel).
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Currently pointing to your local network. Update this if you're using a public URL (like Cloudflare Tunnel).
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Cpu size={14} className="text-gray-400" />
              Active AI Model
            </label>
            <div className="relative">
              <select
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                disabled={isFetchingModels || availableModels.length === 0}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none disabled:bg-gray-50 disabled:text-gray-500"
              >
                {availableModels.length === 0 ? (
                  <option value={localModel}>{localModel} (Unverified)</option>
                ) : (
                  availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m1 1 4 4 4-4"/>
                </svg>
              </div>
            </div>
            
            {isFetchingModels && (
              <p className="text-xs text-blue-500 animate-pulse mt-1">Fetching available models...</p>
            )}
            {!isFetchingModels && availableModels.length > 0 && (
              <p className="text-xs text-emerald-600 mt-1">Successfully loaded {availableModels.length} models.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={handleTest}
              disabled={testResult === 'testing'}
              className="text-sm px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              {testResult === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>

            {testResult === 'success' && (
              <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <CheckCircle2 size={16} /> Connection OK
              </div>
            )}
            {testResult === 'error' && (
              <div className="flex items-center gap-1 text-sm text-red-600 font-medium animate-shake">
                <AlertCircle size={16} /> Unreachable
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
