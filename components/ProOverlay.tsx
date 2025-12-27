import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Crown } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export const ProOverlay = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <BlurView
      intensity={Platform.OS === "ios" ? 30 : 100}
      tint="dark"
      className="absolute top-0 left-0 right-0 bottom-0 z-50 justify-center items-center px-8"
    >
      <View className="absolute inset-0 bg-black/50" />
      <Animated.View
        entering={FadeInUp.springify()}
        className="bg-white dark:bg-slate-900/90 w-full p-8 rounded-[32px] items-center shadow-2xl border border-white/20 backdrop-blur-xl"
      >
        <View className="bg-gradient-to-br from-yellow-400 to-orange-500 p-5 rounded-full mb-6 shadow-lg shadow-orange-500/50">
          <Crown size={40} color="white" fill="white" />
        </View>

        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-3 text-center tracking-tight">
          {t("proOverlay.title")} {/* Desbloqueie o Seu Subconsciente */}
        </Text>

        <Text className="text-slate-600 dark:text-slate-300 text-center mb-8 leading-7 text-base font-medium">
          {t("proOverlay.description")}
          {/* Visualize padrões ocultos, acompanhe sua rotina de sono e tenha acesso
              a todas as métricas avançadas com o Oneiro Pro. */}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          activeOpacity={0.9}
          className="w-full shadow-xl shadow-orange-500/30"
        >
          <LinearGradient
            colors={["#6366f1", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 rounded-full items-center"
          >
            <Text className="text-white font-black text-lg uppercase tracking-widest">
              {t("proOverlay.cta")} {/* Seja Pro Agora */}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-slate-500 dark:text-slate-400 font-bold text-sm">
            {t("proOverlay.cancel")} {/* Talvez depois */}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </BlurView>
  );
};
