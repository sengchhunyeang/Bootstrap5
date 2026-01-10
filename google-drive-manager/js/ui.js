/**
 * UI Module
 * Handles all DOM manipulation and rendering
 */

const UI = {
  // DOM element cache
  elements: {},

  /**
   * Initialize DOM element references
   */
  init() {
    this.elements = {
      // Containers
      loadingState: document.getElementById('loading-state'),
      errorState: document.getElementById('error-state'),
      emptyState: document.getElementById('empty-state'),
      filesGrid: document.getElementById('files-grid'),
      filesList: document.getElementById('files-list'),
      filesListBody: document.getElementById('files-list-body'),

      // Header controls
      searchInput: document.getElementById('search-input'),
      gridViewBtn: document.getElementById('grid-view-btn'),
      listViewBtn: document.getElementById('list-view-btn'),
      uploadBtn: document.getElementById('upload-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
      sortSelect: document.getElementById('sort-select'),

      // Stats
      folderName: document.getElementById('folder-name'),
      fileCount: document.getElementById('file-count'),
      totalSize: document.getElementById('total-size'),

      // Drop zone
      dropZone: document.getElementById('drop-zone'),

      // Toast
      toast: document.getElementById('toast'),
      toastIcon: document.getElementById('toast-icon'),
      toastMessage: document.getElementById('toast-message'),

      // Error
      errorMessage: document.getElementById('error-message'),
    };
  },

  /**
   * Show loading state with skeleton cards
   */
  showLoading() {
    this.hideAll();
    this.elements.loadingState.classList.remove('hidden');

    let skeletons = '';
    for (let i = 0; i < 8; i++) {
      skeletons += `
        <div class="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
          <div class="h-40 bg-gray-700"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      `;
    }
    this.elements.loadingState.innerHTML = skeletons;
  },

  /**
   * Show error state
   * @param {string} message Error message
   */
  showError(message) {
    this.hideAll();
    this.elements.errorState.classList.remove('hidden');
    this.elements.errorMessage.textContent = message;
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
   * @param {string} viewMode 'grid' or 'list'
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
    this.elements.loadingState.classList.add('hidden');
    this.elements.errorState.classList.add('hidden');
    this.elements.emptyState.classList.add('hidden');
    this.elements.filesGrid.classList.add('hidden');
    this.elements.filesList.classList.add('hidden');
  },

  /**
   * Update folder info display
   * @param {string} name Folder name
   * @param {number} fileCount Number of files
   * @param {number} totalSize Total size in bytes
   */
  updateFolderInfo(name, fileCount, totalSize) {
    this.elements.folderName.textContent = name || 'Drive Folder';
    this.elements.fileCount.textContent = `${fileCount} file${fileCount !== 1 ? 's' : ''}`;
    if (this.elements.totalSize) {
      this.elements.totalSize.textContent = this.formatSize(totalSize);
    }
  },

  /**
   * Set active view mode button
   * @param {string} viewMode 'grid' or 'list'
   */
  setViewMode(viewMode) {
    const { gridViewBtn, listViewBtn } = this.elements;

    if (viewMode === 'grid') {
      gridViewBtn.classList.add('bg-yellow-500', 'text-gray-900');
      gridViewBtn.classList.remove('text-gray-400', 'hover:text-white');
      listViewBtn.classList.remove('bg-yellow-500', 'text-gray-900');
      listViewBtn.classList.add('text-gray-400', 'hover:text-white');
    } else {
      listViewBtn.classList.add('bg-yellow-500', 'text-gray-900');
      listViewBtn.classList.remove('text-gray-400', 'hover:text-white');
      gridViewBtn.classList.remove('bg-yellow-500', 'text-gray-900');
      gridViewBtn.classList.add('text-gray-400', 'hover:text-white');
    }
  },

  /**
   * Render files in grid view
   * @param {Array} files Array of file objects
   */
  renderGrid(files) {
    this.elements.filesGrid.innerHTML = files.map((file, index) => {
      const typeInfo = getFileTypeInfo(file.mimeType);
      const thumbnail = file.thumbnailLink;
      const downloadUrl = DriveAPI.getDownloadUrl(file);

      return `
        <div class="file-card group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl
                    transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-700 hover:border-gray-600"
             data-index="${index}" onclick="Modal.open(${index})">

          <!-- Thumbnail -->
          <div class="relative h-40 bg-gray-700/50 flex items-center justify-center overflow-hidden">
            ${thumbnail ? `
              <img src="${thumbnail}" alt="${file.name}"
                   class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="absolute inset-0 items-center justify-center hidden ${typeInfo.bg}">
                <i class="fas ${typeInfo.icon} text-5xl ${typeInfo.color}"></i>
              </div>
            ` : `
              <div class="flex items-center justify-center ${typeInfo.bg} w-full h-full">
                <i class="fas ${typeInfo.icon} text-5xl ${typeInfo.color}"></i>
              </div>
            `}

            <!-- Overlay actions -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                        flex items-center justify-center gap-3">
              <button onclick="event.stopPropagation(); Modal.open(${index})"
                      class="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition"
                      title="Preview">
                <i class="fas fa-eye text-white"></i>
              </button>
              <a href="${downloadUrl}" target="_blank" onclick="event.stopPropagation()"
                 class="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition"
                 title="Download">
                <i class="fas fa-download text-white"></i>
              </a>
            </div>
          </div>

          <!-- File info -->
          <div class="p-4">
            <h3 class="font-medium text-white truncate mb-2" title="${file.name}">${file.name}</h3>
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-1.5 ${typeInfo.color}">
                <i class="fas ${typeInfo.icon} text-xs"></i>
                <span class="text-gray-400">${typeInfo.name}</span>
              </span>
              <span class="text-gray-500">${this.formatSize(file.size)}</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">${this.formatDate(file.modifiedTime)}</p>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render files in list view
   * @param {Array} files Array of file objects
   */
  renderList(files) {
    this.elements.filesListBody.innerHTML = files.map((file, index) => {
      const typeInfo = getFileTypeInfo(file.mimeType);
      const downloadUrl = DriveAPI.getDownloadUrl(file);

      return `
        <tr class="border-t border-gray-700/50 hover:bg-gray-700/30 transition cursor-pointer group"
            onclick="Modal.open(${index})">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg ${typeInfo.bg} flex items-center justify-center flex-shrink-0">
                <i class="fas ${typeInfo.icon} ${typeInfo.color}"></i>
              </div>
              <span class="truncate font-medium" title="${file.name}">${file.name}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-gray-400 hidden md:table-cell">
            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${typeInfo.bg} ${typeInfo.color}">
              ${typeInfo.name}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-400 hidden sm:table-cell">${this.formatSize(file.size)}</td>
          <td class="px-4 py-3 text-gray-400 hidden lg:table-cell">${this.formatDate(file.modifiedTime)}</td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
              <button onclick="event.stopPropagation(); Modal.open(${index})"
                      class="p-2 hover:bg-gray-600 rounded-lg transition" title="Preview">
                <i class="fas fa-eye text-gray-400"></i>
              </button>
              <a href="${downloadUrl}" target="_blank" onclick="event.stopPropagation()"
                 class="p-2 hover:bg-gray-600 rounded-lg transition" title="Download">
                <i class="fas fa-download text-gray-400"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Show toast notification
   * @param {string} message Message to display
   * @param {string} type 'success' | 'error' | 'warning' | 'info'
   */
  showToast(message, type = 'success') {
    const icons = {
      success: 'fa-check-circle text-green-400',
      error: 'fa-exclamation-circle text-red-400',
      warning: 'fa-exclamation-triangle text-yellow-400',
      info: 'fa-info-circle text-blue-400',
    };

    const bgColors = {
      success: 'border-green-500/30',
      error: 'border-red-500/30',
      warning: 'border-yellow-500/30',
      info: 'border-blue-500/30',
    };

    this.elements.toastIcon.className = `fas ${icons[type]} text-xl`;
    this.elements.toastMessage.textContent = message;
    this.elements.toast.className = `fixed bottom-4 right-4 z-50 bg-gray-800 border ${bgColors[type]} rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm transform transition-all duration-300`;

    // Animate in
    this.elements.toast.classList.remove('translate-y-full', 'opacity-0');

    // Auto hide after 3 seconds
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.elements.toast.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
  },

  /**
   * Show/hide global drop zone
   * @param {boolean} show
   */
  showDropZone(show) {
    if (show) {
      this.elements.dropZone.classList.remove('hidden');
      this.elements.dropZone.classList.add('flex');
    } else {
      this.elements.dropZone.classList.add('hidden');
      this.elements.dropZone.classList.remove('flex');
    }
  },

  /**
   * Set refresh button spinning
   * @param {boolean} spinning
   */
  setRefreshing(spinning) {
    const icon = this.elements.refreshBtn.querySelector('i');
    if (spinning) {
      icon.classList.add('fa-spin');
    } else {
      icon.classList.remove('fa-spin');
    }
  },

  /**
   * Format file size
   * @param {number} bytes
   * @returns {string}
   */
  formatSize(bytes) {
    if (!bytes || bytes === 0) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Format date
   * @param {string} dateString
   * @returns {string}
   */
  formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 24 hours ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const mins = Math.floor(diff / 60000);
        return mins < 1 ? 'Just now' : `${mins}m ago`;
      }
      return `${hours}h ago`;
    }

    // Less than 7 days ago
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Export
window.UI = UI;
