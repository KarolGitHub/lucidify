import { defineComponent, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { dreams, auth } from "@/store";
import { Dream, DreamStats } from "@/interface/Dream";
import { User } from "@/interface/User";
import CardPageVisits from "@/components/Cards/CardPageVisits/CardPageVisits.vue";
import CardSocialTraffic from "@/components/Cards/CardSocialTraffic/CardSocialTraffic.vue";

export default defineComponent({
  name: "Dashboard",
  components: {
    CardPageVisits,
    CardSocialTraffic,
  },
  setup() {
    const router = useRouter();

    // Computed properties
    const user = computed<User | null>(() => auth.getters.getUser());
    const stats = computed<DreamStats | null>(() => dreams.getters.getStats());
    const allDreams = computed<Dream[]>(() => dreams.getters.getDreams());

    // User greeting
    const greeting = computed(() => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    });

    const userName = computed(() => {
      return (
        user.value?.displayName || user.value?.email?.split("@")[0] || "Dreamer"
      );
    });

    // Last dream
    const lastDream = computed<Dream | null>(() => {
      if (!allDreams.value.length) return null;
      return allDreams.value[0]; // Already sorted by date in getters
    });

    // Progress statistics
    const lucidDreamsCount = computed(() => stats.value?.lucidDreams || 0);
    const lucidDreamsThisMonth = computed(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return allDreams.value.filter(
        (dream) => dream.isLucid && new Date(dream.date) >= startOfMonth,
      ).length;
    });

    const currentStreak = computed(() => {
      if (!allDreams.value.length) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        // Check last 30 days
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);

        const hasDreamOnDate = allDreams.value.some((dream) => {
          const dreamDate = new Date(dream.date);
          dreamDate.setHours(0, 0, 0, 0);
          return dreamDate.getTime() === checkDate.getTime();
        });

        if (hasDreamOnDate) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    });

    // Common emotions
    const commonEmotions = computed(() => {
      if (!stats.value?.emotionStats) return [];

      return stats.value.emotionStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((emotion) => emotion._id);
    });

    // Common themes
    const commonThemes = computed(() => {
      if (!stats.value?.tagStats) return [];

      return stats.value.tagStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((theme) => theme._id);
    });

    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Yesterday";
      if (diffDays === 0) return "Today";
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    // Methods
    const openNewDreamModal = () => {
      router.push({ path: "/dream-journal", query: { new: "1" } });
    };

    const viewLastDream = () => {
      if (lastDream.value) {
        // Navigate to dream journal with the last dream selected
        router.push({
          path: "/dream-journal",
          query: {
            view: lastDream.value._id,
            highlight: "last",
          },
        });
      }
    };

    const viewDream = (dream: Dream) => {
      // Navigate to dream journal with the specific dream selected
      router.push({
        path: "/dream-journal",
        query: {
          view: dream._id,
          highlight: "recent",
        },
      });
    };

    const recordFirstDream = () => {
      // Open new dream modal for first dream
      dreams.actions.setShowNewDreamModal(true);
    };

    // Lifecycle
    onMounted(async () => {
      if (auth.getters.isLogged()) {
        await dreams.actions.loadDreams();
        await dreams.actions.loadStats();
      }
    });

    return {
      // Computed
      greeting,
      userName,
      lastDream,
      lucidDreamsCount,
      lucidDreamsThisMonth,
      currentStreak,
      commonEmotions,
      commonThemes,
      allDreams,

      // Methods
      formatDate,
      openNewDreamModal,
      viewLastDream,
      viewDream,
      recordFirstDream,
    };
  },
});
