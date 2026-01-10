/**
 * PCMC Modal Module
 * Handles file preview modal functionality
 */

const Modal = {
  // Current state
  currentIndex: -1,
  files: [],

  // DOM elements
  elements: {},

  /**
   * Initialize modal and bind events
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
      modal: document.getElementById('preview-modal'),
      backdrop: document.getElementById('preview-backdrop'),
      closeBtn: document.getElementById('close-preview'),
      prevBtn: document.getElementById('prev-file'),
      nextBtn: document.getElementById('next-file'),
      icon: document.getElementById('preview-icon'),
      filename: document.getElementById('preview-filename'),
      meta: document.getElementById('preview-meta'),
      downloadBtn: document.getElementById('preview-download'),
      content: document.getElementById('preview-content'),
      loading: document.getElementById('preview-loading')
    };
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button
    this.elements.closeBtn?.addEventListener('click', () => this.close());

    // Backdrop click
    this.elements.backdrop?.addEventListener('click', () => this.close());

    // Navigation buttons
    this.elements.prevBtn?.addEventListener('click', () => this.navigate(-1));
    this.elements.nextBtn?.addEventListener('click', () => this.navigate(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.isOpen()) {
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
    });
  },

  /**
   * Set files array for navigation
   * @param {Array} files - Array of file objects
   */
  setFiles(files) {
    this.files = files;
  },

  /**
   * Check if modal is open
   * @returns {boolean}
   */
  isOpen() {
    return this.elements.modal && !this.elements.modal.classList.contains('hidden');
  },

  /**
   * Open preview modal for file at index
   * @param {number} index - File index
   */
  open(index) {
    if (index < 0 || index >= this.files.length) return;

    this.currentIndex = index;
    const file = this.files[index];
    const typeInfo = getFileTypeInfo(file.mimeType);

    // Update header
    this.elements.icon.className = `fas ${typeInfo.icon} text-xl ${typeInfo.color}`;
    this.elements.filename.textContent = file.name;
    this.elements.meta.textContent = `${UI.formatSize(file.size)} • ${UI.formatDate(file.modifiedTime)}`;
    this.elements.downloadBtn.href = DriveAPI.getDownloadUrl(file);

    // Update navigation visibility
    this.elements.prevBtn.classList.toggle('invisible', index === 0);
    this.elements.nextBtn.classList.toggle('invisible', index === this.files.length - 1);

    // Load preview content
    this.loadContent(file);

    // Show modal
    this.elements.modal.classList.remove('hidden');
    this.elements.modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close preview modal
   */
  close() {
    this.elements.modal.classList.add('hidden');
    this.elements.modal.classList.remove('flex');
    document.body.style.overflow = '';
    this.currentIndex = -1;

    // Clear content
    this.clearContent();
  },

  /**
   * Navigate to previous/next file
   * @param {number} direction - -1 for prev, 1 for next
   */
  navigate(direction) {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < this.files.length) {
      this.clearContent();
      this.open(newIndex);
    }
  },

  /**
   * Load preview content for file
   * @param {Object} file - File object
   */
  loadContent(file) {
    // Show loading
    this.elements.loading.classList.remove('hidden');

    const previewType = getPreviewType(file.mimeType);
    let contentHtml = '';

    switch (previewType) {
      case 'image':
        contentHtml = `
          <img src="${DriveAPI.getMediaUrl(file)}" alt="${UI.escapeHtml(file.name)}"
               class="max-w-full max-h-full object-contain"
               onload="Modal.hideLoading()"
               onerror="Modal.showError()">
        `;
        break;

      case 'video':
        contentHtml = `
          <video controls class="max-w-full max-h-full" onloadeddata="Modal.hideLoading()">
            <source src="${DriveAPI.getMediaUrl(file)}" type="${file.mimeType}">
            Your browser does not support video playback.
          </video>
        `;
        break;

      case 'audio':
        const audioInfo = getFileTypeInfo(file.mimeType);
        contentHtml = `
          <div class="flex flex-col items-center justify-center h-full gap-6">
            <div class="w-28 h-28 rounded-full ${audioInfo.bg} flex items-center justify-center">
              <i class="fas ${audioInfo.icon} text-5xl ${audioInfo.color}"></i>
            </div>
            <p class="text-gray-300 font-medium text-center px-4">${UI.escapeHtml(file.name)}</p>
            <audio controls class="w-full max-w-md" onloadeddata="Modal.hideLoading()">
              <source src="${DriveAPI.getMediaUrl(file)}" type="${file.mimeType}">
            </audio>
          </div>
        `;
        this.hideLoading();
        break;

      case 'pdf':
      case 'google':
        contentHtml = `
          <iframe src="${DriveAPI.getPreviewUrl(file)}"
                  class="w-full h-full border-0"
                  allowfullscreen
                  onload="Modal.hideLoading()">
          </iframe>
        `;
        break;

      default:
        const defaultInfo = getFileTypeInfo(file.mimeType);
        contentHtml = `
          <div class="flex flex-col items-center justify-center h-full text-center p-6">
            <div class="w-20 h-20 rounded-2xl ${defaultInfo.bg} flex items-center justify-center mb-4">
              <i class="fas ${defaultInfo.icon} text-4xl ${defaultInfo.color}"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">${UI.escapeHtml(file.name)}</h3>
            <p class="text-gray-400 mb-4 text-sm">Preview not available for this file type</p>
            <a href="${DriveAPI.getDownloadUrl(file)}" target="_blank"
               class="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-500 transition">
              <i class="fas fa-download"></i>
              Download
            </a>
          </div>
        `;
        this.hideLoading();
    }

    // Insert content
    this.elements.content.insertAdjacentHTML(
      'beforeend',
      `<div class="preview-inner flex items-center justify-center w-full h-full">${contentHtml}</div>`
    );
  },

  /**
   * Clear preview content
   */
  clearContent() {
    const inner = this.elements.content?.querySelector('.preview-inner');
    if (inner) inner.remove();
  },

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.elements.loading?.classList.add('hidden');
  },

  /**
   * Show error state
   */
  showError() {
    this.hideLoading();
    const inner = this.elements.content?.querySelector('.preview-inner');
    if (inner) {
      inner.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
          <p class="text-gray-400">Failed to load preview</p>
        </div>
      `;
    }
  }
};

// Export for global access
window.Modal = Modal;
