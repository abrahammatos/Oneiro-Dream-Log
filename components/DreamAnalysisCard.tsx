import { LinearGradient } from "expo-linear-gradient";
import { Lock, Sparkles } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface Props {
  analysis?: string;
  isAnalyzing: boolean;
  isPro: boolean;
  onAnalyze: () => void;
}

export function DreamAnalysisCard({
  analysis,
  isAnalyzing,
  isPro,
  onAnalyze,
}: Props) {
  const handlePress = () => {
    if (!isPro) {
      // Você pode disparar um alerta ou modal de upgrade aqui
      alert("Recurso Premium necessário");
      return;
    }
    onAnalyze();
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(800)}>
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-[32px] p-1 shadow-xl shadow-indigo-500/30 my-4"
      >
        <View className="bg-white/10 p-6 rounded-[30px] backdrop-blur-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
              <Sparkles size={20} color="#FFD700" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Oneiro AI</Text>
              <Text className="text-indigo-100 text-xs">
                Interpretação dos Símbolos
              </Text>
            </View>
          </View>

          {analysis ? (
            <Animated.View entering={FadeIn}>
              <Text className="text-white text-[15px] leading-relaxed font-medium opacity-95">
                {analysis}
              </Text>
            </Animated.View>
          ) : (
            <View className="items-center py-2">
              <Text className="text-indigo-100 text-center text-sm mb-6 px-4">
                Descubra os significados ocultos deste sonho através da nossa
                inteligência artificial.
              </Text>

              <TouchableOpacity
                onPress={handlePress}
                disabled={isAnalyzing}
                activeOpacity={0.8}
                className="bg-white px-8 py-3 rounded-full flex-row items-center shadow-lg"
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
                ) : (
                  <>
                    {!isPro && (
                      <Lock
                        size={14}
                        color="#4F46E5"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text className="text-indigo-700 font-bold text-sm">
                      {isPro ? "Revelar Significado" : "Desbloquear (Pro)"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
