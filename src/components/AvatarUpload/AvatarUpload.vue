<template>
  <div class="avatar-upload">
    <!-- Drag & Drop Zone -->
    <div ref="dropZone" class="drop-zone" :class="{ 'drag-over': isDragOver, 'has-image': selectedFile }"
      @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop"
      @click="triggerFileInput">
      <div v-if="!selectedFile" class="drop-zone-content">
        <div class="drop-zone-icon">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p class="drop-zone-text">Drag & drop an image here, or click to select</p>
        <p class="drop-zone-hint">Supports JPG, PNG, GIF up to 2MB</p>
      </div>

      <div v-else class="selected-file-preview">
        <img :src="previewUrl" alt="Preview" class="preview-image" />
        <div class="preview-overlay">
          <button @click.stop="removeFile" class="remove-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- File Input (Hidden) -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

    <!-- Cropping Modal -->
    <div v-if="showCropper" class="cropper-modal">
      <div class="cropper-overlay" @click="closeCropper"></div>
      <div class="cropper-container">
        <div class="cropper-header">
          <h3 class="cropper-title">Crop Your Avatar</h3>
          <button @click="closeCropper" class="cropper-close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="cropper-content">
          <VueCropper ref="cropper" :src="cropperImage" :aspect-ratio="1" :view-mode="2" :auto-crop-area="0.8"
            :background="true" :movable="true" :zoomable="true" :scalable="true" :rotatable="true" :center="true"
            :highlight="false" :crop-box-movable="true" :crop-box-resizable="true" :toggle-drag-mode-on-dblclick="false"
            class="cropper-component" />
        </div>

        <div class="cropper-actions">
          <button @click="rotateLeft" class="action-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Rotate Left
          </button>
          <button @click="rotateRight" class="action-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Rotate Right
          </button>
          <button @click="zoomIn" class="action-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Zoom In
          </button>
          <button @click="zoomOut" class="action-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
            Zoom Out
          </button>
        </div>

        <div class="cropper-footer">
          <button @click="closeCropper" class="btn-secondary">Cancel</button>
          <button @click="cropImage" class="btn-primary" :disabled="cropping">
            {{ cropping ? 'Cropping...' : 'Crop & Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
    </div>

    <!-- Error Messages -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';
import VueCropper from 'vue-cropper';
import 'vue-cropper/dist/index.css';

export default defineComponent({
  name: 'AvatarUpload',
  components: {
    VueCropper
  },
  props: {
    currentAvatar: {
      type: String,
      default: ''
    }
  },
  emits: ['avatar-uploaded', 'avatar-removed'],
  setup(props, { emit }) {
    const dropZone = ref<HTMLElement | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const cropper = ref<any>(null);

    const isDragOver = ref(false);
    const selectedFile = ref<File | null>(null);
    const previewUrl = ref('');
    const showCropper = ref(false);
    const cropperImage = ref('');
    const uploadProgress = ref(0);
    const error = ref('');
    const cropping = ref(false);

    // File validation
    const validateFile = (file: File): string | null => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        return 'Please select an image file';
      }

      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        return 'File size must be less than 2MB';
      }

      // Check file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        return 'Please select a valid image file (JPG, PNG, GIF, WebP)';
      }

      return null;
    };

    // Create preview URL
    const createPreviewUrl = (file: File) => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      previewUrl.value = URL.createObjectURL(file);
    };

    // Handle file selection
    const handleFileSelect = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || !input.files[0]) return;

      const file = input.files[0];
      const validationError = validateFile(file);

      if (validationError) {
        error.value = validationError;
        return;
      }

      error.value = '';
      selectedFile.value = file;
      createPreviewUrl(file);
      openCropper();
    };

    // Drag & Drop handlers
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      isDragOver.value = true;
    };

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      isDragOver.value = false;
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      isDragOver.value = false;

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        error.value = validationError;
        return;
      }

      error.value = '';
      selectedFile.value = file;
      createPreviewUrl(file);
      openCropper();
    };

    // Trigger file input
    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    // Remove selected file
    const removeFile = () => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
      selectedFile.value = null;
      previewUrl.value = '';
      error.value = '';
      emit('avatar-removed');
    };

    // Cropper methods
    const openCropper = () => {
      if (selectedFile.value) {
        cropperImage.value = previewUrl.value;
        showCropper.value = true;
      }
    };

    const closeCropper = () => {
      showCropper.value = false;
      cropperImage.value = '';
    };

    const rotateLeft = () => {
      cropper.value?.rotate(-90);
    };

    const rotateRight = () => {
      cropper.value?.rotate(90);
    };

    const zoomIn = () => {
      cropper.value?.zoom(0.1);
    };

    const zoomOut = () => {
      cropper.value?.zoom(-0.1);
    };

    // Crop and upload
    const cropImage = async () => {
      if (!cropper.value) return;

      cropping.value = true;
      error.value = '';

      try {
        const canvas = cropper.value.getCroppedCanvas({
          width: 400,
          height: 400,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });

        // Convert canvas to blob
        canvas.toBlob(async (blob: Blob | null) => {
          if (!blob) {
            error.value = 'Failed to crop image';
            cropping.value = false;
            return;
          }

          // Create file from blob
          const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

          // Upload the cropped image
          await uploadFile(croppedFile);

          cropping.value = false;
          closeCropper();
        }, 'image/jpeg', 0.9);
      } catch (err: any) {
        error.value = err.message || 'Failed to crop image';
        cropping.value = false;
      }
    };

    // Upload file to server
    const uploadFile = async (file: File) => {
      uploadProgress.value = 0;
      error.value = '';

      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/users/upload-avatar');
        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            uploadProgress.value = Math.round((e.loaded / e.total) * 100);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.url) {
              emit('avatar-uploaded', response.url);
              uploadProgress.value = 100;
              setTimeout(() => {
                uploadProgress.value = 0;
              }, 1000);
            } else {
              error.value = response.error || 'Upload failed';
              uploadProgress.value = 0;
            }
          } else {
            error.value = xhr.statusText || 'Upload failed';
            uploadProgress.value = 0;
          }
        };

        xhr.onerror = () => {
          error.value = 'Upload failed';
          uploadProgress.value = 0;
        };

        xhr.send(formData);
      } catch (err: any) {
        error.value = err.message || 'Upload failed';
        uploadProgress.value = 0;
      }
    };

    // Cleanup on unmount
    onUnmounted(() => {
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
      }
    });

    return {
      dropZone,
      fileInput,
      cropper,
      isDragOver,
      selectedFile,
      previewUrl,
      showCropper,
      cropperImage,
      uploadProgress,
      error,
      cropping,
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      triggerFileInput,
      removeFile,
      openCropper,
      closeCropper,
      rotateLeft,
      rotateRight,
      zoomIn,
      zoomOut,
      cropImage
    };
  }
});
</script>

<style scoped>
.avatar-upload {
  @apply w-full;
}

.drop-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-all duration-200;
  @apply hover:border-blue-400 hover:bg-blue-50;
}

.drop-zone.drag-over {
  @apply border-blue-500 bg-blue-100;
}

.drop-zone.has-image {
  @apply border-solid border-gray-300 p-2;
}

.drop-zone-content {
  @apply flex flex-col items-center justify-center space-y-2;
}

.drop-zone-icon {
  @apply text-gray-400;
}

.drop-zone-text {
  @apply text-sm font-medium text-gray-700;
}

.drop-zone-hint {
  @apply text-xs text-gray-500;
}

.selected-file-preview {
  @apply relative;
}

.preview-image {
  @apply w-16 h-16 rounded-full object-cover;
}

.preview-overlay {
  @apply absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity;
  @apply bg-black bg-opacity-50 rounded-full;
}

.remove-btn {
  @apply p-1 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors;
}

.cropper-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center;
}

.cropper-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50;
}

.cropper-container {
  @apply relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden;
}

.cropper-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.cropper-title {
  @apply text-lg font-semibold text-gray-900;
}

.cropper-close {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.cropper-content {
  @apply p-4;
}

.cropper-component {
  @apply max-h-96;
}

.cropper-actions {
  @apply flex items-center justify-center space-x-2 p-4 border-t border-gray-200;
}

.action-btn {
  @apply flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors;
}

.cropper-footer {
  @apply flex items-center justify-end space-x-2 p-4 border-t border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors;
}

.btn-primary {
  @apply px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.upload-progress {
  @apply mt-2;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-500 h-2 rounded-full transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600 mt-1 block;
}

.error-message {
  @apply mt-2 text-sm text-red-600;
}
</style>
