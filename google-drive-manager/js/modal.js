/**
 * Modal Module
 * Handles preview modal and upload modal functionality
 */

const Modal = {
  // State
  currentIndex: -1,
  files: [],

  // DOM elements
  elements: {},

  /**
   * Initialize modal elements
   */
  init() {
    this.elements = {
      // Preview modal
      previewModal: document.getElementById('preview-modal'),
      previewBackdrop: document.getElementById('preview-backdrop'),
      closePreview: document.getElementById('close-preview'),
      prevFile: document.getElementById('prev-file'),
      nextFile: document.getElementById('next-file'),
      previewIcon: document.getElementById('preview-icon'),
      previewFilename: document.getElementById('preview-filename'),
      previewMeta: document.getElementById('preview-meta'),
      previewDownload: document.getElementById('preview-download'),
      previewContent: document.getElementById('preview-content'),
      previewLoading: document.getElementById('preview-loading'),

      // Upload modal
      uploadModal: document.getElementById('upload-modal'),
      closeUploadModal: document.getElementById('close-upload-modal'),
      uploadDropZone: document.getElementById('upload-drop-zone'),
      fileInput: document.getElementById('file-input'),
      selectedFiles: document.getElementById('selected-files'),
      selectedFilesList: document.getElementById('selected-files-list'),
      uploadProgress: document.getElementById('upload-progress'),
      uploadProgressBar: document.getElementById('upload-progress-bar'),
      uploadPercentage: document.getElementById('upload-percentage'),
      uploadStatus: document.getElementById('upload-status'),
      cancelUpload: document.getElementById('cancel-upload'),
      startUpload: document.getElementById('start-upload'),
    };

    this.bindEvents();
  },

  /**
   * Bind modal events
   */
  bindEvents() {
    // Preview modal
    this.elements.closePreview?.addEventListener('click', () => this.close());
    this.elements.previewBackdrop?.addEventListener('click', () => this.close());
    this.elements.prevFile?.addEventListener('click', () => this.navigate(-1));
    this.elements.nextFile?.addEventListener('click', () => this.navigate(1));

    // Upload modal
    this.elements.closeUploadModal?.addEventListener('click', () => this.closeUpload());
    this.elements.cancelUpload?.addEventListener('click', () => this.closeUpload());
    this.elements.uploadDropZone?.addEventListener('click', () => this.elements.fileInput.click());
    this.elements.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
    this.elements.startUpload?.addEventListener('click', () => this.startUpload());

    // Upload drop zone
    this.elements.uploadDropZone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.uploadDropZone.classList.add('drag-over');
    });

    this.elements.uploadDropZone?.addEventListener('dragleave', () => {
      this.elements.uploadDropZone.classList.remove('drag-over');
    });

    this.elements.uploadDropZone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.uploadDropZone.classList.remove('drag-over');
      this.handleFileSelect(e.dataTransfer.files);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.elements.previewModal?.classList.contains('hidden')) {
        switch (e.key) {
          case 'Escape':
            this.close();
            break;
          case 'ArrowLeft':
            this.navigate(-1);
            break;
          case 'ArrowRight':
            this.navigate(1);
            break;
        }
      }

      if (!this.elements.uploadModal?.classList.contains('hidden') && e.key === 'Escape') {
        this.closeUpload();
      }
    });
  },

  /**
   * Set files array for navigation
   * @param {Array} files
   */
  setFiles(files) {
    this.files = files;
  },

  /**
   * Open preview modal
   * @param {number} index File index
   */
  open(index) {
    if (index < 0 || index >= this.files.length) return;

    this.currentIndex = index;
    const file = this.files[index];
    const typeInfo = getFileTypeInfo(file.mimeType);

    // Update header
    this.elements.previewIcon.className = `fas ${typeInfo.icon} text-2xl ${typeInfo.color}`;
    this.elements.previewFilename.textContent = file.name;
    this.elements.previewMeta.textContent = `${UI.formatSize(file.size)} • ${UI.formatDate(file.modifiedTime)}`;
    this.elements.previewDownload.href = DriveAPI.getDownloadUrl(file);

    // Update navigation
    this.elements.prevFile.classList.toggle('invisible', index === 0);
    this.elements.nextFile.classList.toggle('invisible', index === this.files.length - 1);

    // Load content
    this.loadPreviewContent(file);

    // Show modal
    this.elements.previewModal.classList.remove('hidden');
    this.elements.previewModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close preview modal
   */
  close() {
    this.elements.previewModal.classList.add('hidden');
    this.elements.previewModal.classList.remove('flex');
    document.body.style.overflow = '';
    this.currentIndex = -1;

    // Clear content
    this.clearPreviewContent();
  },

  /**
   * Navigate to prev/next file
   * @param {number} direction -1 or 1
   */
  navigate(direction) {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.files.length) {
      this.clearPreviewContent();
      this.open(newIndex);
    }
  },

  /**
   * Load preview content for file
   * @param {Object} file
   */
  loadPreviewContent(file) {
    this.elements.previewLoading.classList.remove('hidden');

    const previewType = getPreviewType(file.mimeType);
    let content = '';

    switch (previewType) {
      case 'image':
        const imgUrl = DriveAPI.getMediaUrl(file);
        content = `
          <img src="${imgUrl}" alt="${file.name}"
               class="max-w-full max-h-full object-contain"
               onload="Modal.hideLoading()"
               onerror="Modal.showPreviewError()">
        `;
        break;

      case 'video':
        content = `
          <video controls class="max-w-full max-h-full"
                 onloadeddata="Modal.hideLoading()">
            <source src="${DriveAPI.getMediaUrl(file)}" type="${file.mimeType}">
            Your browser does not support video playback.
          </video>
        `;
        break;

      case 'audio':
        const audioTypeInfo = getFileTypeInfo(file.mimeType);
        content = `
          <div class="flex flex-col items-center justify-center h-full gap-6">
            <div class="w-32 h-32 rounded-full ${audioTypeInfo.bg} flex items-center justify-center">
              <i class="fas ${audioTypeInfo.icon} text-5xl ${audioTypeInfo.color}"></i>
            </div>
            <p class="text-gray-300 font-medium">${file.name}</p>
            <audio controls class="w-full max-w-md" onloadeddata="Modal.hideLoading()">
              <source src="${DriveAPI.getMediaUrl(file)}" type="${file.mimeType}">
              Your browser does not support audio playback.
            </audio>
          </div>
        `;
        this.hideLoading();
        break;

      case 'pdf':
      case 'google':
        content = `
          <iframe src="${DriveAPI.getPreviewUrl(file)}"
                  class="w-full h-full border-0"
                  allowfullscreen
                  onload="Modal.hideLoading()">
          </iframe>
        `;
        break;

      default:
        const defaultTypeInfo = getFileTypeInfo(file.mimeType);
        content = `
          <div class="flex flex-col items-center justify-center h-full text-center p-8">
            <div class="w-24 h-24 rounded-2xl ${defaultTypeInfo.bg} flex items-center justify-center mb-6">
              <i class="fas ${defaultTypeInfo.icon} text-5xl ${defaultTypeInfo.color}"></i>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">${file.name}</h3>
            <p class="text-gray-400 mb-6">Preview not available for this file type</p>
            <a href="${DriveAPI.getDownloadUrl(file)}" target="_blank"
               class="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition">
              <i class="fas fa-download"></i>
              Download File
            </a>
          </div>
        `;
        this.hideLoading();
    }

    this.elements.previewContent.insertAdjacentHTML('beforeend', `<div class="preview-inner flex items-center justify-center w-full h-full">${content}</div>`);
  },

  /**
   * Clear preview content
   */
  clearPreviewContent() {
    const inner = this.elements.previewContent.querySelector('.preview-inner');
    if (inner) inner.remove();
  },

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.elements.previewLoading.classList.add('hidden');
  },

  /**
   * Show preview error
   */
  showPreviewError() {
    this.hideLoading();
    const inner = this.elements.previewContent.querySelector('.preview-inner');
    if (inner) {
      inner.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
          <i class="fas fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
          <p class="text-gray-400">Failed to load preview</p>
        </div>
      `;
    }
  },

  // ========== Upload Modal ==========

  selectedUploadFiles: [],

  /**
   * Open upload modal
   */
  openUpload() {
    this.selectedUploadFiles = [];
    this.updateSelectedFiles();
    this.elements.uploadProgress.classList.add('hidden');
    this.elements.uploadModal.classList.remove('hidden');
    this.elements.uploadModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close upload modal
   */
  closeUpload() {
    this.elements.uploadModal.classList.add('hidden');
    this.elements.uploadModal.classList.remove('flex');
    document.body.style.overflow = '';
    this.selectedUploadFiles = [];
    this.elements.fileInput.value = '';
  },

  /**
   * Handle file selection
   * @param {FileList} files
   */
  handleFileSelect(files) {
    this.selectedUploadFiles = [...this.selectedUploadFiles, ...Array.from(files)];
    this.updateSelectedFiles();
  },

  /**
   * Remove a selected file
   * @param {number} index
   */
  removeSelectedFile(index) {
    this.selectedUploadFiles.splice(index, 1);
    this.updateSelectedFiles();
  },

  /**
   * Update selected files display
   */
  updateSelectedFiles() {
    if (this.selectedUploadFiles.length === 0) {
      this.elements.selectedFiles.classList.add('hidden');
      this.elements.startUpload.disabled = true;
      return;
    }

    this.elements.selectedFiles.classList.remove('hidden');
    this.elements.startUpload.disabled = false;

    this.elements.selectedFilesList.innerHTML = this.selectedUploadFiles.map((file, index) => {
      const typeInfo = getFileTypeInfo(file.type || 'application/octet-stream');
      return `
        <div class="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
          <div class="flex items-center gap-3 min-w-0">
            <i class="fas ${typeInfo.icon} ${typeInfo.color}"></i>
            <span class="truncate text-sm">${file.name}</span>
            <span class="text-gray-500 text-xs flex-shrink-0">${UI.formatSize(file.size)}</span>
          </div>
          <button onclick="Modal.removeSelectedFile(${index})"
                  class="text-gray-400 hover:text-red-400 transition p-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');
  },

  /**
   * Start upload process
   */
  async startUpload() {
    if (this.selectedUploadFiles.length === 0) return;

    // Note: Upload requires OAuth2 authentication
    UI.showToast('Upload requires Google OAuth authentication. API key only supports reading files.', 'warning');
    console.log('To enable uploads:');
    console.log('1. Set up OAuth2 in Google Cloud Console');
    console.log('2. Implement Google Sign-In');
    console.log('3. Use the access token with DriveAPI.uploadFile()');
  }
};

// Export
window.Modal = Modal;
