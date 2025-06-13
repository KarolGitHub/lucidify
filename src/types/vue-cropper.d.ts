declare module "vue-cropper" {
  import { DefineComponent } from "vue";

  export interface VueCropperProps {
    src: string;
    aspectRatio?: number;
    viewMode?: number;
    autoCropArea?: number;
    background?: boolean;
    movable?: boolean;
    zoomable?: boolean;
    scalable?: boolean;
    rotatable?: boolean;
    center?: boolean;
    highlight?: boolean;
    cropBoxMovable?: boolean;
    cropBoxResizable?: boolean;
    toggleDragModeOnDblclick?: boolean;
  }

  export interface VueCropperInstance {
    rotate: (degree: number) => void;
    zoom: (ratio: number) => void;
    getCroppedCanvas: (options?: {
      width?: number;
      height?: number;
      imageSmoothingEnabled?: boolean;
      imageSmoothingQuality?: string;
    }) => HTMLCanvasElement;
  }

  const VueCropper: DefineComponent<VueCropperProps, {}, VueCropperInstance>;
  export default VueCropper;
}
