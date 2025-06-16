declare module "vue-advanced-cropper" {
  import { DefineComponent } from "vue";

  export interface CropperProps {
    src: string;
    stencilProps?: {
      aspectRatio?: number;
      grid?: boolean;
    };
    defaultSize?: {
      width: string | number;
      height: string | number;
    };
    defaultPosition?: {
      x: string | number;
      y: string | number;
    };
  }

  export interface CropperResult {
    coordinates: {
      width: number;
      height: number;
      top: number;
      left: number;
    };
    visibleArea: {
      width: number;
      height: number;
      top: number;
      left: number;
    };
    canvas?: HTMLCanvasElement;
    image: {
      width: number;
      height: number;
      transforms: {
        rotate: number;
        flip: {
          horizontal: boolean;
          vertical: boolean;
        };
      };
      src: string | null;
    };
  }

  export interface CropperInstance {
    getResult: () => CropperResult;
    setCoordinates: (transform: any) => void;
    refresh: () => void;
    zoom: (factor: number, center?: { top: number; left: number }) => void;
    move: (left: number, top?: number) => void;
    rotate: (angle: number) => void;
    flip: (horizontal: boolean, vertical?: boolean) => void;
    reset: () => void;
  }

  export const Cropper: DefineComponent<CropperProps, {}, CropperInstance>;
}
