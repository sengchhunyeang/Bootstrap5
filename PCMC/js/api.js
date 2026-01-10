/**
 * PCMC Google Drive API Module
 * Handles all API interactions with Google Drive
 */

const DriveAPI = {
  /**
   * Fetch all files from the configured folder
   * @returns {Promise<Array>} Array of file objects
   */
  async fetchFiles() {
    const config = Config.getConfig();
    const query = `'${config.folderId}' in parents and trashed = false`;
    let allFiles = [];
    let pageToken = null;

    do {
      let url = `${Config.API_BASE_URL}/files?` +
        `q=${encodeURIComponent(query)}` +
        `&fields=files(${Config.FILE_FIELDS}),nextPageToken` +
        `&orderBy=name` +
        `&pageSize=1000` +
        `&key=${config.apiKey}`;

      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch files');
      }

      const data = await response.json();
      allFiles = allFiles.concat(data.files || []);
      pageToken = data.nextPageToken;

    } while (pageToken);

    return allFiles;
  },

  /**
   * Fetch folder metadata
   * @returns {Promise<Object>} Folder info with name
   */
  async fetchFolderInfo() {
    const config = Config.getConfig();

    const url = `${Config.API_BASE_URL}/files/${config.folderId}?` +
      `fields=name,modifiedTime&key=${config.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return { name: 'PCMC Files' };
    }

    return await response.json();
  },

  /**
   * Get download URL for a file
   * @param {Object} file - File object
   * @returns {string} Download URL
   */
  getDownloadUrl(file) {
    const config = Config.getConfig();

    // Google Docs/Sheets/Slides need export
    if (file.mimeType.startsWith('application/vnd.google-apps')) {
      const exportFormats = {
        'application/vnd.google-apps.document': 'application/pdf',
        'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.google-apps.presentation': 'application/pdf',
        'application/vnd.google-apps.drawing': 'image/png'
      };

      const exportType = exportFormats[file.mimeType];
      if (exportType) {
        return `${Config.API_BASE_URL}/files/${file.id}/export?` +
          `mimeType=${encodeURIComponent(exportType)}&key=${config.apiKey}`;
      }
      return file.webViewLink || '#';
    }

    // Regular files use direct download
    return `${Config.API_BASE_URL}/files/${file.id}?alt=media&key=${config.apiKey}`;
  },

  /**
   * Get preview URL for a file (Google Drive embed)
   * @param {Object} file - File object
   * @returns {string} Preview URL
   */
  getPreviewUrl(file) {
    return `https://drive.google.com/file/d/${file.id}/preview`;
  },
// Testing comment
  /**
   * Get direct media URL for a file
   * @param {Object} file - File object
   * @returns {string} Media URL
   */
  getMediaUrl(file) {
    const config = Config.getConfig();
    return `${Config.API_BASE_URL}/files/${file.id}?alt=media&key=${config.apiKey}`;
  },

  /**
   * Upload a file to the configured folder
   * Note: Requires OAuth2 access token, API key alone is not sufficient
   * @param {File} file - File to upload
   * @param {string} accessToken - OAuth2 access token
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Uploaded file info
   */
  async uploadFile(file, accessToken, onProgress) {
    const config = Config.getConfig();

    if (!accessToken) {
      throw new Error('Upload requires Google OAuth authentication');
    }

    const metadata = {
      name: file.name,
      parents: [config.folderId]
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch(`${Config.UPLOAD_URL}?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    return await response.json();
  },

  /**
   * Search files by name
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching files
   */
  async searchFiles(query) {
    const config = Config.getConfig();
    const searchQuery = `'${config.folderId}' in parents and trashed = false and name contains '${query}'`;

    const url = `${Config.API_BASE_URL}/files?` +
      `q=${encodeURIComponent(searchQuery)}` +
      `&fields=files(${Config.FILE_FIELDS})` +
      `&key=${config.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return data.files || [];
  },

  /**
   * Test connection with current settings
   * @returns {Promise<Object>} Connection status
   */
  async testConnection() {
    try {
      const [files, folderInfo] = await Promise.all([
        this.fetchFiles(),
        this.fetchFolderInfo()
      ]);

      return {
        success: true,
        message: 'Connection successful',
        folderName: folderInfo.name,
        fileCount: files.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Export for global access
window.DriveAPI = DriveAPI;
