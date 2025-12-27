import {
  Activity,
  BookOpen,
  Brain,
  Clock,
  PieChart,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks e Componentes Internos
import { PremiumCard, TopStatCard } from "@/components/AnalysisCards";
import {
  FrequencyChart,
  MoodBar,
  RoutineChart,
  ThemesList,
} from "@/components/AnalysisCharts";
import { ProOverlay } from "@/components/ProOverlay";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useTranslation } from "react-i18next";

export default function AnalysisScreen() {
  const { t } = useTranslation();
  const { stats, loading, isPro } = useAnalysis();

  // Loading / Empty State
  if (!stats && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950 items-center justify-center p-6">
        <PieChart
          size={64}
          className="text-indigo-200 dark:text-slate-800 mb-4"
        />
        <Text className="text-slate-500 dark:text-slate-400 text-center font-medium">
          {t("analysis.empty")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* HEADER */}
          <View className="px-6 pt-4 mb-8 flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("analysis.title")}
              </Text>
              <Text className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1">
                {t("analysis.subtitle")}
              </Text>
            </View>
            <View className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
              <Sparkles
                size={24}
                className="text-indigo-600 dark:text-indigo-400"
                fill="currentColor"
                opacity={0.5}
              />
            </View>
          </View>

          {/* CONTENT (opacity se Free) */}
          <View className="px-6" style={{ opacity: isPro ? 1 : 0.2 }}>
            {/* 1. Top Stat Cards */}
            <View className="flex-row gap-4 mb-6">
              <TopStatCard
                title={t("analysis.lucid")}
                value={stats?.lucidPct?.toFixed(0)}
                suffix="%"
                icon={Brain}
                gradientColors={["#8b5cf6", "#6d28d9"]}
                delay={100}
              />
              <TopStatCard
                title={t("analysis.dreams")}
                value={stats?.total ?? 0}
                suffix=""
                icon={BookOpen}
                gradientColors={["#0ea5e9", "#0284c7"]}
                delay={200}
              />
            </View>

            {/* 2. Gráficos */}
            {stats && (
              <>
                <PremiumCard
                  title={t("analysis.recent_frequency")}
                  icon={Activity}
                  colorClass="indigo"
                  delay={300}
                >
                  <FrequencyChart stats={stats} />
                </PremiumCard>

                <PremiumCard
                  title={t("analysis.mood")}
                  icon={Sparkles}
                  colorClass="yellow"
                  delay={400}
                >
                  <MoodBar stats={stats} />
                </PremiumCard>

                <PremiumCard
                  title={t("analysis.routine")}
                  icon={Clock}
                  colorClass="blue"
                  delay={500}
                >
                  <RoutineChart stats={stats} />
                </PremiumCard>

                <PremiumCard
                  title={t("analysis.themes")}
                  icon={TrendingUp}
                  colorClass="purple"
                  delay={600}
                >
                  <ThemesList stats={stats} />
                </PremiumCard>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Overlay Free */}
      {!isPro && <ProOverlay />}
    </View>
  );
}
