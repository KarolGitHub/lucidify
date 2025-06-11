export interface Dream {
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

export interface NewDream {
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

// EditingDream extends Dream for editing state
export interface EditingDream extends Dream {
  tagsInput: string;
}

export interface DreamStats {
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

export interface DreamFilters {
  searchQuery: string;
  selectedFilter: "all" | "lucid" | "vivid" | "recurring" | "nightmare";
  startDate?: string;
  endDate?: string;
  tags?: string[];
  emotions?: string[];
}
