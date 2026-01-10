/**
 * Google Drive API Module
 * Handles all API interactions with Google Drive
 */

const DriveAPI = {
  /**
   * Fetch all files from the configured folder
   * @returns {Promise<Array>} Array of file objects
   */
  async fetchFiles() {
    const query = `'${CONFIG.FOLDER_ID}' in parents and trashed = false`;
    const url = `${CONFIG.API_BASE_URL}/files?` +
      `q=${encodeURIComponent(query)}` +
      `&fields=files(${CONFIG.FILE_FIELDS})` +
      `&orderBy=name` +
      `&pageSize=${CONFIG.PAGE_SIZE}` +
      `&key=${CONFIG.API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch files');
    }

    const data = await response.json();
    return data.files || [];
  },

  /**
   * Fetch folder metadata
   * @returns {Promise<Object>} Folder info
   */
  async fetchFolderInfo() {
    const url = `${CONFIG.API_BASE_URL}/files/${CONFIG.FOLDER_ID}?` +
      `fields=name,modifiedTime` +
      `&key=${CONFIG.API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return { name: 'Drive Folder' };
    }

    return await response.json();
  },

  /**
   * Get download URL for a file
   * @param {Object} file File object
   * @returns {string} Download URL
   */
  getDownloadUrl(file) {
    // Google Docs/Sheets/Slides need export
    if (file.mimeType.startsWith('application/vnd.google-apps')) {
      const exportFormats = {
        'application/vnd.google-apps.document': 'application/pdf',
        'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.google-apps.presentation': 'application/pdf',
        'application/vnd.google-apps.drawing': 'image/png',
      };

      const exportType = exportFormats[file.mimeType];
      if (exportType) {
        return `${CONFIG.API_BASE_URL}/files/${file.id}/export?` +
          `mimeType=${encodeURIComponent(exportType)}&key=${CONFIG.API_KEY}`;
      }
      return file.webViewLink || '#';
    }

    // Regular files use direct download
    return `${CONFIG.API_BASE_URL}/files/${file.id}?alt=media&key=${CONFIG.API_KEY}`;
  },

  /**
   * Get preview URL for a file
   * @param {Object} file File object
   * @returns {string} Preview URL
   */
  getPreviewUrl(file) {
    return `https://drive.google.com/file/d/${file.id}/preview`;
  },

  /**
   * Get direct media URL for a file
   * @param {Object} file File object
   * @returns {string} Media URL
   */
  getMediaUrl(file) {
    return `${CONFIG.API_BASE_URL}/files/${file.id}?alt=media&key=${CONFIG.API_KEY}`;
  },

  /**
   * Upload a file to the folder
   * Requires OAuth2 access token
   * @param {File} file File to upload
   * @param {string} accessToken OAuth2 access token
   * @param {Function} onProgress Progress callback
   * @returns {Promise<Object>} Uploaded file info
   */
  async uploadFile(file, accessToken, onProgress) {
    if (!accessToken) {
      throw new Error('Upload requires authentication. Please sign in with Google.');
    }

    const metadata = {
      name: file.name,
      parents: [CONFIG.FOLDER_ID]
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch(`${CONFIG.UPLOAD_URL}?uploadType=multipart`, {
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
   * Delete a file (requires authentication)
   * @param {string} fileId File ID
   * @param {string} accessToken OAuth2 access token
   * @returns {Promise<void>}
   */
  async deleteFile(fileId, accessToken) {
    if (!accessToken) {
      throw new Error('Delete requires authentication');
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Delete failed');
    }
  }
};

// Export
window.DriveAPI = DriveAPI;
