/**
 * Configuration file for Google Drive File Manager
 * Contains API settings, folder ID, and constants
 */

const CONFIG = {
  // Google Drive API Key - Replace with your own
  API_KEY: 'YOUR_API_KEY_HERE',

  // Target folder ID
  FOLDER_ID: '19gVC6DY_uS_owDCaTEJu8kPzZteVgSKO',

  // API endpoints
  API_BASE_URL: 'https://www.googleapis.com/drive/v3',
  UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3/files',

  // File fields to fetch
  FILE_FIELDS: 'id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,iconLink,imageMediaMetadata',

  // Maximum files per request
  PAGE_SIZE: 100,

  // Supported preview types
  PREVIEW_TYPES: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/webm'],
    pdf: ['application/pdf'],
    google: [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.google-apps.presentation',
      'application/vnd.google-apps.form',
      'application/vnd.google-apps.drawing'
    ]
  }
};

// File type icons and colors mapping
const FILE_TYPES = {
  // Google Apps
  'application/vnd.google-apps.document': { icon: 'fa-file-word', color: 'text-blue-400', name: 'Google Doc', bg: 'bg-blue-500/20' },
  'application/vnd.google-apps.spreadsheet': { icon: 'fa-file-excel', color: 'text-green-400', name: 'Google Sheet', bg: 'bg-green-500/20' },
  'application/vnd.google-apps.presentation': { icon: 'fa-file-powerpoint', color: 'text-orange-400', name: 'Google Slides', bg: 'bg-orange-500/20' },
  'application/vnd.google-apps.form': { icon: 'fa-poll', color: 'text-purple-400', name: 'Google Form', bg: 'bg-purple-500/20' },
  'application/vnd.google-apps.drawing': { icon: 'fa-pencil-alt', color: 'text-yellow-400', name: 'Google Drawing', bg: 'bg-yellow-500/20' },
  'application/vnd.google-apps.folder': { icon: 'fa-folder', color: 'text-yellow-400', name: 'Folder', bg: 'bg-yellow-500/20' },

  // Documents
  'application/pdf': { icon: 'fa-file-pdf', color: 'text-red-400', name: 'PDF', bg: 'bg-red-500/20' },
  'application/msword': { icon: 'fa-file-word', color: 'text-blue-500', name: 'Word', bg: 'bg-blue-500/20' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'fa-file-word', color: 'text-blue-500', name: 'Word', bg: 'bg-blue-500/20' },
  'application/vnd.ms-excel': { icon: 'fa-file-excel', color: 'text-green-500', name: 'Excel', bg: 'bg-green-500/20' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'fa-file-excel', color: 'text-green-500', name: 'Excel', bg: 'bg-green-500/20' },
  'application/vnd.ms-powerpoint': { icon: 'fa-file-powerpoint', color: 'text-orange-500', name: 'PowerPoint', bg: 'bg-orange-500/20' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'fa-file-powerpoint', color: 'text-orange-500', name: 'PowerPoint', bg: 'bg-orange-500/20' },

  // Archives
  'application/zip': { icon: 'fa-file-archive', color: 'text-yellow-500', name: 'ZIP', bg: 'bg-yellow-500/20' },
  'application/x-rar-compressed': { icon: 'fa-file-archive', color: 'text-yellow-500', name: 'RAR', bg: 'bg-yellow-500/20' },
  'application/x-7z-compressed': { icon: 'fa-file-archive', color: 'text-yellow-500', name: '7Z', bg: 'bg-yellow-500/20' },
  'application/gzip': { icon: 'fa-file-archive', color: 'text-yellow-500', name: 'GZIP', bg: 'bg-yellow-500/20' },

  // Code
  'text/plain': { icon: 'fa-file-alt', color: 'text-gray-400', name: 'Text', bg: 'bg-gray-500/20' },
  'text/html': { icon: 'fa-file-code', color: 'text-orange-400', name: 'HTML', bg: 'bg-orange-500/20' },
  'text/css': { icon: 'fa-file-code', color: 'text-blue-400', name: 'CSS', bg: 'bg-blue-500/20' },
  'text/javascript': { icon: 'fa-file-code', color: 'text-yellow-400', name: 'JavaScript', bg: 'bg-yellow-500/20' },
  'application/javascript': { icon: 'fa-file-code', color: 'text-yellow-400', name: 'JavaScript', bg: 'bg-yellow-500/20' },
  'application/json': { icon: 'fa-file-code', color: 'text-green-400', name: 'JSON', bg: 'bg-green-500/20' },
  'text/xml': { icon: 'fa-file-code', color: 'text-orange-400', name: 'XML', bg: 'bg-orange-500/20' },

  // Media
  'video/mp4': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video', bg: 'bg-purple-500/20' },
  'video/webm': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video', bg: 'bg-purple-500/20' },
  'video/quicktime': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video', bg: 'bg-purple-500/20' },
  'video/x-msvideo': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video', bg: 'bg-purple-500/20' },
  'audio/mpeg': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio', bg: 'bg-pink-500/20' },
  'audio/wav': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio', bg: 'bg-pink-500/20' },
  'audio/ogg': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio', bg: 'bg-pink-500/20' },
  'audio/mp3': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio', bg: 'bg-pink-500/20' },

  // Images
  'image/jpeg': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image', bg: 'bg-cyan-500/20' },
  'image/png': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image', bg: 'bg-cyan-500/20' },
  'image/gif': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image', bg: 'bg-cyan-500/20' },
  'image/webp': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image', bg: 'bg-cyan-500/20' },
  'image/svg+xml': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'SVG', bg: 'bg-cyan-500/20' },
  'image/bmp': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image', bg: 'bg-cyan-500/20' },
};

// Default file type
const DEFAULT_FILE_TYPE = { icon: 'fa-file', color: 'text-gray-400', name: 'File', bg: 'bg-gray-500/20' };

/**
 * Get file type info by MIME type
 * @param {string} mimeType
 * @returns {Object}
 */
function getFileTypeInfo(mimeType) {
  return FILE_TYPES[mimeType] || DEFAULT_FILE_TYPE;
}

/**
 * Check if file type is previewable
 * @param {string} mimeType
 * @returns {string|null} Preview type or null
 */
function getPreviewType(mimeType) {
  for (const [type, mimeTypes] of Object.entries(CONFIG.PREVIEW_TYPES)) {
    if (mimeTypes.includes(mimeType)) {
      return type;
    }
  }
  return null;
}

// Export for use in other modules
window.CONFIG = CONFIG;
window.FILE_TYPES = FILE_TYPES;
window.getFileTypeInfo = getFileTypeInfo;
window.getPreviewType = getPreviewType;
