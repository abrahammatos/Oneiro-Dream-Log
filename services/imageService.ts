import { supabase } from "@/lib/supabase";

export const uploadImageFromUrl = async (
  pollinationsUrl: string,
  userId: string
): Promise<string | null> => {
  try {
    // 1. Baixa a imagem usando fetch
    const response = await fetch(pollinationsUrl);

    // ⚠️ CORREÇÃO: Usar arrayBuffer() em vez de blob() no React Native
    const buffer = await response.arrayBuffer();

    // 2. Gera nome do arquivo
    const fileName = `${userId}/${Date.now()}.jpg`;

    // 3. Upload para o Supabase enviando o buffer direto
    const { data, error } = await supabase.storage
      .from("dream-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Erro detalhado do Supabase:", error);
      throw error;
    }

    // 4. Pega URL Pública
    const { data: publicData } = supabase.storage
      .from("dream-images")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return null;
  }
};
