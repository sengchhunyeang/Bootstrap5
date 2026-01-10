/**
 * PCMC Upload Module
 * Handles file upload functionality with drag-and-drop
 */

const Upload = {
  // State
  selectedFiles: [],
  isUploading: false,

  // DOM elements
  elements: {},

  /**
   * Initialize upload module
   */
  init() {
    this.cacheElements();
    this.bindEvents();
  },

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements = {
      modal: document.getElementById('upload-modal'),
      closeBtn: document.getElementById('close-upload-modal'),
      dropZone: document.getElementById('upload-drop-zone'),
      fileInput: document.getElementById('file-input'),
      selectedFiles: document.getElementById('selected-files'),
      filesList: document.getElementById('selected-files-list'),
      progress: document.getElementById('upload-progress'),
      progressBar: document.getElementById('upload-progress-bar'),
      progressPercent: document.getElementById('upload-percentage'),
      progressStatus: document.getElementById('upload-status'),
      cancelBtn: document.getElementById('cancel-upload'),
      startBtn: document.getElementById('start-upload'),
      uploadBtn: document.getElementById('upload-btn'),
      emptyUploadBtn: document.getElementById('empty-upload-btn'),
      globalDropZone: document.getElementById('drop-zone')
    };
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Open upload modal
    this.elements.uploadBtn?.addEventListener('click', () => this.openModal());
    this.elements.emptyUploadBtn?.addEventListener('click', () => this.openModal());

    // Close modal
    this.elements.closeBtn?.addEventListener('click', () => this.closeModal());
    this.elements.cancelBtn?.addEventListener('click', () => this.closeModal());

    // File input
    this.elements.dropZone?.addEventListener('click', () => this.elements.fileInput?.click());
    this.elements.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

    // Drop zone events
    this.elements.dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.dropZone.classList.add('drag-over');
    });

    this.elements.dropZone?.addEventListener('dragleave', () => {
      this.elements.dropZone.classList.remove('drag-over');
    });

    this.elements.dropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.dropZone.classList.remove('drag-over');
      this.handleFileSelect(e.dataTransfer.files);
    });

    // Start upload
    this.elements.startBtn?.addEventListener('click', () => this.startUpload());

    // Global drag and drop
    this.initGlobalDragDrop();

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen()) {
        this.closeModal();
      }
    });
  },

  /**
   * Initialize global drag and drop
   */
  initGlobalDragDrop() {
    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      if (this.elements.globalDropZone) {
        this.elements.globalDropZone.classList.remove('hidden');
        this.elements.globalDropZone.classList.add('flex');
      }
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0 && this.elements.globalDropZone) {
        this.elements.globalDropZone.classList.add('hidden');
        this.elements.globalDropZone.classList.remove('flex');
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      if (this.elements.globalDropZone) {
        this.elements.globalDropZone.classList.add('hidden');
        this.elements.globalDropZone.classList.remove('flex');
      }

      if (e.dataTransfer.files.length > 0) {
        this.handleFileSelect(e.dataTransfer.files);
        this.openModal();
      }
    });
  },

  /**
   * Check if modal is open
   * @returns {boolean}
   */
  isModalOpen() {
    return this.elements.modal && !this.elements.modal.classList.contains('hidden');
  },

  /**
   * Open upload modal
   */
  openModal() {
    this.selectedFiles = [];
    this.updateFilesList();
    this.resetProgress();

    this.elements.modal.classList.remove('hidden');
    this.elements.modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close upload modal
   */
  closeModal() {
    if (this.isUploading) {
      if (!confirm('Upload in progress. Are you sure you want to cancel?')) {
        return;
      }
    }

    this.elements.modal.classList.add('hidden');
    this.elements.modal.classList.remove('flex');
    document.body.style.overflow = '';

    this.selectedFiles = [];
    this.isUploading = false;
    if (this.elements.fileInput) {
      this.elements.fileInput.value = '';
    }
  },

  /**
   * Handle file selection
   * @param {FileList} files - Selected files
   */
  handleFileSelect(files) {
    this.selectedFiles = [...this.selectedFiles, ...Array.from(files)];
    this.updateFilesList();
  },

  /**
   * Remove a file from selection
   * @param {number} index - File index
   */
  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.updateFilesList();
  },

  /**
   * Update files list display
   */
  updateFilesList() {
    if (this.selectedFiles.length === 0) {
      this.elements.selectedFiles?.classList.add('hidden');
      if (this.elements.startBtn) {
        this.elements.startBtn.disabled = true;
      }
      return;
    }

    this.elements.selectedFiles?.classList.remove('hidden');
    if (this.elements.startBtn) {
      this.elements.startBtn.disabled = false;
    }

    if (this.elements.filesList) {
      this.elements.filesList.innerHTML = this.selectedFiles.map((file, index) => {
        const typeInfo = getFileTypeInfo(file.type || 'application/octet-stream');
        return `
          <div class="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
            <div class="flex items-center gap-2 min-w-0">
              <i class="fas ${typeInfo.icon} ${typeInfo.color} text-sm"></i>
              <span class="truncate text-sm">${UI.escapeHtml(file.name)}</span>
              <span class="text-gray-500 text-xs flex-shrink-0">${UI.formatSize(file.size)}</span>
            </div>
            <button onclick="Upload.removeFile(${index})"
                    class="text-gray-400 hover:text-red-400 transition p-1 flex-shrink-0">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
      }).join('');
    }
  },

  /**
   * Reset progress display
   */
  resetProgress() {
    this.elements.progress?.classList.add('hidden');
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = '0%';
    }
    if (this.elements.progressPercent) {
      this.elements.progressPercent.textContent = '0%';
    }
    if (this.elements.progressStatus) {
      this.elements.progressStatus.textContent = '';
    }
  },

  /**
   * Update progress display
   * @param {number} percent - Progress percentage
   * @param {string} status - Status message
   */
  updateProgress(percent, status) {
    this.elements.progress?.classList.remove('hidden');
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${percent}%`;
    }
    if (this.elements.progressPercent) {
      this.elements.progressPercent.textContent = `${percent}%`;
    }
    if (this.elements.progressStatus) {
      this.elements.progressStatus.textContent = status;
    }
  },

  /**
   * Start upload process
   */
  async startUpload() {
    if (this.selectedFiles.length === 0 || this.isUploading) return;

    // Note: Full upload requires OAuth2
    // This is a placeholder that shows the limitation
    UI.showToast('Upload requires Google OAuth authentication. API key only allows reading files.', 'warning');

    console.log('%c Upload Info', 'background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('To enable file uploads, you need to:');
    console.log('1. Create OAuth 2.0 credentials in Google Cloud Console');
    console.log('2. Implement Google Sign-In in your app');
    console.log('3. Request drive.file scope');
    console.log('4. Use the access token with DriveAPI.uploadFile()');
    console.log('');
    console.log('Files selected for upload:', this.selectedFiles.map(f => f.name));

    // Simulate upload progress for demo
    this.isUploading = true;
    this.elements.startBtn.disabled = true;

    for (let i = 0; i <= 100; i += 10) {
      this.updateProgress(i, i === 100 ? 'Demo complete (no actual upload without OAuth)' : `Simulating... ${i}%`);
      await new Promise(r => setTimeout(r, 200));
    }

    this.isUploading = false;
    this.elements.startBtn.disabled = false;

    setTimeout(() => {
      UI.showToast('To actually upload files, OAuth2 authentication is required', 'info');
    }, 1000);
  }
};

// Export for global access
window.Upload = Upload;
