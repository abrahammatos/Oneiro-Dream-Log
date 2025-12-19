import { supabase } from "@/lib/supabase";
import { Dream } from "@/type";

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
  const { error } = await supabase.rpc("toggle_dream_like", {
    p_dream_id: dreamId,
    p_user_id: userId,
  });

  if (error) {
    console.error("Erro ao dar like:", error);
    throw error;
  }
};
