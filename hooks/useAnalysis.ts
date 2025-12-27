import { supabase } from "@/lib/supabase";
import useAuthStore from "@/store/auth.store";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// Interface dos stats
export interface AnalysisStats {
  total: number;
  sortedTags: [string, number][];
  maxTagCount: number;
  positiveCount: number;
  nightmareCount: number;
  lucidPct: number;
  weeklyData: { label: string; count: number }[];
  maxDailyDreams: number;
  morningPct: number;
}

// Função para obter dias da semana traduzidos
export const getDays = (t: (key: string) => string) => [
  t("days.sun"),
  t("days.mon"),
  t("days.tue"),
  t("days.wed"),
  t("days.thu"),
  t("days.fri"),
  t("days.sat"),
];

export function useAnalysis() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = user?.profile?.is_pro || user?.user_metadata?.is_pro || false;

  useFocusEffect(
    useCallback(() => {
      fetchDreams();
    }, [user])
  );

  const fetchDreams = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("dreams")
        .select("*")
        .eq("author_id", user.id)
        .order("date", { ascending: false });

      if (data) setDreams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo<AnalysisStats | null>(() => {
    if (dreams.length === 0) return null;

    const tagCounts: Record<string, number> = {};
    let nightmareCount = 0;
    const negativeKeywords = [
      "Pesadelo",
      "Scared",
      "Ansiedade",
      "Bad",
      "Sad",
      "Nightmare",
    ];
    let morningRegistries = 0;

    dreams.forEach((dream) => {
      // Contagem de Tags
      if (dream.tags) {
        dream.tags.forEach(
          (t: string) => (tagCounts[t] = (tagCounts[t] || 0) + 1)
        );
      }

      // Pesadelos
      if (
        dream.mood === "Scared" ||
        (dream.tags &&
          dream.tags.some((t: string) => negativeKeywords.includes(t)))
      ) {
        nightmareCount++;
      }

      // Horário (Manhã vs Noite)
      const hour = new Date(dream.created_at).getHours();
      if (hour >= 5 && hour < 11) morningRegistries++;
    });

    const total = dreams.length;

    // Top Tags
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);
    const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 1;

    // Humor
    const positiveCount = total - nightmareCount;
    const lucidCount = dreams.filter((d) => d.is_lucid).length;
    const lucidPct = total > 0 ? Math.round((lucidCount / total) * 100) : 0;

    // Rotina
    const morningPct =
      total > 0 ? Math.round((morningRegistries / total) * 100) : 0;

    // Frequência Semanal
    const DAYS = getDays(t); // <- i18n aqui
    const weeklyData: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const count = dreams.filter((dream) => {
        const dreamDate = new Date(dream.date);
        return (
          dreamDate.getDate() === d.getDate() &&
          dreamDate.getMonth() === d.getMonth() &&
          dreamDate.getFullYear() === d.getFullYear()
        );
      }).length;

      weeklyData.push({
        label: DAYS[d.getDay()] ?? d.getDay().toString(), // garante string
        count,
      });
    }

    const maxDailyDreams = Math.max(...weeklyData.map((d) => d.count), 1);

    return {
      total,
      sortedTags,
      maxTagCount,
      positiveCount,
      nightmareCount,
      lucidPct,
      weeklyData,
      maxDailyDreams,
      morningPct,
    };
  }, [dreams, t]);

  return { stats, loading, isPro };
}
