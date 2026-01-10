// Google Drive File Manager
// Configuration
const CONFIG = {
  FOLDER_ID: '19gVC6DY_uS_owDCaTEJu8kPzZteVgSKO',
  // For uploads, you'll need OAuth2 Client ID from Google Cloud Console
  // CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  SCOPES: 'https://www.googleapis.com/auth/drive.file',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
};

// Clear any old cached API key
localStorage.removeItem('gdrive_api_key');

// State
let state = {
  apiKey: 'AIzaSyCrsffkrc4GExZpiG1OMzRSMWcqp3u66Z8',
  accessToken: null,
  files: [],
  filteredFiles: [],
  currentView: 'grid',
  currentSort: 'name',
  currentPreviewIndex: -1,
  isLoading: false,
  selectedUploadFiles: [],
};

// DOM Elements
const elements = {
  // Views
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  emptyState: document.getElementById('empty-state'),
  filesGrid: document.getElementById('files-grid'),
  filesList: document.getElementById('files-list'),
  filesListBody: document.getElementById('files-list-body'),

  // Header
  searchInput: document.getElementById('search-input'),
  gridViewBtn: document.getElementById('grid-view-btn'),
  listViewBtn: document.getElementById('list-view-btn'),
  uploadBtn: document.getElementById('upload-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  sortSelect: document.getElementById('sort-select'),

  // Stats
  folderName: document.getElementById('folder-name'),
  fileCount: document.getElementById('file-count'),

  // Drop Zone
  dropZone: document.getElementById('drop-zone'),

  // Upload Modal
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
  emptyUploadBtn: document.getElementById('empty-upload-btn'),

  // Preview Modal
  previewModal: document.getElementById('preview-modal'),
  closePreview: document.getElementById('close-preview'),
  prevFile: document.getElementById('prev-file'),
  nextFile: document.getElementById('next-file'),
  previewIcon: document.getElementById('preview-icon'),
  previewFilename: document.getElementById('preview-filename'),
  previewMeta: document.getElementById('preview-meta'),
  previewDownload: document.getElementById('preview-download'),
  previewContent: document.getElementById('preview-content'),
  previewLoading: document.getElementById('preview-loading'),

  // Toast
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastMessage: document.getElementById('toast-message'),

  // API Key
  apiKeyNotice: document.getElementById('api-key-notice'),
  apiKeyInput: document.getElementById('api-key-input'),
  saveApiKey: document.getElementById('save-api-key'),

  // Error
  errorMessage: document.getElementById('error-message'),
};

// File Type Icons and Colors
const fileTypes = {
  'application/vnd.google-apps.document': { icon: 'fa-file-word', color: 'text-blue-400', name: 'Google Doc' },
  'application/vnd.google-apps.spreadsheet': { icon: 'fa-file-excel', color: 'text-green-400', name: 'Google Sheet' },
  'application/vnd.google-apps.presentation': { icon: 'fa-file-powerpoint', color: 'text-orange-400', name: 'Google Slides' },
  'application/vnd.google-apps.form': { icon: 'fa-poll', color: 'text-purple-400', name: 'Google Form' },
  'application/vnd.google-apps.folder': { icon: 'fa-folder', color: 'text-yellow-400', name: 'Folder' },
  'application/pdf': { icon: 'fa-file-pdf', color: 'text-red-400', name: 'PDF' },
  'application/zip': { icon: 'fa-file-archive', color: 'text-yellow-500', name: 'ZIP' },
  'application/x-rar-compressed': { icon: 'fa-file-archive', color: 'text-yellow-500', name: 'RAR' },
  'application/msword': { icon: 'fa-file-word', color: 'text-blue-500', name: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'fa-file-word', color: 'text-blue-500', name: 'Word' },
  'application/vnd.ms-excel': { icon: 'fa-file-excel', color: 'text-green-500', name: 'Excel' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'fa-file-excel', color: 'text-green-500', name: 'Excel' },
  'application/vnd.ms-powerpoint': { icon: 'fa-file-powerpoint', color: 'text-orange-500', name: 'PowerPoint' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'fa-file-powerpoint', color: 'text-orange-500', name: 'PowerPoint' },
  'text/plain': { icon: 'fa-file-alt', color: 'text-gray-400', name: 'Text' },
  'text/html': { icon: 'fa-file-code', color: 'text-orange-400', name: 'HTML' },
  'text/css': { icon: 'fa-file-code', color: 'text-blue-400', name: 'CSS' },
  'text/javascript': { icon: 'fa-file-code', color: 'text-yellow-400', name: 'JavaScript' },
  'application/json': { icon: 'fa-file-code', color: 'text-green-400', name: 'JSON' },
  'application/javascript': { icon: 'fa-file-code', color: 'text-yellow-400', name: 'JavaScript' },
  'video/mp4': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video' },
  'video/webm': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video' },
  'video/quicktime': { icon: 'fa-file-video', color: 'text-purple-400', name: 'Video' },
  'audio/mpeg': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio' },
  'audio/wav': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio' },
  'audio/ogg': { icon: 'fa-file-audio', color: 'text-pink-400', name: 'Audio' },
  'image/jpeg': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image' },
  'image/png': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image' },
  'image/gif': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image' },
  'image/webp': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'Image' },
  'image/svg+xml': { icon: 'fa-file-image', color: 'text-cyan-400', name: 'SVG' },
};

// Utility Functions
function getFileTypeInfo(mimeType) {
  return fileTypes[mimeType] || { icon: 'fa-file', color: 'text-gray-400', name: 'File' };
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return 'N/A';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showToast(message, type = 'success') {
  const icons = {
    success: 'fa-check-circle text-green-500',
    error: 'fa-exclamation-circle text-red-500',
    warning: 'fa-exclamation-triangle text-yellow-500',
    info: 'fa-info-circle text-blue-500',
  };

  elements.toastIcon.className = `fas ${icons[type]} text-xl`;
  elements.toastMessage.textContent = message;
  elements.toast.classList.remove('hidden');

  setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3000);
}

function showLoading() {
  state.isLoading = true;
  elements.loadingState.classList.remove('hidden');
  elements.errorState.classList.add('hidden');
  elements.emptyState.classList.add('hidden');
  elements.filesGrid.classList.add('hidden');
  elements.filesList.classList.add('hidden');

  // Generate skeleton cards
  let skeletons = '';
  for (let i = 0; i < 10; i++) {
    skeletons += `
      <div class="bg-gray-800 rounded-lg overflow-hidden">
        <div class="h-40 skeleton"></div>
        <div class="p-4">
          <div class="h-4 skeleton rounded mb-2"></div>
          <div class="h-3 skeleton rounded w-2/3"></div>
        </div>
      </div>
    `;
  }
  elements.loadingState.innerHTML = skeletons;
}

function showError(message) {
  state.isLoading = false;
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');
  elements.filesGrid.classList.add('hidden');
  elements.filesList.classList.add('hidden');
  elements.errorMessage.textContent = message;
}

function showEmpty() {
  state.isLoading = false;
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.emptyState.classList.remove('hidden');
  elements.filesGrid.classList.add('hidden');
  elements.filesList.classList.add('hidden');
}

function showFiles() {
  state.isLoading = false;
  elements.loadingState.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.emptyState.classList.add('hidden');

  if (state.currentView === 'grid') {
    elements.filesGrid.classList.remove('hidden');
    elements.filesList.classList.add('hidden');
  } else {
    elements.filesGrid.classList.add('hidden');
    elements.filesList.classList.remove('hidden');
  }
}

// API Functions
async function loadFiles() {
  if (!state.apiKey) {
    elements.apiKeyNotice.classList.remove('hidden');
    return;
  }

  showLoading();

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?` +
      `q='${CONFIG.FOLDER_ID}'+in+parents+and+trashed=false` +
      `&fields=files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink,iconLink)` +
      `&orderBy=name` +
      `&pageSize=1000` +
      `&key=${state.apiKey}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch files');
    }

    const data = await response.json();
    state.files = data.files || [];
    state.filteredFiles = [...state.files];

    // Get folder info
    const folderResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${CONFIG.FOLDER_ID}?` +
      `fields=name&key=${state.apiKey}`
    );

    if (folderResponse.ok) {
      const folderData = await folderResponse.json();
      elements.folderName.textContent = folderData.name || 'Drive Folder';
    }

    sortFiles();
    renderFiles();
    updateStats();

    if (state.filteredFiles.length === 0) {
      showEmpty();
    } else {
      showFiles();
    }

  } catch (error) {
    console.error('Error loading files:', error);
    showError(error.message);
  }
}

function sortFiles() {
  const sortBy = state.currentSort;

  state.filteredFiles.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'modified':
        return new Date(b.modifiedTime) - new Date(a.modifiedTime);
      case 'size':
        return (parseInt(b.size) || 0) - (parseInt(a.size) || 0);
      case 'type':
        return a.mimeType.localeCompare(b.mimeType);
      default:
        return 0;
    }
  });
}

function filterFiles(query) {
  if (!query) {
    state.filteredFiles = [...state.files];
  } else {
    const lowerQuery = query.toLowerCase();
    state.filteredFiles = state.files.filter(file =>
      file.name.toLowerCase().includes(lowerQuery)
    );
  }

  sortFiles();
  renderFiles();
  updateStats();

  if (state.filteredFiles.length === 0) {
    showEmpty();
  } else {
    showFiles();
  }
}

function updateStats() {
  elements.fileCount.textContent = `${state.filteredFiles.length} file${state.filteredFiles.length !== 1 ? 's' : ''}`;
}

// Render Functions
function renderFiles() {
  renderGridView();
  renderListView();
}

function renderGridView() {
  elements.filesGrid.innerHTML = state.filteredFiles.map((file, index) => {
    const typeInfo = getFileTypeInfo(file.mimeType);
    const isImage = file.mimeType.startsWith('image/');
    const thumbnail = file.thumbnailLink || null;

    return `
      <div class="file-card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
           data-index="${index}"
           onclick="openPreview(${index})">
        <div class="relative h-40 bg-gray-700 flex items-center justify-center overflow-hidden">
          ${thumbnail ?
            `<img src="${thumbnail}" alt="${file.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="absolute inset-0 items-center justify-center hidden">
               <i class="fas ${typeInfo.icon} text-5xl ${typeInfo.color}"></i>
             </div>` :
            `<i class="fas ${typeInfo.icon} text-5xl ${typeInfo.color}"></i>`
          }
          <div class="file-overlay absolute inset-0 bg-black/50 opacity-0 transition-opacity flex items-center justify-center gap-3">
            <button onclick="event.stopPropagation(); openPreview(${index})" class="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
              <i class="fas fa-eye"></i>
            </button>
            <a href="${getDownloadUrl(file)}" target="_blank" onclick="event.stopPropagation()" class="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
              <i class="fas fa-download"></i>
            </a>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-semibold truncate mb-1" title="${file.name}">${file.name}</h3>
          <div class="flex items-center justify-between text-sm text-gray-400">
            <span class="flex items-center gap-1">
              <i class="fas ${typeInfo.icon} ${typeInfo.color}"></i>
              ${typeInfo.name}
            </span>
            <span>${formatFileSize(file.size)}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">${formatDate(file.modifiedTime)}</p>
        </div>
      </div>
    `;
  }).join('');
}

function renderListView() {
  elements.filesListBody.innerHTML = state.filteredFiles.map((file, index) => {
    const typeInfo = getFileTypeInfo(file.mimeType);

    return `
      <tr class="border-t border-gray-700 hover:bg-gray-700/50 transition cursor-pointer" onclick="openPreview(${index})">
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <i class="fas ${typeInfo.icon} ${typeInfo.color} text-lg"></i>
            <span class="truncate max-w-xs" title="${file.name}">${file.name}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-gray-400 hidden md:table-cell">${typeInfo.name}</td>
        <td class="px-4 py-3 text-gray-400 hidden sm:table-cell">${formatFileSize(file.size)}</td>
        <td class="px-4 py-3 text-gray-400 hidden lg:table-cell">${formatDate(file.modifiedTime)}</td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-center gap-2">
            <button onclick="event.stopPropagation(); openPreview(${index})" class="p-2 hover:bg-gray-600 rounded transition" title="Preview">
              <i class="fas fa-eye"></i>
            </button>
            <a href="${getDownloadUrl(file)}" target="_blank" onclick="event.stopPropagation()" class="p-2 hover:bg-gray-600 rounded transition" title="Download">
              <i class="fas fa-download"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Download URL
function getDownloadUrl(file) {
  // For Google Docs/Sheets/Slides, use export links
  if (file.mimeType.startsWith('application/vnd.google-apps')) {
    const exportFormats = {
      'application/vnd.google-apps.document': 'application/pdf',
      'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.presentation': 'application/pdf',
    };
    const exportType = exportFormats[file.mimeType];
    if (exportType) {
      return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(exportType)}&key=${state.apiKey}`;
    }
    return file.webViewLink || '#';
  }

  // For regular files, use direct download
  return `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${state.apiKey}`;
}

// Preview Functions
function openPreview(index) {
  state.currentPreviewIndex = index;
  const file = state.filteredFiles[index];
  const typeInfo = getFileTypeInfo(file.mimeType);

  elements.previewIcon.className = `fas ${typeInfo.icon} text-2xl ${typeInfo.color}`;
  elements.previewFilename.textContent = file.name;
  elements.previewMeta.textContent = `${formatFileSize(file.size)} • ${formatDate(file.modifiedTime)}`;
  elements.previewDownload.href = getDownloadUrl(file);

  // Update navigation buttons
  elements.prevFile.style.display = index > 0 ? 'block' : 'none';
  elements.nextFile.style.display = index < state.filteredFiles.length - 1 ? 'block' : 'none';

  // Load preview content
  loadPreviewContent(file);

  elements.previewModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function loadPreviewContent(file) {
  elements.previewLoading.classList.remove('hidden');

  let content = '';
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isPdf = file.mimeType === 'application/pdf';
  const isGoogleDoc = file.mimeType.startsWith('application/vnd.google-apps');

  if (isImage) {
    // Direct image preview
    const imgUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${state.apiKey}`;
    content = `<img src="${imgUrl}" alt="${file.name}" class="max-w-full max-h-full object-contain mx-auto" onload="document.getElementById('preview-loading').classList.add('hidden')" onerror="showPreviewError()">`;
  } else if (isVideo) {
    content = `
      <video controls class="max-w-full max-h-full mx-auto" onloadeddata="document.getElementById('preview-loading').classList.add('hidden')">
        <source src="https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${state.apiKey}" type="${file.mimeType}">
        Your browser does not support video playback.
      </video>
    `;
  } else if (isAudio) {
    content = `
      <div class="flex flex-col items-center justify-center h-full">
        <i class="fas fa-file-audio text-8xl text-pink-400 mb-8"></i>
        <audio controls class="w-full max-w-md" onloadeddata="document.getElementById('preview-loading').classList.add('hidden')">
          <source src="https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${state.apiKey}" type="${file.mimeType}">
          Your browser does not support audio playback.
        </audio>
      </div>
    `;
  } else if (isPdf || isGoogleDoc) {
    // Use Google Drive preview iframe
    const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`;
    content = `<iframe src="${previewUrl}" class="w-full h-full" frameborder="0" allowfullscreen onload="document.getElementById('preview-loading').classList.add('hidden')"></iframe>`;
  } else {
    // Fallback - show file info
    const typeInfo = getFileTypeInfo(file.mimeType);
    content = `
      <div class="flex flex-col items-center justify-center h-full text-center">
        <i class="fas ${typeInfo.icon} text-8xl ${typeInfo.color} mb-6"></i>
        <h3 class="text-xl font-bold mb-2">${file.name}</h3>
        <p class="text-gray-400 mb-6">Preview not available for this file type</p>
        <a href="${getDownloadUrl(file)}" target="_blank" class="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">
          <i class="fas fa-download mr-2"></i>Download File
        </a>
      </div>
    `;
    elements.previewLoading.classList.add('hidden');
  }

  // Keep loading indicator, add content
  const existingIframe = elements.previewContent.querySelector('iframe, img, video, audio, div:not(#preview-loading)');
  if (existingIframe) existingIframe.remove();
  elements.previewContent.insertAdjacentHTML('beforeend', content);
}

function showPreviewError() {
  elements.previewLoading.classList.add('hidden');
  const errorContent = `
    <div class="flex flex-col items-center justify-center h-full text-center">
      <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
      <p class="text-gray-400">Failed to load preview</p>
    </div>
  `;
  elements.previewContent.innerHTML = errorContent;
}

function closePreview() {
  elements.previewModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.currentPreviewIndex = -1;

  // Clear preview content
  const existingContent = elements.previewContent.querySelector('iframe, img, video, audio, div:not(#preview-loading)');
  if (existingContent) existingContent.remove();
}

function navigatePreview(direction) {
  const newIndex = state.currentPreviewIndex + direction;
  if (newIndex >= 0 && newIndex < state.filteredFiles.length) {
    openPreview(newIndex);
  }
}

// Upload Functions
function openUploadModal() {
  state.selectedUploadFiles = [];
  updateSelectedFiles();
  elements.uploadProgress.classList.add('hidden');
  elements.uploadModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  elements.uploadModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.selectedUploadFiles = [];
}

function updateSelectedFiles() {
  if (state.selectedUploadFiles.length === 0) {
    elements.selectedFiles.classList.add('hidden');
    elements.startUpload.disabled = true;
    return;
  }

  elements.selectedFiles.classList.remove('hidden');
  elements.startUpload.disabled = false;

  elements.selectedFilesList.innerHTML = state.selectedUploadFiles.map((file, index) => `
    <div class="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
      <div class="flex items-center gap-2 min-w-0">
        <i class="fas fa-file text-gray-400"></i>
        <span class="truncate">${file.name}</span>
        <span class="text-gray-500 text-sm">(${formatFileSize(file.size)})</span>
      </div>
      <button onclick="removeSelectedFile(${index})" class="text-gray-400 hover:text-red-400 transition">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

function removeSelectedFile(index) {
  state.selectedUploadFiles.splice(index, 1);
  updateSelectedFiles();
}

function handleFileSelect(files) {
  state.selectedUploadFiles = [...state.selectedUploadFiles, ...Array.from(files)];
  updateSelectedFiles();
}

async function uploadFiles() {
  if (state.selectedUploadFiles.length === 0) return;

  // Check if we have access token
  if (!state.accessToken) {
    showToast('Please sign in with Google to upload files', 'warning');
    // For now, show a message that upload requires OAuth
    showToast('Upload requires Google OAuth authentication. See console for details.', 'info');
    console.log('To enable uploads, you need to set up OAuth2:');
    console.log('1. Go to Google Cloud Console');
    console.log('2. Enable Google Drive API');
    console.log('3. Create OAuth 2.0 Client ID for Web Application');
    console.log('4. Add your domain to authorized origins');
    console.log('5. Update CONFIG.CLIENT_ID in this file');
    return;
  }

  elements.uploadProgress.classList.remove('hidden');
  elements.startUpload.disabled = true;

  const totalFiles = state.selectedUploadFiles.length;
  let uploadedFiles = 0;

  for (const file of state.selectedUploadFiles) {
    try {
      elements.uploadStatus.textContent = `Uploading ${file.name}...`;

      // Create metadata
      const metadata = {
        name: file.name,
        parents: [CONFIG.FOLDER_ID]
      };

      // Create form data
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.accessToken}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      uploadedFiles++;
      const progress = Math.round((uploadedFiles / totalFiles) * 100);
      elements.uploadProgressBar.style.width = `${progress}%`;
      elements.uploadPercentage.textContent = `${progress}%`;

    } catch (error) {
      console.error('Upload error:', error);
      showToast(`Failed to upload ${file.name}`, 'error');
    }
  }

  elements.uploadStatus.textContent = 'Upload complete!';
  showToast(`Successfully uploaded ${uploadedFiles} file(s)`, 'success');

  // Refresh file list
  setTimeout(() => {
    closeUploadModal();
    loadFiles();
  }, 1000);
}

// View Toggle
function setView(view) {
  state.currentView = view;

  if (view === 'grid') {
    elements.gridViewBtn.classList.add('bg-yellow-500', 'text-gray-900');
    elements.gridViewBtn.classList.remove('text-gray-300');
    elements.listViewBtn.classList.remove('bg-yellow-500', 'text-gray-900');
    elements.listViewBtn.classList.add('text-gray-300');
  } else {
    elements.listViewBtn.classList.add('bg-yellow-500', 'text-gray-900');
    elements.listViewBtn.classList.remove('text-gray-300');
    elements.gridViewBtn.classList.remove('bg-yellow-500', 'text-gray-900');
    elements.gridViewBtn.classList.add('text-gray-300');
  }

  if (state.filteredFiles.length > 0) {
    showFiles();
  }
}

// Event Listeners
function initEventListeners() {
  // View toggle
  elements.gridViewBtn.addEventListener('click', () => setView('grid'));
  elements.listViewBtn.addEventListener('click', () => setView('list'));

  // Search
  let searchTimeout;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterFiles(e.target.value);
    }, 300);
  });

  // Sort
  elements.sortSelect.addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    sortFiles();
    renderFiles();
  });

  // Upload button
  elements.uploadBtn.addEventListener('click', openUploadModal);
  elements.emptyUploadBtn?.addEventListener('click', openUploadModal);

  // Close upload modal
  elements.closeUploadModal.addEventListener('click', closeUploadModal);
  elements.cancelUpload.addEventListener('click', closeUploadModal);

  // Upload drop zone
  elements.uploadDropZone.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files));

  elements.uploadDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadDropZone.classList.add('drag-over');
  });

  elements.uploadDropZone.addEventListener('dragleave', () => {
    elements.uploadDropZone.classList.remove('drag-over');
  });

  elements.uploadDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadDropZone.classList.remove('drag-over');
    handleFileSelect(e.dataTransfer.files);
  });

  // Start upload
  elements.startUpload.addEventListener('click', uploadFiles);

  // Refresh
  elements.refreshBtn.addEventListener('click', () => {
    elements.refreshBtn.querySelector('i').classList.add('fa-spin');
    loadFiles().finally(() => {
      elements.refreshBtn.querySelector('i').classList.remove('fa-spin');
    });
  });

  // Preview modal
  elements.closePreview.addEventListener('click', closePreview);
  elements.prevFile.addEventListener('click', () => navigatePreview(-1));
  elements.nextFile.addEventListener('click', () => navigatePreview(1));

  // Close preview on backdrop click
  elements.previewModal.addEventListener('click', (e) => {
    if (e.target === elements.previewModal) {
      closePreview();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!elements.previewModal.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        closePreview();
      } else if (e.key === 'ArrowLeft') {
        navigatePreview(-1);
      } else if (e.key === 'ArrowRight') {
        navigatePreview(1);
      }
    }

    // Close upload modal on Escape
    if (e.key === 'Escape' && !elements.uploadModal.classList.contains('hidden')) {
      closeUploadModal();
    }
  });

  // Global drag and drop
  let dragCounter = 0;

  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    elements.dropZone.classList.remove('hidden');
  });

  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      elements.dropZone.classList.add('hidden');
    }
  });

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    elements.dropZone.classList.add('hidden');

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      openUploadModal();
    }
  });

  // API Key
  elements.saveApiKey.addEventListener('click', () => {
    const apiKey = elements.apiKeyInput.value.trim();
    if (apiKey) {
      state.apiKey = apiKey;
      localStorage.setItem('gdrive_api_key', apiKey);
      elements.apiKeyNotice.classList.add('hidden');
      loadFiles();
    }
  });

  elements.apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      elements.saveApiKey.click();
    }
  });
}

// Initialize
function init() {
  initEventListeners();

  if (state.apiKey) {
    loadFiles();
  } else {
    elements.apiKeyNotice.classList.remove('hidden');
  }
}

// Start the app
init();
