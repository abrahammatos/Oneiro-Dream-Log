// 1. Trocamos Feather por FontAwesome para ter a estrela sólida (preenchida)
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, View } from "react-native";

interface Streak {
  streak: number;
}

const HeaderHome = ({ streak }: Streak) => {
  const { colorScheme } = useColorScheme();
  5;
  const iconColor = colorScheme === "dark" ? "#facc15" : "#eab308";

  return (
    <View className="justify-between items-center flex-row w-full my-5 px-6">
      <Text className="flex-start text-2xl font-extrabold text-dream-dark dark:text-dream-light tracking-wide transition-colors">
        Dream Feed
      </Text>

      <View className="bg-white dark:bg-dream-purple/30 p-2 px-3 gap-2 rounded-2xl border border-dream-purple/20 dark:border-dream-purple/50 flex flex-row items-center space-x-2 shadow-sm dark:shadow-[0_4px_0_0_rgba(60,42,77,0.5)]">
        <FontAwesome name="star" size={18} color={iconColor} />
        <Text className="text-dream-purple dark:text-dream-lilac font-bold text-sm">
          {streak}
        </Text>
      </View>
    </View>
  );
};

export default HeaderHome;
