import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// --- SMALL TOP CARD ---
export const TopStatCard = ({
  title,
  value,
  suffix,
  icon: Icon,
  gradientColors,
  delay = 0,
}: any) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    className="flex-1"
  >
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-5 rounded-[28px] shadow-lg shadow-purple-500/30 relative overflow-hidden h-42"
    >
      <Icon
        size={110}
        color="white"
        opacity={0.12}
        className="absolute -right-5 -bottom-5"
      />
      <View className="flex-1 justify-between z-10">
        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-sm">
          <Icon size={24} color="white" />
        </View>
        <View className="pb-1">
          <Text className="text-white/90 text-[11px] font-bold uppercase tracking-widest mb-1">
            {title}
          </Text>
          <Text className="text-4xl font-black text-white shadow-sm leading-tight">
            {value}
            {suffix}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </Animated.View>
);

// --- LARGE PREMIUM CARD ---
export const PremiumCard = ({
  children,
  delay = 0,
  title,
  icon: Icon,
  colorClass,
}: any) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const getGradientColors = (): [string, string, ...string[]] => {
    const opacityStart = isDark ? "0.15" : "0.1";
    const opacityEnd = isDark ? "0.05" : "0.02";
    const colors: Record<string, string[]> = {
      purple: [
        `rgba(139, 92, 246, ${opacityStart})`,
        `rgba(139, 92, 246, ${opacityEnd})`,
      ],
      blue: [
        `rgba(59, 130, 246, ${opacityStart})`,
        `rgba(59, 130, 246, ${opacityEnd})`,
      ],
      yellow: [
        `rgba(234, 179, 8, ${opacityStart})`,
        `rgba(234, 179, 8, ${opacityEnd})`,
      ],
      indigo: [
        `rgba(99, 102, 241, ${opacityStart})`,
        `rgba(99, 102, 241, ${opacityEnd})`,
      ],
    };
    const selected =
      colors[colorClass] ||
      (isDark
        ? ["rgba(30, 41, 59, 0.6)", "rgba(15, 23, 42, 0.6)"]
        : ["rgba(255, 255, 255, 1)", "rgba(248, 250, 252, 1)"]);
    return selected as [string, string, ...string[]];
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay)} className="mb-6">
      <LinearGradient
        colors={getGradientColors()}
        className={`p-5 rounded-3xl border border-${colorClass || "gray"}-200/50 dark:border-${colorClass || "gray"}-800/30 shadow-sm`}
        style={{
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "transparent",
        }}
      >
        <View className="flex-row items-center gap-2 mb-5">
          <View
            className={`p-2 rounded-xl bg-${colorClass}-100 dark:bg-${colorClass}-900/40`}
          >
            <Icon
              size={18}
              className={`text-${colorClass}-600 dark:text-${colorClass}-400`}
            />
          </View>
          <Text className="font-bold text-slate-900 dark:text-white text-base">
            {title}
          </Text>
        </View>
        {children}
      </LinearGradient>
    </Animated.View>
  );
};
