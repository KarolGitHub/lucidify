import { defineComponent } from "vue";
import { auth } from "@/store";

interface Dream {
  _id?: string;
  title: string;
  description: string;
  date: string;
  isLucid: boolean;
  isVivid: boolean;
  isRecurring: boolean;
  isNightmare: boolean;
  tags: string[];
  emotions: string[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  rating?: number;
}

interface NewDream {
  title: string;
  description: string;
  date: string;
  isLucid: boolean;
  isVivid: boolean;
  isRecurring: boolean;
  isNightmare: boolean;
  tagsInput: string;
  emotions: string[];
}

interface DreamStats {
  totalDreams: number;
  lucidDreams: number;
  vividDreams: number;
  recurringDreams: number;
  nightmares: number;
  averageRating: number;
  firstDream: string | null;
  lastDream: string | null;
  lucidPercentage: number;
  recentDreams: Dream[];
  tagStats: Array<{ _id: string; count: number }>;
  emotionStats: Array<{ _id: string; count: number }>;
}

export default defineComponent({
  name: "DreamJournal",
  data() {
    return {
      dreams: [] as Dream[],
      stats: null as DreamStats | null,
      newDream: {
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isLucid: false,
        isVivid: false,
        isRecurring: false,
        isNightmare: false,
        tagsInput: "",
        emotions: [],
      } as NewDream,
      showNewDreamModal: false,
      searchQuery: "",
      selectedFilter: "all",
      isSaving: false,
      isLoading: false,
      emotions: [
        "Joy",
        "Fear",
        "Sadness",
        "Anger",
        "Surprise",
        "Disgust",
        "Love",
        "Confusion",
        "Excitement",
        "Anxiety",
        "Peace",
        "Wonder",
      ],
      // API configuration
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
    };
  },
  computed: {
    filteredDreams(): Dream[] {
      let filtered = this.dreams;

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (dream) =>
            dream.title.toLowerCase().includes(query) ||
            dream.description.toLowerCase().includes(query) ||
            dream.tags.some((tag) => tag.toLowerCase().includes(query)),
        );
      }

      // Apply type filter
      switch (this.selectedFilter) {
        case "lucid":
          filtered = filtered.filter((dream) => dream.isLucid);
          break;
        case "vivid":
          filtered = filtered.filter((dream) => dream.isVivid);
          break;
        case "recurring":
          filtered = filtered.filter((dream) => dream.isRecurring);
          break;
        case "nightmare":
          filtered = filtered.filter((dream) => dream.isNightmare);
          break;
      }

      // Sort by date (newest first)
      return filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    },
  },
  async mounted() {
    // Check if user is authenticated
    if (!auth.getters.isLogged()) {
      this.showNotification("You must be logged in to view dreams.", "error");
      return;
    }

    await this.loadDreams();
    await this.loadStats();
  },
  methods: {
    async loadDreams() {
      try {
        this.isLoading = true;

        // Get current user ID and token from auth store
        const userId = auth.getters.getUser()?.id;
        const token = auth.getters.getAccessToken();

        if (!userId || !token) {
          this.showNotification(
            "You must be logged in to view dreams.",
            "error",
          );
          this.dreams = [];
          return;
        }

        const response = await fetch(
          `${this.apiBaseUrl}/api/dreams?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        this.dreams = result.data || [];
      } catch (error) {
        console.error("Error loading dreams:", error);
        this.showNotification(
          "Failed to load dreams. Please check your connection.",
          "error",
        );
        this.dreams = [];
      } finally {
        this.isLoading = false;
      }
    },

    async loadStats() {
      try {
        const userId = auth.getters.getUser()?.id;
        const token = auth.getters.getAccessToken();

        if (!userId || !token) {
          return;
        }

        const response = await fetch(
          `${this.apiBaseUrl}/api/dreams/stats/user?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const result = await response.json();
          this.stats = result.data;
        }
      } catch (error) {
        console.error("Error loading dream stats:", error);
      }
    },

    async saveDream() {
      try {
        this.isSaving = true;

        // Process tags
        const tags = this.newDream.tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        const dreamData: Dream = {
          title: this.newDream.title,
          description: this.newDream.description,
          date: this.newDream.date,
          isLucid: this.newDream.isLucid,
          isVivid: this.newDream.isVivid,
          isRecurring: this.newDream.isRecurring,
          isNightmare: this.newDream.isNightmare,
          tags,
          emotions: this.newDream.emotions,
        };

        const userId = auth.getters.getUser()?.id;
        const token = auth.getters.getAccessToken();

        if (!userId || !token) {
          this.showNotification(
            "You must be logged in to save dreams.",
            "error",
          );
          return;
        }

        const response = await fetch(`${this.apiBaseUrl}/api/dreams`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...dreamData,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Add the new dream to the list
        this.dreams.unshift(result.data);
        this.showNewDreamModal = false;
        this.resetNewDreamForm();

        // Reload stats
        await this.loadStats();

        // Show success message
        this.showNotification("Dream saved successfully!", "success");
      } catch (error) {
        console.error("Error saving dream:", error);
        this.showNotification(
          "Failed to save dream. Please try again.",
          "error",
        );
      } finally {
        this.isSaving = false;
      }
    },

    async deleteDream(dreamId: string) {
      try {
        const token = auth.getters.getAccessToken();

        if (!token) {
          this.showNotification(
            "You must be logged in to delete dreams.",
            "error",
          );
          return;
        }

        const response = await fetch(
          `${this.apiBaseUrl}/api/dreams/${dreamId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          this.dreams = this.dreams.filter((dream) => dream._id !== dreamId);
          await this.loadStats();
          this.showNotification("Dream deleted successfully!", "success");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error deleting dream:", error);
        this.showNotification(
          "Failed to delete dream. Please try again.",
          "error",
        );
      }
    },

    resetNewDreamForm() {
      this.newDream = {
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isLucid: false,
        isVivid: false,
        isRecurring: false,
        isNightmare: false,
        tagsInput: "",
        emotions: [],
      };
    },

    viewDream(dream: Dream) {
      // TODO: Navigate to dream detail view or open modal
      console.log("Viewing dream:", dream);
    },

    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    showNotification(
      message: string,
      type: "success" | "error" | "info" = "info",
    ) {
      // TODO: Implement notification system
      console.log(`${type.toUpperCase()}: ${message}`);
    },
  },
});
