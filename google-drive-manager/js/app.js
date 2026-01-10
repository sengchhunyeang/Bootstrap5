/**
 * Main Application Module
 * Initializes the app and handles global events
 */

const App = {
  // State
  files: [],
  filteredFiles: [],
  viewMode: 'grid',
  sortBy: 'name',
  searchQuery: '',

  /**
   * Initialize the application
   */
  async init() {
    // Initialize modules
    UI.init();
    Modal.init();

    // Bind events
    this.bindEvents();

    // Check API key
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
      UI.showError('Please set your Google API Key in js/config.js');
      return;
    }

    // Load files
    await this.loadFiles();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // View toggle
    UI.elements.gridViewBtn?.addEventListener('click', () => this.setViewMode('grid'));
    UI.elements.listViewBtn?.addEventListener('click', () => this.setViewMode('list'));

    // Search
    let searchTimeout;
    UI.elements.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value;
        this.filterAndRender();
      }, 300);
    });

    // Sort
    UI.elements.sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.filterAndRender();
    });

    // Refresh
    UI.elements.refreshBtn?.addEventListener('click', () => this.refresh());

    // Upload button
    UI.elements.uploadBtn?.addEventListener('click', () => Modal.openUpload());
    document.getElementById('empty-upload-btn')?.addEventListener('click', () => Modal.openUpload());

    // Global drag and drop
    this.initDragAndDrop();

    // Retry button
    document.getElementById('retry-btn')?.addEventListener('click', () => this.loadFiles());
  },

  /**
   * Initialize drag and drop
   */
  initDragAndDrop() {
    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      UI.showDropZone(true);
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        UI.showDropZone(false);
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      UI.showDropZone(false);

      if (e.dataTransfer.files.length > 0) {
        Modal.handleFileSelect(e.dataTransfer.files);
        Modal.openUpload();
      }
    });
  },

  /**
   * Load files from Google Drive
   */
  async loadFiles() {
    UI.showLoading();

    try {
      // Fetch files and folder info in parallel
      const [files, folderInfo] = await Promise.all([
        DriveAPI.fetchFiles(),
        DriveAPI.fetchFolderInfo()
      ]);

      this.files = files;
      this.filteredFiles = [...files];

      // Calculate total size
      const totalSize = files.reduce((sum, file) => sum + (parseInt(file.size) || 0), 0);

      // Update UI
      UI.updateFolderInfo(folderInfo.name, files.length, totalSize);

      // Filter, sort, and render
      this.filterAndRender();

      // Set files for modal navigation
      Modal.setFiles(this.filteredFiles);

    } catch (error) {
      console.error('Error loading files:', error);
      UI.showError(error.message);
    }
  },

  /**
   * Refresh files
   */
  async refresh() {
    UI.setRefreshing(true);
    await this.loadFiles();
    UI.setRefreshing(false);
    UI.showToast('Files refreshed', 'success');
  },

  /**
   * Set view mode
   * @param {string} mode 'grid' or 'list'
   */
  setViewMode(mode) {
    this.viewMode = mode;
    UI.setViewMode(mode);
    this.render();
  },

  /**
   * Filter and sort files, then render
   */
  filterAndRender() {
    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredFiles = this.files.filter(file =>
        file.name.toLowerCase().includes(query)
      );
    } else {
      this.filteredFiles = [...this.files];
    }

    // Sort
    this.filteredFiles.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'modified':
          return new Date(b.modifiedTime) - new Date(a.modifiedTime);
        case 'modified-asc':
          return new Date(a.modifiedTime) - new Date(b.modifiedTime);
        case 'size':
          return (parseInt(b.size) || 0) - (parseInt(a.size) || 0);
        case 'size-asc':
          return (parseInt(a.size) || 0) - (parseInt(b.size) || 0);
        case 'type':
          return a.mimeType.localeCompare(b.mimeType);
        default:
          return 0;
      }
    });

    // Update modal files
    Modal.setFiles(this.filteredFiles);

    // Update count
    UI.elements.fileCount.textContent = `${this.filteredFiles.length} file${this.filteredFiles.length !== 1 ? 's' : ''}`;

    // Render
    this.render();
  },

  /**
   * Render files in current view mode
   */
  render() {
    if (this.filteredFiles.length === 0) {
      if (this.searchQuery) {
        UI.showEmpty();
      } else if (this.files.length === 0) {
        UI.showEmpty();
      } else {
        UI.showEmpty();
      }
      return;
    }

    if (this.viewMode === 'grid') {
      UI.renderGrid(this.filteredFiles);
    } else {
      UI.renderList(this.filteredFiles);
    }

    UI.showFiles(this.viewMode);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export
window.App = App;
