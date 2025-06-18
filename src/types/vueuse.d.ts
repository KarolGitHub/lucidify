declare module "@vueuse/core" {
  import { Ref } from "vue";

  export function useScroll(target: Ref<HTMLElement | null>): {
    x: Ref<number>;
    y: Ref<number>;
    isScrolling: Ref<boolean>;
    arrivedState: {
      left: Ref<boolean>;
      right: Ref<boolean>;
      top: Ref<boolean>;
      bottom: Ref<boolean>;
    };
    directions: {
      left: Ref<boolean>;
      right: Ref<boolean>;
      top: Ref<boolean>;
      bottom: Ref<boolean>;
    };
  };

  export function useNetwork(): {
    isOnline: Ref<boolean>;
    offlineAt: Ref<number | null>;
    onlineAt: Ref<number | null>;
  };
}
