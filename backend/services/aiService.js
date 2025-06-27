const axios = require("axios");

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = "https://api.openai.com/v1";
    this.model = "gpt-4o-mini"; // Using GPT-4o-mini for cost efficiency
  }

  /**
   * Analyze dream description and suggest tags, emotions, themes, and symbols
   */
  async analyzeDream(description, title = "") {
    try {
      if (!this.apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = this.buildAnalysisPrompt(description, title);
      const response = await this.callOpenAI(prompt);

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw new Error("Failed to analyze dream with AI");
    }
  }

  /**
   * Generate dream interpretation
   */
  async interpretDream(description, title = "", context = {}) {
    try {
      if (!this.apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = this.buildInterpretationPrompt(
        description,
        title,
        context,
      );
      const response = await this.callOpenAI(prompt);

      return this.parseInterpretationResponse(response);
    } catch (error) {
      console.error("AI Interpretation Error:", error);
      throw new Error("Failed to interpret dream with AI");
    }
  }

  /**
   * Generate personalized insights based on dream patterns
   */
  async generateInsights(dreamHistory, currentDream) {
    try {
      if (!this.apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = this.buildInsightsPrompt(dreamHistory, currentDream);
      const response = await this.callOpenAI(prompt);

      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error("AI Insights Error:", error);
      throw new Error("Failed to generate insights with AI");
    }
  }

  /**
   * Build prompt for dream analysis
   */
  buildAnalysisPrompt(description, title) {
    return `Analyze this dream and provide structured suggestions for categorization:

Dream Title: ${title}
Dream Description: ${description}

Please analyze the dream and provide suggestions in the following JSON format:
{
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedEmotions": ["emotion1", "emotion2"],
  "suggestedThemes": ["theme1", "theme2"],
  "suggestedSymbols": ["symbol1", "symbol2"],
  "confidence": 0.85,
  "reasoning": "Brief explanation of why these suggestions were made"
}

Available emotions: Joy, Fear, Sadness, Anger, Surprise, Disgust, Love, Confusion, Excitement, Anxiety, Peace, Wonder, Euphoria, Terror, Melancholy, Rage, Shock, Revulsion, Passion, Bewilderment, Thrill, Dread, Serenity, Awe

Available themes: Flying, Being Chased, Falling, Water, Family, Work, School, Travel, Home, Nature, Technology, Animals, Death, Birth, Transformation, Journey, Conflict, Love, Loss, Discovery, Escape, Return, Search, Meeting, Separation, Reunion, Power, Helplessness, Freedom, Confinement, Success, Failure, Growth, Decay, Light, Darkness, Music, Silence, Speed, Slowness, Size Changes, Time Distortion, Reality Shifts, Other

Available symbols: Snake, House, Car, Mirror, Stairs, Door, Window, Tree, Ocean, Mountain, Bridge, Road, Key, Clock, Book, Phone, Computer, Money, Jewelry, Clothing, Food, Fire, Water, Earth, Air, Sun, Moon, Stars, Clouds, Rain, Snow, Wind, Lightning, Thunder, Bird, Fish, Cat, Dog, Horse, Spider, Butterfly, Dragon, Angel, Demon, Ghost, Child, Old Person, Stranger, Family Member, Friend, Teacher, Doctor, Police, Soldier, Artist, Musician, Writer, Scientist, Wizard, King, Queen, Princess, Prince, Knight, Villain, Hero, Other

Only suggest items from the available lists. Keep suggestions relevant and specific to the dream content.`;
  }

  /**
   * Build prompt for dream interpretation
   */
  buildInterpretationPrompt(description, title, context) {
    const contextInfo = context.isLucid ? "This was a lucid dream." : "";
    const contextInfo2 = context.isNightmare ? "This was a nightmare." : "";

    return `Provide a thoughtful interpretation of this dream:

Dream Title: ${title}
Dream Description: ${description}
Context: ${contextInfo} ${contextInfo2}

Please provide an interpretation in the following JSON format:
{
  "interpretation": {
    "generalMeaning": "Overall interpretation of the dream",
    "symbolicElements": "Analysis of key symbols and their meanings",
    "emotionalInsights": "What the dream reveals about emotional state",
    "personalGrowth": "Potential areas for personal development",
    "practicalAdvice": "Actionable insights or advice"
  },
  "keySymbols": [
    {
      "symbol": "symbol name",
      "meaning": "what this symbol represents",
      "personalRelevance": "how it relates to the dreamer"
    }
  ],
  "confidence": 0.8,
  "disclaimer": "This is an AI-generated interpretation and should be considered as one perspective among many."
}

Focus on psychological and symbolic meanings while being respectful and constructive.`;
  }

  /**
   * Build prompt for generating insights from dream patterns
   */
  buildInsightsPrompt(dreamHistory, currentDream) {
    const recentDreams = dreamHistory
      .slice(0, 10)
      .map(
        (dream) =>
          `- ${dream.title}: ${dream.description.substring(0, 100)}...`,
      )
      .join("\n");

    return `Analyze this dreamer's recent dream patterns and provide insights:

Current Dream:
Title: ${currentDream.title}
Description: ${currentDream.description}

Recent Dream History:
${recentDreams}

Please provide insights in the following JSON format:
{
  "patternAnalysis": {
    "recurringThemes": ["theme1", "theme2"],
    "emotionalTrends": "Analysis of emotional patterns",
    "symbolicConnections": "Connections between recent dreams",
    "growthAreas": "Areas where the dreamer might be growing or struggling"
  },
  "personalizedInsights": [
    {
      "insight": "Specific insight about the dreamer",
      "evidence": "What in the dreams supports this insight",
      "suggestion": "Actionable suggestion based on this insight"
    }
  ],
  "dreamProgression": "How the current dream fits into the overall pattern",
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on constructive, growth-oriented insights.`;
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert dream analyst and psychologist. Provide thoughtful, accurate, and helpful analysis of dreams. Always respond in the exact JSON format requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error.response?.data || error.message);
      throw new Error("Failed to communicate with AI service");
    }
  }

  /**
   * Parse analysis response
   */
  parseAnalysisResponse(response) {
    try {
      // Remove Markdown code fences if present
      const cleaned = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        suggestedTags: parsed.suggestedTags || [],
        suggestedEmotions: parsed.suggestedEmotions || [],
        suggestedThemes: parsed.suggestedThemes || [],
        suggestedSymbols: parsed.suggestedSymbols || [],
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || "Analysis completed",
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new Error("Invalid AI response format");
    }
  }

  /**
   * Parse interpretation response
   */
  parseInterpretationResponse(response) {
    try {
      // Remove Markdown code fences if present
      const cleaned = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        interpretation: parsed.interpretation || {},
        keySymbols: parsed.keySymbols || [],
        confidence: parsed.confidence || 0.5,
        disclaimer: parsed.disclaimer || "AI-generated interpretation",
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new Error("Invalid AI response format");
    }
  }

  /**
   * Parse insights response
   */
  parseInsightsResponse(response) {
    try {
      // Remove Markdown code fences if present
      const cleaned = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        patternAnalysis: parsed.patternAnalysis || {},
        personalizedInsights: parsed.personalizedInsights || [],
        dreamProgression: parsed.dreamProgression || "",
        recommendations: parsed.recommendations || [],
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      throw new Error("Invalid AI response format");
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      model: this.model,
      configured: !!this.apiKey,
    };
  }
}

module.exports = new AIService();
