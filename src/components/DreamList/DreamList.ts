import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  type Ref,
} from "vue";
import { useScroll, useNetwork } from "@vueuse/core";
import { Dream } from "@/interface/Dream";
import DreamCard from "../DreamCard/DreamCard.vue";
import { dreams } from "@/store";

export default defineComponent({
  name: "DreamList",
  components: {
    DreamCard,
  },
  props: {
    dreams: {
      type: Array as () => Dream[],
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    highlightedDreamId: {
      type: String,
      default: null,
    },
  },
  emits: ["load-more", "view-dream"],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const ITEM_HEIGHT = 180; // Approximate height of each dream card

    // Network status monitoring
    const { isOnline, offlineAt, onlineAt } = useNetwork();
    const showOfflineWarning = ref(false);

    watch(isOnline, (online) => {
      if (!online) {
        showOfflineWarning.value = true;
        setTimeout(() => {
          showOfflineWarning.value = false;
        }, 3000);
      }
    });

    // Scroll handling
    const { y: scrollY } = useScroll(containerRef);
    const visibleDreams = computed(() => {
      if (!containerRef.value) return props.dreams;

      const containerHeight = containerRef.value.clientHeight;
      const startIndex = Math.floor(scrollY.value / ITEM_HEIGHT);
      const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT) + 2; // Add buffer

      return props.dreams.slice(startIndex, startIndex + visibleCount);
    });

    // Infinite scroll
    const isLoadingMore = ref(false);
    const hasMore = computed(() => {
      const stats = dreams.getters.getStats();
      return stats
        ? dreams.getters.getDreams().length < stats.totalDreams
        : false;
    });

    const loadMore = async () => {
      if (isLoadingMore.value || !hasMore.value) return;

      try {
        isLoadingMore.value = true;
        await emit("load-more");
      } finally {
        isLoadingMore.value = false;
      }
    };

    // Check if we're near the bottom
    watch(scrollY, (y) => {
      if (!containerRef.value) return;

      const { scrollHeight, clientHeight } = containerRef.value;
      if (scrollHeight - (y + clientHeight) < 100) {
        loadMore();
      }
    });

    const viewDream = (dream: Dream) => {
      emit("view-dream", dream);
    };

    const containerStyle = computed(() => ({
      height: "100%",
      overflow: "auto",
      position: "relative" as const,
    }));

    const wrapperStyle = computed(() => ({
      position: "relative" as const,
      width: "100%",
      height: `${props.dreams.length * ITEM_HEIGHT}px`,
    }));

    return {
      containerRef,
      containerStyle,
      wrapperStyle,
      visibleDreams,
      isOnline,
      showOfflineWarning,
      isLoadingMore,
      hasMore,
      ITEM_HEIGHT,
      viewDream,
    };
  },
});
