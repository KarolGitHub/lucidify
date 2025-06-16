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
          <Cropper ref="cropper" :src="cropperImage" :stencil-props="{
            aspectRatio: 1,
            grid: true,
          }" class="cropper-component" />
        </div>

        <div class="cropper-actions">
          <button @click="checkCropperState" class="action-btn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Debug State
          </button>
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
          <button @click="cropImage" class="btn-primary" :disabled="cropping || !cropperReady">
            {{ cropping ? 'Cropping...' : !cropperReady ? 'Loading...' : 'Crop & Save' }}
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
import { defineComponent, ref, onUnmounted, nextTick } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import apiClient from '../../services/axios/config';
import { AxiosProgressEvent } from 'axios';

export default defineComponent({
  name: 'AvatarUpload',
  components: {
    Cropper
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
    const cropperReady = ref(false);
    const zoomLevel = ref(1); // Track zoom level

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

    // Validate image loads properly
    const validateImageLoad = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log('Image loaded successfully:', img.width, 'x', img.height);
          resolve(true);
        };
        img.onerror = () => {
          console.log('Image failed to load');
          resolve(false);
        };
        img.src = url;
      });
    };

    // Handle file selection
    const handleFileSelect = async (event: Event) => {
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

      // Validate that the image loads properly before opening cropper
      const imageLoaded = await validateImageLoad(previewUrl.value);
      if (imageLoaded) {
        openCropper();
      } else {
        error.value = 'Failed to load image. Please try another file.';
      }
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

    const handleDrop = async (event: DragEvent) => {
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

      // Validate that the image loads properly before opening cropper
      const imageLoaded = await validateImageLoad(previewUrl.value);
      if (imageLoaded) {
        openCropper();
      } else {
        error.value = 'Failed to load image. Please try another file.';
      }
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
      console.log('Opening cropper, selectedFile:', selectedFile.value);
      if (selectedFile.value) {
        cropperReady.value = false;
        zoomLevel.value = 1; // Reset zoom level
        cropperImage.value = previewUrl.value;
        showCropper.value = true;
        console.log('Cropper opened with image:', cropperImage.value);

        // Wait for the cropper to be mounted and then check if it's ready
        nextTick(() => {
          setTimeout(() => {
            checkCropperState();
            // If the cropper has a valid result, mark it as ready
            if (cropper.value) {
              try {
                const result = cropper.value.getResult();
                if (result && result.canvas && result.canvas.width > 0 && result.canvas.height > 0) {
                  console.log('Cropper appears to be ready based on canvas size');
                  cropperReady.value = true;
                }
              } catch (err) {
                console.log('Error checking cropper readiness:', err);
              }
            }
          }, 1000); // Give it a bit more time to initialize
        });
      }
    };

    const closeCropper = () => {
      showCropper.value = false;
      cropperImage.value = '';
      cropperReady.value = false;
    };

    const onCropperReady = () => {
      console.log('Cropper is ready!');
      cropperReady.value = true;
    };

    // Add a method to check cropper state
    const checkCropperState = () => {
      console.log('Checking cropper state...');
      console.log('Cropper ref:', cropper.value);
      console.log('Cropper ready:', cropperReady.value);
      console.log('Show cropper:', showCropper.value);
      console.log('Cropper image:', cropperImage.value);

      if (cropper.value) {
        try {
          const result = cropper.value.getResult();
          console.log('Cropper result:', result);
          if (result && result.canvas) {
            console.log('Canvas dimensions:', result.canvas.width, 'x', result.canvas.height);
          }
        } catch (err) {
          console.log('Error getting cropper result:', err);
        }
      }
    };

    const rotateLeft = () => {
      console.log('Rotate left clicked, cropper:', cropper.value);
      if (cropper.value) {
        cropper.value.rotate(-90);
      }
    };

    const rotateRight = () => {
      console.log('Rotate right clicked, cropper:', cropper.value);
      if (cropper.value) {
        cropper.value.rotate(90);
      }
    };

    const zoomIn = () => {
      console.log('Zoom in clicked, cropper:', cropper.value);
      if (cropper.value) {
        cropper.value.zoom(1.1); // Scale to 110%
        zoomLevel.value *= 1.1;
        // Check if zoom was successful
        setTimeout(() => {
          checkCropperState();
        }, 100);
      }
    };

    const zoomOut = () => {
      console.log('Zoom out clicked, cropper:', cropper.value);
      if (cropper.value && zoomLevel.value > 0.3) { // Prevent zooming out too much
        // Zoom out by using a scale factor less than 1
        cropper.value.zoom(0.9); // Scale to 90%
        zoomLevel.value *= 0.9;

        // Check if zoom made the cropper invalid
        setTimeout(() => {
          const result = cropper.value?.getResult();
          if (result && result.canvas && (result.canvas.width === 0 || result.canvas.height === 0)) {
            console.log('Zoom out made cropper invalid, resetting...');
            // Reset the cropper by refreshing it
            cropper.value.refresh();
            cropperReady.value = false;
            zoomLevel.value = 1; // Reset zoom level
            // Wait a bit and then check again
            setTimeout(() => {
              checkCropperState();
              const newResult = cropper.value?.getResult();
              if (newResult && newResult.canvas && newResult.canvas.width > 0 && newResult.canvas.height > 0) {
                cropperReady.value = true;
              }
            }, 200);
          }
        }, 100);
      } else {
        console.log('Cannot zoom out further - at minimum zoom level');
      }
    };

    // Crop and upload
    const cropImage = async () => {
      console.log('Crop image clicked, cropper:', cropper.value, 'ready:', cropperReady.value);
      if (!cropper.value || !cropperReady.value) {
        error.value = 'Cropper is not ready yet. Please wait a moment and try again.';
        return;
      }

      cropping.value = true;
      error.value = '';

      try {
        console.log('Getting result from cropper...');
        const result = cropper.value.getResult();
        console.log('Cropper result:', result);

        if (!result || !result.canvas) {
          console.log('No result or canvas from cropper');
          error.value = 'Failed to get cropped image';
          cropping.value = false;
          return;
        }

        console.log('Canvas:', result.canvas);
        console.log('Canvas width/height:', result.canvas.width, result.canvas.height);

        if (result.canvas.width === 0 || result.canvas.height === 0) {
          console.log('Canvas is empty (0x0)');
          error.value = 'Cropper is not properly initialized. Please try again.';
          cropping.value = false;
          return;
        }

        console.log('Converting canvas to blob...');
        // Convert canvas to blob
        result.canvas.toBlob(async (blob: Blob | null) => {
          console.log('Blob created:', blob);
          if (!blob) {
            error.value = 'Failed to crop image (canvas toBlob returned null)';
            cropping.value = false;
            return;
          }

          // Create file from blob
          const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          console.log('File created:', croppedFile);

          // Upload the cropped image
          await uploadFile(croppedFile);

          cropping.value = false;
          closeCropper();
        }, 'image/jpeg', 0.9);
      } catch (err: any) {
        console.log("💪 ~ cropImage ~ err:", err);
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

        const response = await apiClient.post('users/upload-avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            }
          },
        });

        if (response.data.success && response.data.url) {
          emit('avatar-uploaded', response.data.url);
          uploadProgress.value = 100;
          setTimeout(() => {
            uploadProgress.value = 0;
          }, 1000);
        } else {
          error.value = response.data.error || 'Upload failed';
          uploadProgress.value = 0;
        }
      } catch (err: any) {
        error.value = err.response?.data?.error || err.message || 'Upload failed';
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
      cropperReady,
      zoomLevel,
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      triggerFileInput,
      removeFile,
      openCropper,
      closeCropper,
      onCropperReady,
      checkCropperState,
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
  height: 400px;
  min-height: 400px;
}

.cropper-component {
  width: 100%;
  height: 400px;
  min-height: 400px;
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

/* Vue Advanced Cropper custom styles */
:deep(.vue-advanced-cropper) {
  @apply rounded-lg overflow-hidden;
  width: 100%;
  height: 100%;
}

:deep(.vue-advanced-cropper__image) {
  @apply rounded-lg;
}

:deep(.vue-advanced-cropper__stencil) {
  @apply rounded-full;
}

:deep(.vue-advanced-cropper__stencil-grid) {
  @apply opacity-20;
}
</style>
