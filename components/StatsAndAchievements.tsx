import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

const ACHIEVEMENTS = [
  { id: 1, key: "first_dream", icon: "🌱", condition: (c: number) => c >= 1 },
  { id: 2, key: "dreamer", icon: "🌙", condition: (c: number) => c >= 5 },
  { id: 3, key: "visionary", icon: "🔮", condition: (c: number) => c >= 20 },
  {
    id: 4,
    key: "lucid",
    icon: "👁️",
    condition: (_: number, l: number) => l >= 1,
  },
  { id: 5, key: "traveler", icon: "🚀", condition: (c: number) => c >= 50 },
  { id: 6, key: "master", icon: "👑", condition: (c: number) => c >= 100 },
];
export function StatsAndAchievements({
  stats,
  sleepTime,
}: {
  stats: any;
  sleepTime: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View>
      {/* Stats Cards */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 items-center">
          <Text className="text-indigo-600 font-black text-3xl mb-1">
            {stats.total}
          </Text>
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            {t("stats.dreams")}
          </Text>
        </View>
        <View className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 items-center">
          <Text className="text-yellow-500 font-black text-3xl mb-1">
            🔥 {stats.streak}
          </Text>
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            {t("stats.streak")}
          </Text>
        </View>
      </View>

      {/* Sleep Goal */}
      <View className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <View className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-full">
            <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
          </View>
          <View>
            <Text className="text-slate-900 dark:text-white font-bold text-sm">
              {t("stats.sleep_goal")}
            </Text>
            <Text className="text-slate-500 text-xs">
              {t("stats.sleep_hint")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg"
        >
          <Text className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {sleepTime}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Achievements Grid */}
      <View className="mb-6">
        <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4 ml-1">
          {t("stats.achievements")}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = ach.condition(stats.total, stats.lucid);
            return (
              <View
                key={ach.id}
                className={`w-[30%] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3 items-center ${unlocked ? "opacity-100" : "opacity-40 grayscale"}`}
              >
                <Text className="text-2xl mb-1">{ach.icon}</Text>
                <Text className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center">
                  {t(`achievements.${ach.key}`)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
