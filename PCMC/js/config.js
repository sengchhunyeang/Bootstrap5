/**
 * PCMC Configuration Manager
 * Handles loading, saving, and validating settings from localStorage
 */

const Config = {
  // Storage key for localStorage
  STORAGE_KEY: 'pcmc_config',

  // Default configuration values
  DEFAULTS: {
    apiKey: 'AIzaSyDKeHkM5lFeq2bZ5byGQEpwlVbSeEgIRnI',
    folderId: '1vmJQJ-h8n4vUOYBjIwFJEtIbU5Db0J0m',
    viewMode: 'grid',
    sortBy: 'name',
    theme: 'dark'
  },

  // API endpoints
  API_BASE_URL: 'https://www.googleapis.com/drive/v3',
  UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3/files',

  // File fields to fetch from API
  FILE_FIELDS: 'id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,iconLink',

  /**
   * Get current configuration from localStorage or defaults
   * @returns {Object} Configuration object
   */
  getConfig() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return { ...this.DEFAULTS, ...parsed };
      }
    } catch (error) {
      console.error('Error reading config:', error);
    }
    return { ...this.DEFAULTS };
  },

  /**
   * Save configuration to localStorage
   * @param {string} apiKey - Google API key
   * @param {string} folderId - Google Drive folder ID
   * @returns {boolean} Success status
   */
  saveConfig(apiKey, folderId) {
    try {
      const config = this.getConfig();
      config.apiKey = apiKey;
      config.folderId = folderId;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  },

  /**
   * Save a single setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  setSetting(key, value) {
    try {
      const config = this.getConfig();
      config[key] = value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  },

  /**
   * Get a single setting
   * @param {string} key - Setting key
   * @returns {any} Setting value
   */
  getSetting(key) {
    const config = this.getConfig();
    return config[key];
  },

  /**
   * Reset configuration to default values
   */
  resetConfig() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULTS));
      return true;
    } catch (error) {
      console.error('Error resetting config:', error);
      return false;
    }
  },

  /**
   * Validate API key by making a test API call
   * @param {string} apiKey - API key to validate
   * @returns {Promise<Object>} Validation result with success status and message
   */
  async validateApiKey(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
      return { success: false, message: 'API key is required' };
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/about?fields=user&key=${apiKey}`
      );

      if (response.ok) {
        return { success: true, message: 'API key is valid' };
      }

      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Invalid API key'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  /**
   * Validate folder access by fetching folder metadata
   * @param {string} folderId - Folder ID to validate
   * @param {string} apiKey - API key to use
   * @returns {Promise<Object>} Validation result with folder info
   */
  async validateFolder(folderId, apiKey) {
    if (!folderId || folderId.trim() === '') {
      return { success: false, message: 'Folder ID is required' };
    }

    if (!apiKey) {
      apiKey = this.getConfig().apiKey;
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/files/${folderId}?fields=id,name,mimeType&key=${apiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.mimeType === 'application/vnd.google-apps.folder') {
          return {
            success: true,
            message: 'Folder access verified',
            folderName: data.name,
            folderId: data.id
          };
        }
        return { success: false, message: 'ID does not point to a folder' };
      }

      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || 'Cannot access folder'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  /**
   * Extract folder ID from Google Drive URL
   * Supports various URL formats:
   * - https://drive.google.com/drive/folders/FOLDER_ID
   * - https://drive.google.com/drive/u/0/folders/FOLDER_ID
   * - https://drive.google.com/open?id=FOLDER_ID
   * - Just the folder ID itself
   * @param {string} input - URL or folder ID
   * @returns {string|null} Extracted folder ID or null
   */
  extractFolderId(input) {
    if (!input) return null;

    input = input.trim();

    // Pattern 1: /folders/FOLDER_ID
    const foldersMatch = input.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (foldersMatch) return foldersMatch[1];

    // Pattern 2: ?id=FOLDER_ID or &id=FOLDER_ID
    const idMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];

    // Pattern 3: Pure folder ID (alphanumeric with - and _)
    if (/^[a-zA-Z0-9_-]+$/.test(input) && input.length > 10) {
      return input;
    }

    return null;
  },

  /**
   * Mask API key for display (show first 4 + last 3 characters)
   * @param {string} apiKey - API key to mask
   * @returns {string} Masked API key
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 10) return '****';
    return `${apiKey.slice(0, 4)}${'*'.repeat(apiKey.length - 7)}${apiKey.slice(-3)}`;
  },

  /**
   * Check if using default configuration
   * @returns {boolean} True if using defaults
   */
  isUsingDefaults() {
    const config = this.getConfig();
    return config.apiKey === this.DEFAULTS.apiKey &&
           config.folderId === this.DEFAULTS.folderId;
  }
};

// File type definitions with icons and colors
const FILE_TYPES = {
  // Google Apps
  'application/vnd.google-apps.document': {
    icon: 'fa-file-word',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    name: 'Google Doc'
  },
  'application/vnd.google-apps.spreadsheet': {
    icon: 'fa-file-excel',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    name: 'Google Sheet'
  },
  'application/vnd.google-apps.presentation': {
    icon: 'fa-file-powerpoint',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    name: 'Google Slides'
  },
  'application/vnd.google-apps.form': {
    icon: 'fa-poll',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    name: 'Google Form'
  },
  'application/vnd.google-apps.drawing': {
    icon: 'fa-pencil-alt',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    name: 'Drawing'
  },
  'application/vnd.google-apps.folder': {
    icon: 'fa-folder',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    name: 'Folder'
  },

  // Documents
  'application/pdf': {
    icon: 'fa-file-pdf',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    name: 'PDF'
  },
  'application/msword': {
    icon: 'fa-file-word',
    color: 'text-blue-500',
    bg: 'bg-blue-500/20',
    name: 'Word'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: 'fa-file-word',
    color: 'text-blue-500',
    bg: 'bg-blue-500/20',
    name: 'Word'
  },
  'application/vnd.ms-excel': {
    icon: 'fa-file-excel',
    color: 'text-green-500',
    bg: 'bg-green-500/20',
    name: 'Excel'
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    icon: 'fa-file-excel',
    color: 'text-green-500',
    bg: 'bg-green-500/20',
    name: 'Excel'
  },
  'application/vnd.ms-powerpoint': {
    icon: 'fa-file-powerpoint',
    color: 'text-orange-500',
    bg: 'bg-orange-500/20',
    name: 'PowerPoint'
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    icon: 'fa-file-powerpoint',
    color: 'text-orange-500',
    bg: 'bg-orange-500/20',
    name: 'PowerPoint'
  },

  // Archives
  'application/zip': {
    icon: 'fa-file-archive',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    name: 'ZIP'
  },
  'application/x-rar-compressed': {
    icon: 'fa-file-archive',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    name: 'RAR'
  },

  // Code/Text
  'text/plain': {
    icon: 'fa-file-alt',
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    name: 'Text'
  },
  'text/html': {
    icon: 'fa-file-code',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    name: 'HTML'
  },
  'application/json': {
    icon: 'fa-file-code',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    name: 'JSON'
  },

  // Media
  'video/mp4': {
    icon: 'fa-file-video',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    name: 'Video'
  },
  'video/webm': {
    icon: 'fa-file-video',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    name: 'Video'
  },
  'audio/mpeg': {
    icon: 'fa-file-audio',
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    name: 'Audio'
  },
  'audio/mp3': {
    icon: 'fa-file-audio',
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    name: 'Audio'
  },

  // Images
  'image/jpeg': {
    icon: 'fa-file-image',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    name: 'Image'
  },
  'image/png': {
    icon: 'fa-file-image',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    name: 'Image'
  },
  'image/gif': {
    icon: 'fa-file-image',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    name: 'Image'
  },
  'image/webp': {
    icon: 'fa-file-image',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    name: 'Image'
  },
  'image/svg+xml': {
    icon: 'fa-file-image',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    name: 'SVG'
  }
};

// Default file type for unknown MIME types
const DEFAULT_FILE_TYPE = {
  icon: 'fa-file',
  color: 'text-gray-400',
  bg: 'bg-gray-500/20',
  name: 'File'
};

/**
 * Get file type info by MIME type
 * @param {string} mimeType - File MIME type
 * @returns {Object} File type info with icon, color, and name
 */
function getFileTypeInfo(mimeType) {
  return FILE_TYPES[mimeType] || DEFAULT_FILE_TYPE;
}

/**
 * Check if file type is previewable
 * @param {string} mimeType - File MIME type
 * @returns {string|null} Preview type or null
 */
function getPreviewType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('application/vnd.google-apps')) return 'google';
  return null;
}

// Export for global access
window.Config = Config;
window.FILE_TYPES = FILE_TYPES;
window.getFileTypeInfo = getFileTypeInfo;
window.getPreviewType = getPreviewType;
