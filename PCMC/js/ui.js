/**
 * PCMC UI Module
 * Handles DOM manipulation, rendering, and user interface updates
 */

const UI = {
  // Cached DOM elements
  elements: {},

  /**
   * Initialize UI by caching DOM elements
   */
  init() {
    this.elements = {
      // Main containers
      loadingState: document.getElementById('loading-state'),
      errorState: document.getElementById('error-state'),
      emptyState: document.getElementById('empty-state'),
      filesGrid: document.getElementById('files-grid'),
      filesList: document.getElementById('files-list'),
      filesListBody: document.getElementById('files-list-body'),

      // Header elements
      folderName: document.getElementById('folder-name'),
      fileCount: document.getElementById('file-count'),
      searchInput: document.getElementById('search-input'),
      sortSelect: document.getElementById('sort-select'),
      gridViewBtn: document.getElementById('grid-view-btn'),
      listViewBtn: document.getElementById('list-view-btn'),
      uploadBtn: document.getElementById('upload-btn'),
      refreshBtn: document.getElementById('refresh-btn'),

      // Other
      dropZone: document.getElementById('drop-zone'),
      errorMessage: document.getElementById('error-message'),

      // Toast notification
      toast: document.getElementById('toast'),
      toastIcon: document.getElementById('toast-icon'),
      toastMessage: document.getElementById('toast-message')
    };
  },

  /**
   * Show loading state with skeleton cards
   */
  showLoading() {
    this.hideAll();
    this.elements.loadingState.classList.remove('hidden');

    // Generate skeleton cards
    let skeletons = '';
    for (let i = 0; i < 8; i++) {
      skeletons += `
        <div class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50 animate-pulse">
          <div class="h-36 bg-gray-700/50"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-700/50 rounded w-3/4"></div>
            <div class="h-3 bg-gray-700/50 rounded w-1/2"></div>
          </div>
        </div>
      `;
    }
    this.elements.loadingState.innerHTML = skeletons;
  },

  /**
   * Show error state with message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.hideAll();
    this.elements.errorState.classList.remove('hidden');
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
    }
  },

  /**
   * Show empty state
   */
  showEmpty() {
    this.hideAll();
    this.elements.emptyState.classList.remove('hidden');
  },

  /**
   * Show files in current view mode
   * @param {string} viewMode - 'grid' or 'list'
   */
  showFiles(viewMode) {
    this.hideAll();
    if (viewMode === 'grid') {
      this.elements.filesGrid.classList.remove('hidden');
    } else {
      this.elements.filesList.classList.remove('hidden');
    }
  },

  /**
   * Hide all state containers
   */
  hideAll() {
    const containers = [
      this.elements.loadingState,
      this.elements.errorState,
      this.elements.emptyState,
      this.elements.filesGrid,
      this.elements.filesList
    ];

    containers.forEach(el => {
      if (el) el.classList.add('hidden');
    });
  },

  /**
   * Update folder info in header
   * @param {string} name - Folder name
   * @param {number} count - File count
   */
  updateFolderInfo(name, count) {
    if (this.elements.folderName) {
      this.elements.folderName.textContent = name || 'PCMC Files';
    }
    if (this.elements.fileCount) {
      this.elements.fileCount.textContent = `${count} file${count !== 1 ? 's' : ''}`;
    }
  },

  /**
   * Set active view mode
   * @param {string} mode - 'grid' or 'list'
   */
  setViewMode(mode) {
    const { gridViewBtn, listViewBtn } = this.elements;

    if (mode === 'grid') {
      gridViewBtn?.classList.add('bg-blue-600', 'text-white');
      gridViewBtn?.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-gray-700');
      listViewBtn?.classList.remove('bg-blue-600', 'text-white');
      listViewBtn?.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-gray-700');
    } else {
      listViewBtn?.classList.add('bg-blue-600', 'text-white');
      listViewBtn?.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-gray-700');
      gridViewBtn?.classList.remove('bg-blue-600', 'text-white');
      gridViewBtn?.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-gray-700');
    }
  },

  /**
   * Render files in grid view
   * @param {Array} files - Array of file objects
   */
  renderGrid(files) {
    if (!this.elements.filesGrid) return;

    this.elements.filesGrid.innerHTML = files.map((file, index) => {
      const typeInfo = getFileTypeInfo(file.mimeType);
      const thumbnail = file.thumbnailLink;
      const downloadUrl = DriveAPI.getDownloadUrl(file);

      return `
        <div class="file-card group bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50
                    hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
             data-index="${index}" onclick="Modal.open(${index})">

          <!-- Thumbnail area -->
          <div class="relative h-36 bg-gray-700/30 flex items-center justify-center overflow-hidden">
            ${thumbnail ? `
              <img src="${thumbnail}" alt="${this.escapeHtml(file.name)}"
                   class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                   onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">
              <div class="hidden absolute inset-0 flex items-center justify-center ${typeInfo.bg}">
                <i class="fas ${typeInfo.icon} text-4xl ${typeInfo.color}"></i>
              </div>
            ` : `
              <div class="flex items-center justify-center ${typeInfo.bg} w-full h-full">
                <i class="fas ${typeInfo.icon} text-4xl ${typeInfo.color}"></i>
              </div>
            `}

            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                        flex items-center justify-center gap-2">
              <button onclick="event.stopPropagation(); Modal.open(${index})"
                      class="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
                      title="Preview">
                <i class="fas fa-eye text-white"></i>
              </button>
              <a href="${downloadUrl}" target="_blank" onclick="event.stopPropagation()"
                 class="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
                 title="Download">
                <i class="fas fa-download text-white"></i>
              </a>
            </div>
          </div>

          <!-- File info -->
          <div class="p-3">
            <h3 class="font-medium text-white text-sm truncate mb-1" title="${this.escapeHtml(file.name)}">
              ${this.escapeHtml(file.name)}
            </h3>
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-1 ${typeInfo.color}">
                <i class="fas ${typeInfo.icon}"></i>
                <span class="text-gray-400">${typeInfo.name}</span>
              </span>
              <span class="text-gray-500">${this.formatSize(file.size)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render files in list view
   * @param {Array} files - Array of file objects
   */
  renderList(files) {
    if (!this.elements.filesListBody) return;

    this.elements.filesListBody.innerHTML = files.map((file, index) => {
      const typeInfo = getFileTypeInfo(file.mimeType);
      const downloadUrl = DriveAPI.getDownloadUrl(file);

      return `
        <tr class="border-t border-gray-700/50 hover:bg-gray-700/30 transition cursor-pointer group"
            onclick="Modal.open(${index})">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg ${typeInfo.bg} flex items-center justify-center flex-shrink-0">
                <i class="fas ${typeInfo.icon} ${typeInfo.color} text-sm"></i>
              </div>
              <span class="truncate font-medium text-sm" title="${this.escapeHtml(file.name)}">
                ${this.escapeHtml(file.name)}
              </span>
            </div>
          </td>
          <td class="px-4 py-3 hidden md:table-cell">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${typeInfo.bg} ${typeInfo.color}">
              ${typeInfo.name}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">
            ${this.formatSize(file.size)}
          </td>
          <td class="px-4 py-3 text-gray-400 text-sm hidden lg:table-cell">
            ${this.formatDate(file.modifiedTime)}
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
              <button onclick="event.stopPropagation(); Modal.open(${index})"
                      class="p-1.5 hover:bg-gray-600 rounded transition" title="Preview">
                <i class="fas fa-eye text-gray-400 text-sm"></i>
              </button>
              <a href="${downloadUrl}" target="_blank" onclick="event.stopPropagation()"
                 class="p-1.5 hover:bg-gray-600 rounded transition" title="Download">
                <i class="fas fa-download text-gray-400 text-sm"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Show toast notification
   * @param {string} message - Message to display
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
  },

  /**
   * Show/hide drop zone
   * @param {boolean} show - Whether to show
   */
  showDropZone(show) {
    if (!this.elements.dropZone) return;

    if (show) {
      this.elements.dropZone.classList.remove('hidden');
      this.elements.dropZone.classList.add('flex');
    } else {
      this.elements.dropZone.classList.add('hidden');
      this.elements.dropZone.classList.remove('flex');
    }
  },

  /**
   * Set refresh button spinning state
   * @param {boolean} spinning - Whether spinning
   */
  setRefreshing(spinning) {
    const icon = this.elements.refreshBtn?.querySelector('i');
    if (icon) {
      if (spinning) {
        icon.classList.add('fa-spin');
      } else {
        icon.classList.remove('fa-spin');
      }
    }
  },

  /**
   * Format file size to human readable
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    if (!bytes || bytes === 0) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Format date to relative time or date string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return '—';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return mins < 1 ? 'Just now' : `${mins}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  },

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Export for global access
window.UI = UI;
