export interface AIAnalysis {
  suggestedTags: string[];
  suggestedEmotions: string[];
  suggestedThemes: string[];
  suggestedSymbols: string[];
  confidence: number;
  reasoning: string;
}

export interface AIIntepretation {
  interpretation: {
    generalMeaning: string;
    symbolicElements: string;
    emotionalInsights: string;
    personalGrowth: string;
    practicalAdvice: string;
  };
  keySymbols: Array<{
    symbol: string;
    meaning: string;
    personalRelevance: string;
  }>;
  confidence: number;
  disclaimer: string;
}

export interface AIInsights {
  patternAnalysis: {
    recurringThemes: string[];
    emotionalTrends: string;
    symbolicConnections: string;
    growthAreas: string;
  };
  personalizedInsights: Array<{
    insight: string;
    evidence: string;
    suggestion: string;
  }>;
  dreamProgression: string;
  recommendations: string[];
}

export interface CompleteAIAnalysis {
  analysis: AIAnalysis;
  interpretation: AIIntepretation;
  insights: AIInsights;
}

export interface AIStatus {
  available: boolean;
  model: string;
  configured: boolean;
}

export interface BatchAnalysisResult {
  dreamId: string;
  title: string;
  analysis?: AIAnalysis;
  error?: string;
}

export interface BatchAnalysisResponse {
  totalAnalyzed: number;
  successful: number;
  failed: number;
  results: BatchAnalysisResult[];
}
