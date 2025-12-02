import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";

const RealityCheckWidget = () => {
  const [realityChecked, setRealityChecked] = useState(false);
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  const handleRealityCheck = () => {
    setRealityChecked(true);
  };

  return (
    <View className="mb-6 mx-4">
      {!realityChecked ? (
        <Animated.View
          key="check-button"
          entering={FadeInUp.duration(300)}
          exiting={FadeOutUp.duration(200)}
          layout={LinearTransition.springify()}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleRealityCheck}
            className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-500/30 rounded-3xl overflow-hidden shadow-sm"
          >
            {colorScheme === "dark" && (
              <LinearGradient
                colors={["rgba(49, 46, 129, 0.6)", "#1e1b4b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ position: "absolute", width: "100%", height: "100%" }}
              />
            )}

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-full">
                  <MaterialCommunityIcons
                    name="fingerprint"
                    size={24}
                    color={colorScheme === "dark" ? "#818cf8" : "#4f46e5"}
                  />
                </View>

                <View className="pl-3">
                  <Text className="font-bold text-dream-dark dark:text-white text-sm">
                    {t("reality_check_title")}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-indigo-300">
                    {t("reality_check_question")}
                  </Text>
                </View>
              </View>

              <View className="bg-indigo-100 dark:bg-indigo-500 px-3 py-1 rounded-full">
                <Text className="text-indigo-700 dark:text-white text-xs font-bold">
                  {t("reality_check_btn")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View
          key="success-msg"
          entering={FadeInUp.duration(300)}
          // 2. MUDANÇA AQUI TAMBÉM
          layout={LinearTransition.springify()}
          className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 p-3 rounded-2xl flex-row items-center justify-center space-x-2"
        >
          <Feather
            name="check-circle"
            size={16}
            color={colorScheme === "dark" ? "#4ade80" : "#16a34a"}
          />
          <Text className="text-green-700 dark:text-green-300 text-xs font-bold pl-1">
            {t("reality_check_confirmed")}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default RealityCheckWidget;
