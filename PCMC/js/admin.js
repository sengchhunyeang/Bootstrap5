/**
 * PCMC Admin Panel Module
 * Handles admin settings page functionality
 */

const Admin = {
  // DOM elements
  elements: {},

  // Current validation state
  apiKeyValid: false,
  folderValid: false,

  /**
   * Initialize admin panel
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadCurrentSettings();
    this.updateConnectionStatus();
  },

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      // API Key section
      apiKeyInput: document.getElementById('api-key-input'),
      apiKeyToggle: document.getElementById('api-key-toggle'),
      testApiKeyBtn: document.getElementById('test-api-key'),
      apiKeyStatus: document.getElementById('api-key-status'),

      // Folder section
      folderInput: document.getElementById('folder-input'),
      testFolderBtn: document.getElementById('test-folder'),
      folderStatus: document.getElementById('folder-status'),
      folderName: document.getElementById('validated-folder-name'),

      // Actions
      saveBtn: document.getElementById('save-settings'),
      resetBtn: document.getElementById('reset-settings'),

      // Status display
      currentApiKey: document.getElementById('current-api-key'),
      currentFolderId: document.getElementById('current-folder-id'),
      connectionIndicator: document.getElementById('connection-indicator'),
      connectionText: document.getElementById('connection-text'),

      // Toast
      toast: document.getElementById('admin-toast'),
      toastIcon: document.getElementById('admin-toast-icon'),
      toastMessage: document.getElementById('admin-toast-message')
    };
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // API key show/hide toggle
    this.elements.apiKeyToggle?.addEventListener('click', () => this.toggleApiKeyVisibility());

    // Test API key
    this.elements.testApiKeyBtn?.addEventListener('click', () => this.testApiKey());

    // Test folder
    this.elements.testFolderBtn?.addEventListener('click', () => this.testFolder());

    // Folder input - auto-extract ID from URL
    this.elements.folderInput?.addEventListener('input', (e) => {
      const extracted = Config.extractFolderId(e.target.value);
      if (extracted && extracted !== e.target.value) {
        // Show extracted ID
        this.elements.folderInput.value = extracted;
      }
    });

    // Save settings
    this.elements.saveBtn?.addEventListener('click', () => this.saveSettings());

    // Reset settings
    this.elements.resetBtn?.addEventListener('click', () => this.resetSettings());

    // Enter key to test
    this.elements.apiKeyInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.testApiKey();
    });

    this.elements.folderInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.testFolder();
    });
  },

  /**
   * Load current settings into form
   */
  loadCurrentSettings() {
    const config = Config.getConfig();

    if (this.elements.apiKeyInput) {
      this.elements.apiKeyInput.value = config.apiKey;
      this.elements.apiKeyInput.type = 'password';
    }

    if (this.elements.folderInput) {
      this.elements.folderInput.value = config.folderId;
    }

    // Update status displays
    if (this.elements.currentApiKey) {
      this.elements.currentApiKey.textContent = Config.maskApiKey(config.apiKey);
    }

    if (this.elements.currentFolderId) {
      this.elements.currentFolderId.textContent = config.folderId;
    }
  },

  /**
   * Toggle API key visibility
   */
  toggleApiKeyVisibility() {
    const input = this.elements.apiKeyInput;
    const icon = this.elements.apiKeyToggle?.querySelector('i');

    if (input.type === 'password') {
      input.type = 'text';
      icon?.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon?.classList.replace('fa-eye-slash', 'fa-eye');
    }
  },

  /**
   * Test API key validity
   */
  async testApiKey() {
    const apiKey = this.elements.apiKeyInput?.value?.trim();

    if (!apiKey) {
      this.showStatus('apiKeyStatus', 'error', 'Please enter an API key');
      return;
    }

    this.showStatus('apiKeyStatus', 'loading', 'Testing API key...');
    this.elements.testApiKeyBtn.disabled = true;

    const result = await Config.validateApiKey(apiKey);

    this.elements.testApiKeyBtn.disabled = false;
    this.apiKeyValid = result.success;

    if (result.success) {
      this.showStatus('apiKeyStatus', 'success', 'API key is valid');
    } else {
      this.showStatus('apiKeyStatus', 'error', result.message);
    }
  },

  /**
   * Test folder access
   */
  async testFolder() {
    const folderId = this.elements.folderInput?.value?.trim();
    const apiKey = this.elements.apiKeyInput?.value?.trim();

    if (!folderId) {
      this.showStatus('folderStatus', 'error', 'Please enter a folder ID or URL');
      return;
    }

    if (!apiKey) {
      this.showStatus('folderStatus', 'error', 'Please enter API key first');
      return;
    }

    // Extract folder ID if URL was pasted
    const extractedId = Config.extractFolderId(folderId);
    if (!extractedId) {
      this.showStatus('folderStatus', 'error', 'Invalid folder ID or URL format');
      return;
    }

    // Update input with extracted ID
    this.elements.folderInput.value = extractedId;

    this.showStatus('folderStatus', 'loading', 'Testing folder access...');
    this.elements.testFolderBtn.disabled = true;

    const result = await Config.validateFolder(extractedId, apiKey);

    this.elements.testFolderBtn.disabled = false;
    this.folderValid = result.success;

    if (result.success) {
      this.showStatus('folderStatus', 'success', `Access verified: ${result.folderName}`);
      if (this.elements.folderName) {
        this.elements.folderName.textContent = result.folderName;
        this.elements.folderName.parentElement.classList.remove('hidden');
      }
    } else {
      this.showStatus('folderStatus', 'error', result.message);
      if (this.elements.folderName) {
        this.elements.folderName.parentElement.classList.add('hidden');
      }
    }
  },

  /**
   * Save settings to localStorage
   */
  async saveSettings() {
    const apiKey = this.elements.apiKeyInput?.value?.trim();
    const folderId = this.elements.folderInput?.value?.trim();

    // Validate inputs
    if (!apiKey) {
      this.showToast('Please enter an API key', 'error');
      return;
    }

    if (!folderId) {
      this.showToast('Please enter a folder ID', 'error');
      return;
    }

    // Recommend testing before saving
    if (!this.apiKeyValid || !this.folderValid) {
      const proceed = confirm('Settings have not been tested. Save anyway?');
      if (!proceed) return;
    }

    // Save settings
    const success = Config.saveConfig(apiKey, folderId);

    if (success) {
      this.showToast('Settings saved successfully', 'success');
      this.loadCurrentSettings();
      this.updateConnectionStatus();
    } else {
      this.showToast('Failed to save settings', 'error');
    }
  },

  /**
   * Reset settings to defaults
   */
  resetSettings() {
    const confirmed = confirm(
      'Reset to default settings?\n\n' +
      'API Key: ' + Config.maskApiKey(Config.DEFAULTS.apiKey) + '\n' +
      'Folder ID: ' + Config.DEFAULTS.folderId
    );

    if (!confirmed) return;

    const success = Config.resetConfig();

    if (success) {
      this.loadCurrentSettings();
      this.apiKeyValid = false;
      this.folderValid = false;
      this.clearStatus('apiKeyStatus');
      this.clearStatus('folderStatus');
      this.updateConnectionStatus();
      this.showToast('Settings reset to defaults', 'success');
    } else {
      this.showToast('Failed to reset settings', 'error');
    }
  },

  /**
   * Update connection status indicator
   */
  async updateConnectionStatus() {
    const indicator = this.elements.connectionIndicator;
    const text = this.elements.connectionText;

    if (!indicator || !text) return;

    // Show checking state
    indicator.className = 'w-3 h-3 rounded-full bg-yellow-400 animate-pulse';
    text.textContent = 'Checking connection...';

    try {
      const result = await DriveAPI.testConnection();

      if (result.success) {
        indicator.className = 'w-3 h-3 rounded-full bg-green-400';
        text.textContent = `Connected • ${result.folderName} (${result.fileCount} files)`;
        text.className = 'text-sm text-green-400';
      } else {
        indicator.className = 'w-3 h-3 rounded-full bg-red-400';
        text.textContent = `Error: ${result.message}`;
        text.className = 'text-sm text-red-400';
      }
    } catch (error) {
      indicator.className = 'w-3 h-3 rounded-full bg-red-400';
      text.textContent = 'Connection failed';
      text.className = 'text-sm text-red-400';
    }
  },

  /**
   * Show status message
   * @param {string} elementKey - Status element key
   * @param {string} type - 'success', 'error', 'loading'
   * @param {string} message - Status message
   */
  showStatus(elementKey, type, message) {
    const element = this.elements[elementKey];
    if (!element) return;

    element.classList.remove('hidden');

    const icons = {
      success: '<i class="fas fa-check-circle text-green-400"></i>',
      error: '<i class="fas fa-exclamation-circle text-red-400"></i>',
      loading: '<i class="fas fa-spinner fa-spin text-blue-400"></i>'
    };

    const colors = {
      success: 'text-green-400',
      error: 'text-red-400',
      loading: 'text-blue-400'
    };

    element.innerHTML = `
      <span class="flex items-center gap-2 ${colors[type]}">
        ${icons[type]}
        <span>${message}</span>
      </span>
    `;
  },

  /**
   * Clear status message
   * @param {string} elementKey - Status element key
   */
  clearStatus(elementKey) {
    const element = this.elements[elementKey];
    if (element) {
      element.classList.add('hidden');
      element.innerHTML = '';
    }
  },

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - 'success', 'error', 'warning', 'info'
   */
  showToast(message, type = 'success') {
    if (!this.elements.toast) return;

    const icons = {
      success: 'fa-check-circle text-green-400',
      error: 'fa-exclamation-circle text-red-400',
      warning: 'fa-exclamation-triangle text-yellow-400',
      info: 'fa-info-circle text-blue-400'
    };

    this.elements.toastIcon.className = `fas ${icons[type]} text-lg`;
    this.elements.toastMessage.textContent = message;

    // Show toast
    this.elements.toast.classList.remove('translate-y-full', 'opacity-0');
    this.elements.toast.classList.add('translate-y-0', 'opacity-100');

    // Auto hide after 3 seconds
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.elements.toast.classList.add('translate-y-full', 'opacity-0');
      this.elements.toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
});

// Export for global access
window.Admin = Admin;
