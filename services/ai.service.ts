import { GoogleGenAI } from "@google/genai";

// ⚠️ No Expo, use EXPO_PUBLIC_ para variáveis de ambiente visíveis no front
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Função auxiliar para extrair texto de forma segura
// (Resolve o seu erro: verifica se já é string ou se precisa chamar .text())
const extractText = (response: any): string => {
  if (!response) return "";
  if (typeof response === "string") return response;
  if (typeof response.text === "function") return response.text();
  // Caso a estrutura seja diferente (algumas versões retornam candidates array)
  if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  return "";
};

export const aiService = {
  // 1. Interpretação do Sonho
  analyzeDreamWithGemini: async (
    title: string,
    description: string,
    mood?: string,
    isLucid?: boolean,
    language: string = "en" // Padrão inglês se não informar
  ): Promise<string> => {
    try {
      // Definimos o idioma alvo de forma clara para a IA
      const targetLanguage = language.startsWith("pt")
        ? "Portuguese (Brazil)"
        : "English";

      const context = `
      Additional Context:
      - Dreamer's Emotion: ${mood || "Not specified"}
      - Was it a Lucid Dream?: ${isLucid ? "Yes" : "No"}
    `;

      const prompt = `
      Act as a professional psychologist and dream interpreter (Jungian approach). 
      Analyze the following dream.
      
      Title: ${title}
      Description: ${description}
      ${context}
      
      TASK:
      Provide a VERY concise interpretation (max 100 words).
      1. Briefly interpret the dominant emotion.
      2. Identify the meaning of key symbols.
      3. Give one gentle, actionable advice.
      
      IMPORTANT CONSTRAINTS:
      - OUTPUT LANGUAGE: Respond strictly in ${targetLanguage}.
      - FORMAT: Plain text, use emojis. Keep it short for a mobile app screen.
    `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: { role: "user", parts: [{ text: prompt }] },
        config: {
          temperature: 0.7,
          // maxOutputTokens ajuda a cortar se a IA tentar escrever um livro
          maxOutputTokens: 200,
        },
      });

      const text = extractText(response);

      // Mensagem de erro traduzida caso falhe o parse
      const errorMsg = language.startsWith("pt")
        ? "As brumas estão densas demais agora. Tente novamente."
        : "The mists are too thick to see clearly right now. Please try again later.";

      return text || errorMsg;
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return language.startsWith("pt")
        ? "Não foi possível conectar ao reino dos sonhos."
        : "Could not connect to the dream realm.";
    }
  },
  // 2. Gerar Tags
  generateTagsForDream: async (description: string): Promise<string[]> => {
    try {
      const prompt = `Generate 3 to 5 single-word tags for this dream description. Return ONLY the tags separated by commas, no other text. Dream: ${description}`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: { role: "user", parts: [{ text: prompt }] },
      });

      // USO SEGURO AQUI
      const text = extractText(response);

      return text
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } catch (e) {
      return ["Dream", "Mystery"];
    }
  },

  // 3. Cria o Prompt Visual (Onde estava dando erro)
  generateDreamImagePrompt: async (
    title: string,
    description: string
  ): Promise<string> => {
    try {
      const prompt = `
        Based on this dream, write a concise but highly visual artistic prompt for an AI image generator.
        Dream Title: ${title}
        Description: ${description}
        Return ONLY the prompt text, no explanations. Max 40 words.
        Style keywords: Surrealism, Dreamcore, Ethereal, Digital Art.
      `;

      const response = await ai.models.generateContent({
        // ⚠️ CORREÇÃO: "gemini-2.5" não existe publicamente ainda.
        // Use "gemini-1.5-flash" ou "gemini-2.0-flash-exp"
        model: "gemini-2.5-flash-lite",
        contents: { role: "user", parts: [{ text: prompt }] },
      });

      // ⚠️ A CORREÇÃO PRINCIPAL ESTÁ AQUI:
      // Usamos a função auxiliar que checa se é string antes de tentar ler propriedades
      const text = extractText(response);

      return (
        text?.trim() || "A surreal dreamscape with neon lights, digital art"
      );
    } catch (e) {
      console.error("Image Prompt Error:", e);
      // Fallback simples caso a IA falhe totalmente
      return `Surreal dream art about ${title}`;
    }
  },

  // 4. Gera a URL da imagem
  generateImageFromPollinations: (prompt: string): string => {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
  },
};
