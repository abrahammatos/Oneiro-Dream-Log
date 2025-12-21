import { supabase } from "@/lib/supabase";
import { Dream } from "@/type";

type NewDreamData = {
  userId: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  mood: string;
  isLucid: boolean;
  imageUrl?: string | null;
  language: string;
};

export const fetchDreamsFeed = async (
  userId: string | undefined,
  language: string = "en",
  filter: "recent" | "popular",
  limit: number,
  offset: number
): Promise<Dream[]> => {
  const { data, error } = await supabase.rpc("get_dreams_feed", {
    viewer_id: userId || null,
    filter_lang: language,
    sort_by: filter,
    limit_count: limit,
    offset_count: offset,
  });

  if (error) {
    console.error("Erro ao buscar feed:", error);
    return [];
  }

  return data as Dream[];
};

export const toggleDreamLike = async (dreamId: string, userId: string) => {
  try {
    // Tenta INSERIR o like direto
    const { error } = await supabase
      .from("interactions")
      .insert({ user_id: userId, dream_id: dreamId, type: "like" });

    if (error) {
      // Se der erro de "Unique Constraint" (código 23505), significa que JÁ TEM like.
      // Então a gente DELETA (Dislike).
      if (error.code === "23505") {
        await supabase
          .from("interactions")
          .delete()
          .eq("user_id", userId)
          .eq("dream_id", dreamId);
        return false; // Removeu like
      } else {
        throw error; // Outro erro real
      }
    }

    return true; // Adicionou like com sucesso
  } catch (error) {
    console.error("Erro no toggle:", error);
    throw error;
  }
};

export const createDream = async (data: NewDreamData) => {
  // 1. Prepara as Tags (Junta mood + lucid)
  const tags: string[] = [];
  if (data.mood) tags.push(data.mood);
  if (data.isLucid) tags.push("Lucid");

  // 2. Monta o objeto no formato exato que o banco espera (snake_case)
  // Lembre-se: sua coluna de usuário se chama 'author_id'
  const payload = {
    author_id: data.userId,
    title: data.title,
    description: data.description,
    visibility: data.visibility,
    mood: data.mood,
    is_lucid: data.isLucid,
    image_url: data.imageUrl,
    language: data.language,
    tags: tags,
    // created_at e likes_count o banco preenche sozinho
  };

  // 3. Envia para o Supabase
  const { data: result, error } = await supabase
    .from("dreams")
    .insert(payload)
    .select() // Retorna o item criado (útil para confirmar)
    .single();

  if (error) {
    console.error("Erro ao criar sonho:", error);
    throw error;
  }

  return result;
};

// --- SERVIÇOS DE COMENTÁRIOS E IA ---

// Adicionar Comentário
export const addComment = async (
  dreamId: string,
  userId: string,
  text: string
) => {
  const { data, error } = await supabase
    .from("comments") // Certifique-se de ter essa tabela
    .insert({ dream_id: dreamId, user_id: userId, text })
    .select("*, profiles(username, avatar)") // Já traz os dados do autor
    .single();

  if (error) throw error;
  return data;
};

// Deletar Comentário
export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  if (error) throw error;
};

// Buscar Comentários de um Sonho
export const fetchComments = async (dreamId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar)")
    .eq("dream_id", dreamId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Formata para facilitar o uso no front
  return data.map((c: any) => ({
    ...c,
    authorName: c.profiles?.username || "Anônimo",
    authorAvatar: c.profiles?.avatar,
  }));
};

// Salvar Análise da IA no Sonho
export const saveDreamAnalysis = async (
  dreamId: string,
  analysisText: string
) => {
  const { error } = await supabase
    .from("dreams")
    .update({ analysis: analysisText }) // Certifique-se de criar a coluna 'analysis' (TEXT) na tabela dreams
    .eq("id", dreamId);

  if (error) throw error;
};
