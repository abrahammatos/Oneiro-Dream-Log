import { ImageIcon, Lock, Wand2, X } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImageGeneratorProps {
  imageUrl: string | null;
  isPro: boolean;
  isLoading: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
  onClear: () => void;
}

export function ImageGenerator({
  imageUrl,
  isPro,
  isLoading,
  canGenerate,
  onGenerate,
  onClear,
}: ImageGeneratorProps) {
  const { t } = useTranslation();

  const handlePress = () => {
    if (!isPro) {
      Alert.alert(
        t("create_dream.pro_feature_title"),
        t("create_dream.pro_feature_desc")
      );
      return;
    }

    if (!canGenerate) {
      Alert.alert(t("common.ops"), t("create_dream.fill_title_desc"));
      return;
    }

    onGenerate();
  };

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        <View className="flex-row items-center">
          <ImageIcon size={14} color="#6B7280" className="mr-1" />
          <Text className="text-sm font-bold text-gray-500">
            {t("create_dream.cover_title_ai")}
          </Text>
        </View>

        {!isPro && (
          <View className="flex-row items-center bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
            <Lock size={10} color="#CA8A04" />
            <Text className="ml-1 text-[10px] font-bold text-amber-600">
              PRO
            </Text>
          </View>
        )}
      </View>

      {/* Área da Imagem */}
      {imageUrl ? (
        <View className="relative h-56 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <Image
            source={{ uri: imageUrl }}
            resizeMode="cover"
            className="w-full h-full"
          />

          <TouchableOpacity
            onPress={onClear}
            className="absolute top-3 right-3 bg-black/50 p-2 rounded-full"
          >
            <X size={16} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="min-h-[180px] bg-gray-50 dark:bg-dream-dark border-2 border-dashed border-gray-200 rounded-2xl p-6 items-center justify-center">
          <Text className="text-xs text-gray-400 text-center mb-4 max-w-[200px]">
            {isPro
              ? t("create_dream.cover_ai_description")
              : t("create_dream.cover_unlock_description")}
          </Text>

          <TouchableOpacity
            onPress={handlePress}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`
              flex-row items-center px-5 py-3 rounded-xl border
              ${
                !isPro
                  ? "bg-gray-50 border-gray-200 opacity-80"
                  : canGenerate
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-gray-100 border-gray-200"
              }
            `}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <>
                {isPro ? (
                  <Wand2 size={18} color="#4F46E5" className="mr-2" />
                ) : (
                  <Lock size={16} color="#9CA3AF" className="mr-2" />
                )}

                <Text
                  className={`text-sm font-bold ${
                    isPro ? "text-indigo-600" : "text-gray-500"
                  }`}
                >
                  {isPro
                    ? t("create_dream.cover_generate_magic")
                    : t("create_dream.cover_unlock_button")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
