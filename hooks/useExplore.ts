import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";

export function useExplore() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 650);
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPublicDreams = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("dreams")
        .select(`*, profiles:author_id ( name, avatar )`)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(20);

      if (searchQuery) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      setDreams(data || []);
    } catch (error) {
      console.error("Explore Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reage à mudança do texto digitado (com delay)
  useEffect(() => {
    fetchPublicDreams(debouncedQuery);
  }, [debouncedQuery, fetchPublicDreams]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPublicDreams(debouncedQuery);
  };

  return {
    query,
    setQuery,
    dreams,
    loading,
    refreshing,
    onRefresh,
  };
}
