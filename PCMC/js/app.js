/**
 * PCMC Main Application Module
 * Initializes and coordinates all app modules
 */

const App = {
  // Application state
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
    Upload.init();

    // Set initial view mode from saved settings
    this.viewMode = Config.getSetting('viewMode') || 'grid';
    this.sortBy = Config.getSetting('sortBy') || 'name';

    // Bind events
    this.bindEvents();

    // Set initial UI state
    UI.setViewMode(this.viewMode);
    if (UI.elements.sortSelect) {
      UI.elements.sortSelect.value = this.sortBy;
    }

    // Load files
    await this.loadFiles();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // View mode toggle
    UI.elements.gridViewBtn?.addEventListener('click', () => this.setViewMode('grid'));
    UI.elements.listViewBtn?.addEventListener('click', () => this.setViewMode('list'));

    // Search input with debounce
    let searchTimeout;
    UI.elements.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value.trim();
        this.filterAndRender();
      }, 300);
    });

    // Sort select
    UI.elements.sortSelect?.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      Config.setSetting('sortBy', this.sortBy);
      this.filterAndRender();
    });

    // Refresh button
    UI.elements.refreshBtn?.addEventListener('click', () => this.refresh());

    // Retry button (in error state)
    document.getElementById('retry-btn')?.addEventListener('click', () => this.loadFiles());
  },

  /**
   * Load files from Google Drive
   */
  async loadFiles() {
    UI.showLoading();

    try {
      // Fetch files and folder info
      const [files, folderInfo] = await Promise.all([
        DriveAPI.fetchFiles(),
        DriveAPI.fetchFolderInfo()
      ]);

      this.files = files;
      this.filteredFiles = [...files];

      // Update header info
      UI.updateFolderInfo(folderInfo.name, files.length);

      // Apply filters and render
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
   * @param {string} mode - 'grid' or 'list'
   */
  setViewMode(mode) {
    this.viewMode = mode;
    Config.setSetting('viewMode', mode);
    UI.setViewMode(mode);
    this.render();
  },

  /**
   * Filter and sort files, then render
   */
  filterAndRender() {
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredFiles = this.files.filter(file =>
        file.name.toLowerCase().includes(query)
      );
    } else {
      this.filteredFiles = [...this.files];
    }

    // Apply sorting
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

    // Update modal files reference
    Modal.setFiles(this.filteredFiles);

    // Update file count
    if (UI.elements.fileCount) {
      UI.elements.fileCount.textContent = `${this.filteredFiles.length} file${this.filteredFiles.length !== 1 ? 's' : ''}`;
    }

    // Render
    this.render();
  },

  /**
   * Render files in current view mode
   */
  render() {
    if (this.filteredFiles.length === 0) {
      UI.showEmpty();
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

// Export for global access
window.App = App;
