import { useRouter } from "expo-router";
import { Heart, User } from "lucide-react-native";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Props {
  item: any;
  index: number;
}

// 1. Defina o componente como uma função nomeada primeiro
const DreamCardComponent = ({ item, index }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity
        activeOpacity={0.9}
        // Nota: O router.push pode reclamar de tipagem em alguns setups,
        // o "as any" resolve rápido, ou você pode tipar a rota corretamente.
        onPress={() => router.push(`/dream/${item.id}` as any)}
        className="mb-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2 ">
          <View className="flex-row items-center gap-2">
            {item.profiles?.avatar ? (
              <Image
                source={{ uri: item.profiles.avatar }}
                className="w-8 h-8 rounded-full bg-gray-200"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 items-center justify-center">
                <User
                  size={14}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </View>
            )}
            <View>
              <Text className="text-xs text-slate-500 font-bold">
                {item.profiles?.name || t("explore.anonymous")}
              </Text>
              <Text className="text-[10px] text-slate-400">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">
            <Heart size={12} className="text-rose-500" fill="#f43f5e" />
            <Text className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {item.likes || 0}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-black text-slate-900 dark:text-white mb-1">
          {item.title}
        </Text>
        <Text
          numberOfLines={2}
          className="text-slate-600 dark:text-slate-400 text-sm leading-5 mb-3"
        >
          {item.description}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {item.tags?.slice(0, 3).map((tag: string) => (
            <Text key={tag} className="text-xs font-bold text-indigo-500">
              #{tag}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 2. Exporte a versão memorizada
export const DreamExploreCard = memo(DreamCardComponent);
