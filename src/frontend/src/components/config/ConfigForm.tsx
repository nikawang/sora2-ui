import { useState } from 'react';
import { useConfig } from '../../hooks/useConfig';
import { Loader2, Check, X } from 'lucide-react';

export default function ConfigForm() {
  const { config, validateAndSaveConfig, isValidating, validationError } = useConfig();
  
  const [endpoint, setEndpoint] = useState(config?.endpoint || '');
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateAndSaveConfig(endpoint, apiKey);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-2">
          Azure OpenAI Endpoint
        </label>
        <input
          id="endpoint"
          type="url"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://your-resource.openai.azure.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        />
      </div>

      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <div className="relative">
          <input
            id="apiKey"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Azure OpenAI API key"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-16"
            required
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <X className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{validationError}</span>
        </div>
      )}

      {config?.isConnected && !validationError && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Connection successful</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isValidating}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
      >
        {isValidating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Validating...
          </>
        ) : (
          'Save Configuration'
        )}
      </button>
    </form>
  );
}
