import { GoogleGenAI } from "@google/genai";

// ⚠️ No Expo, use EXPO_PUBLIC_ para variáveis de ambiente visíveis no front
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Função auxiliar para extrair texto de forma segura
const extractText = (response: any): string => {
  if (!response) return "";
  if (typeof response === "string") return response;
  if (typeof response.text === "function") return response.text();
  if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  return "";
};

export const aiService = {
  // 1. Interpretação
  analyzeDreamWithGemini: async (
    title: string,
    description: string,
    mood?: string,
    isLucid?: boolean,
    language: string = "en"
  ): Promise<string> => {
    try {
      const targetLanguage = language.startsWith("pt")
        ? "Portuguese (Brazil)"
        : "English";
      const context = `Emotion: ${mood || "Not specified"}, Lucid: ${isLucid ? "Yes" : "No"}`;

      const prompt = `
      Act as a Jungian dream interpreter. Analyze: "${title}: ${description}". Context: ${context}.
      Task: Concise interpretation (max 100 words). 1. Emotion. 2. Symbols. 3. Advice.
      Output Language: ${targetLanguage}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: { role: "user", parts: [{ text: prompt }] },
      });

      return (
        extractText(response) ||
        (language.startsWith("pt")
          ? "Erro na interpretação."
          : "Interpretation error.")
      );
    } catch (error) {
      console.error(error);
      return language.startsWith("pt")
        ? "Erro de conexão."
        : "Connection error.";
    }
  },

  // 2. Gerar Tags (AQUI ESTAVA O ERRO - AGORA ACEITA 2 ARGUMENTOS)
  generateTagsForDream: async (
    description: string,
    language: string = "en" // 👈 O segundo argumento precisa estar aqui
  ): Promise<string[]> => {
    try {
      const targetLanguage = language.startsWith("pt")
        ? "Portuguese"
        : "English";

      const prompt = `
        Analyze this dream: "${description}"
        Generate 3 to 5 single-word tags representing themes.
        IMPORTANT: Tags MUST be in ${targetLanguage}.
        Return ONLY tags separated by commas.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: { role: "user", parts: [{ text: prompt }] },
      });

      const text = extractText(response);

      return text
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } catch (e) {
      console.error(e);
      return language.startsWith("pt") ? ["Sonho"] : ["Dream"];
    }
  },

  // 3. Prompt de Imagem
  generateDreamImagePrompt: async (
    title: string,
    description: string
  ): Promise<string> => {
    try {
      const prompt = `Create visual prompt for dream: ${title}. Desc: ${description}. Max 40 words, English only. Style: Surrealism.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: { role: "user", parts: [{ text: prompt }] },
      });
      return (
        extractText(response)?.trim() || `Surreal dream art about ${title}`
      );
    } catch (e) {
      return `Surreal dream art about ${title}`;
    }
  },

  // 4. URL Pollinations
  generateImageFromPollinations: (prompt: string): string => {
    const encoded = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000);
    return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
  },
};
