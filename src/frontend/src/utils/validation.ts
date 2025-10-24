/**
 * Validation utility functions
 */

export const validation = {
  /**
   * Validate Azure OpenAI endpoint URL
   */
  isValidEndpoint: (endpoint: string): boolean => {
    try {
      const url = new URL(endpoint);
      return url.protocol === 'https:' && url.hostname.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Validate API key format
   */
  isValidApiKey: (apiKey: string): boolean => {
    return apiKey.length >= 32 && apiKey.length <= 128;
  },

  /**
   * Validate prompt text
   */
  isValidPrompt: (prompt: string): boolean => {
    return prompt.trim().length > 0 && prompt.length <= 1000;
  },

  /**
   * Validate image file
   */
  isValidImageFile: (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPG, PNG, and GIF are supported.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    return { valid: true };
  },

  /**
   * Validate resolution format
   */
  isValidResolution: (resolution: string): boolean => {
    const pattern = /^\d{3,4}x\d{3,4}$/;
    return pattern.test(resolution);
  },

  /**
   * Validate duration
   */
  isValidDuration: (duration: number): boolean => {
    return duration >= 5 && duration <= 10;
  },
};
