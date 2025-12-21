import { Globe, Lock } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

// Define os tipos aceitos
type VisibilityType = "public" | "private";

interface VisibilitySelectorProps {
  value: VisibilityType;
  onChange: (value: VisibilityType) => void;
}

export function VisibilitySelector({
  value,
  onChange,
}: VisibilitySelectorProps) {
  const { t } = useTranslation();

  // Helper para gerar estilos dinâmicos (evita repetição no JSX)
  const getContainerStyle = (isSelected: boolean) =>
    `flex-1 p-4 rounded-2xl border-2 items-center justify-center ${
      isSelected
        ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
        : "bg-transparent border-gray-200 dark:border-slate-800"
    }`;

  const getTextStyle = (isSelected: boolean) =>
    `font-bold mt-2 ${
      isSelected ? "text-blue-700 dark:text-blue-400" : "text-gray-400"
    }`;

  const iconColor = (isSelected: boolean) =>
    isSelected ? "#3B82F6" : "#9CA3AF";

  return (
    <View className="flex-row gap-4 mb-8">
      {/* Opção Pública */}
      <TouchableOpacity
        onPress={() => onChange("public")}
        activeOpacity={0.7}
        className={getContainerStyle(value === "public")}
        accessibilityRole="radio"
        accessibilityState={{ checked: value === "public" }}
      >
        <Globe size={24} color={iconColor(value === "public")} />
        <Text className={getTextStyle(value === "public")}>
          {t("create_dream.public")}
        </Text>
      </TouchableOpacity>

      {/* Opção Privada */}
      <TouchableOpacity
        onPress={() => onChange("private")}
        activeOpacity={0.7}
        className={getContainerStyle(value === "private")}
        accessibilityRole="radio"
        accessibilityState={{ checked: value === "private" }}
      >
        <Lock size={24} color={iconColor(value === "private")} />
        <Text className={getTextStyle(value === "private")}>
          {t("create_dream.private")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
