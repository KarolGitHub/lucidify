import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useVirtualList, useInfiniteScroll, useNetwork } from "@vueuse/core";
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
  },
  emits: ["load-more"],
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

    // Virtual list
    const { list, containerProps, wrapperProps } = useVirtualList(
      props.dreams,
      {
        itemHeight: ITEM_HEIGHT,
        overscan: 5,
      },
    );

    // Infinite scroll
    const isLoadingMore = ref(false);
    const hasMore = computed(() => {
      // Implement your logic to determine if there are more dreams to load
      return (
        dreams.getters.getDreams().length <
        dreams.getters.getStats()?.totalDreams
      );
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

    useInfiniteScroll(containerRef, loadMore, { distance: 10 });

    const containerStyle = computed(() => ({
      height: "100%",
      overflow: "auto",
      position: "relative",
    }));

    const wrapperStyle = computed(() => ({
      position: "relative",
      width: "100%",
    }));

    return {
      containerRef,
      containerProps,
      wrapperProps,
      containerStyle,
      wrapperStyle,
      list,
      isOnline,
      showOfflineWarning,
      isLoadingMore,
      hasMore,
    };
  },
});
