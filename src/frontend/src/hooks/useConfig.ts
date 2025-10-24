import { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { configApi } from '../services/api';
import { validation } from '../utils/validation';

export function useConfig() {
  const { config, setConfig, updateConnectionStatus } = useConfigStore();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndSaveConfig = async (endpoint: string, apiKey: string) => {
    setIsValidating(true);
    setValidationError(null);

    // Client-side validation
    if (!validation.isValidEndpoint(endpoint)) {
      setValidationError('Invalid endpoint URL format');
      setIsValidating(false);
      return false;
    }

    if (!validation.isValidApiKey(apiKey)) {
      setValidationError('API key must be between 32 and 128 characters');
      setIsValidating(false);
      return false;
    }

    try {
      // Server-side validation
      const response = await configApi.validateConnection(endpoint, apiKey);

      if (response.success) {
        const newConfig = {
          endpoint,
          apiKey,
          isConnected: true,
          lastValidated: new Date().toISOString(),
        };
        setConfig(newConfig);
        setIsValidating(false);
        return true;
      } else {
        setValidationError(response.error || 'Connection validation failed');
        updateConnectionStatus(false);
        setIsValidating(false);
        return false;
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Connection failed');
      updateConnectionStatus(false);
      setIsValidating(false);
      return false;
    }
  };

  const testConnection = async () => {
    if (!config) return false;
    return validateAndSaveConfig(config.endpoint, config.apiKey);
  };

  return {
    config,
    isValidating,
    validationError,
    validateAndSaveConfig,
    testConnection,
    hasValidConfig: config?.isConnected ?? false,
  };
}
