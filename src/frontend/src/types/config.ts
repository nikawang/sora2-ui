export interface AzureConfig {
  endpoint: string;
  apiKey: string;
  isConnected: boolean;
  lastValidated: string | null;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  defaultResolution: string;
  defaultDuration: number;
  autoPreview: boolean;
}
