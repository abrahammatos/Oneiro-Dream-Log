import { AnalysisStats } from "@/hooks/useAnalysis";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

interface Props {
  stats: AnalysisStats;
}

export const FrequencyChart = ({ stats }: Props) => {
  return (
    <View className="flex-row justify-between items-end px-1 h-32">
      {stats.weeklyData.map((d, i) => {
        const height = (d.count / (stats.maxDailyDreams || 1)) * 100;
        const finalHeight = height === 0 ? 5 : height;

        return (
          <View key={i} className="items-center w-8 gap-2">
            <View className="h-24 w-full justify-end items-center">
              <Animated.View
                style={{ height: `${finalHeight}%` }}
                className={`w-3 rounded-full ${
                  d.count > 0
                    ? "bg-indigo-500 dark:bg-indigo-400"
                    : "bg-gray-200 dark:bg-slate-700"
                }`}
              />
            </View>
            <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
export const MoodBar = ({ stats }: { stats: AnalysisStats }) => {
  const { t } = useTranslation();

  return (
    <>
      <View className="h-6 w-full bg-gray-100 dark:bg-slate-800/50 rounded-full overflow-hidden flex-row mb-3 shadow-inner">
        {stats.positiveCount > 0 && (
          <View
            style={{ flex: stats.positiveCount }}
            className="h-full bg-emerald-500"
          />
        )}
        {stats.nightmareCount > 0 && (
          <View
            style={{ flex: stats.nightmareCount }}
            className="h-full bg-rose-500"
          />
        )}
        {stats.total === 0 && (
          <View className="flex-1 bg-gray-200 dark:bg-slate-800" />
        )}
      </View>
      <View className="flex-row justify-between px-1">
        <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {t("analysis.positive", "Positivo")} ({stats.positiveCount})
        </Text>
        <Text className="text-xs font-bold text-rose-600 dark:text-rose-400">
          {t("analysis.nightmare", "Desafiador")} ({stats.nightmareCount})
        </Text>
      </View>
    </>
  );
};

export const RoutineChart = ({ stats }: { stats: AnalysisStats }) => {
  const { t } = useTranslation();

  return (
    <>
      <View className="flex-row items-center gap-4">
        <View className="flex-1 items-center">
          <Text className="font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t("analysis.morning", "Manhã")} ☀️
          </Text>
          <View className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <View
              style={{ width: `${stats.morningPct}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </View>
          <Text className="text-xs font-bold text-blue-500 mt-1">
            {stats.morningPct}%
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t("analysis.night", "Noite")} 🌙
          </Text>
          <View className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <View
              style={{ width: `${100 - stats.morningPct}%` }}
              className="h-full bg-indigo-800 rounded-full"
            />
          </View>
          <Text className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mt-1">
            {100 - stats.morningPct}%
          </Text>
        </View>
      </View>
      <Text className="text-center text-xs text-slate-500 mt-4 italic">
        {t(
          "analysis.basedOnTime",
          "Baseado no horário que você salva o sonho."
        )}
      </Text>
    </>
  );
};

export const ThemesList = ({ stats }: { stats: AnalysisStats }) => {
  const { t } = useTranslation();

  return (
    <View className="space-y-5">
      {stats.sortedTags && stats.sortedTags.length > 0 ? (
        stats.sortedTags.map(([tag, count], index) => (
          <View key={tag}>
            <View className="flex-row justify-between mb-2 items-center">
              <View className="flex-row items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                <Text className="text-xs font-black text-slate-400 dark:text-slate-500">
                  #{index + 1}
                </Text>
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {tag}
                </Text>
              </View>
              <Text className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {count}x
              </Text>
            </View>
            <View className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <View
                style={{
                  width: `${(count / (stats.maxTagCount || 1)) * 100}%`,
                }}
                className={`h-full rounded-full ${
                  index === 0 ? "bg-amber-500" : "bg-purple-500"
                }`}
              />
            </View>
          </View>
        ))
      ) : (
        <Text className="text-slate-400 text-center text-sm py-2 font-medium">
          {t("analysis.noData", "Sem dados suficientes.")}
        </Text>
      )}
    </View>
  );
};
