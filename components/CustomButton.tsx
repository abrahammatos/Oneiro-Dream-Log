import { CustomButtonProps } from "@/type";
import cn from "clsx";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// Mapeamento de estilos para o Container (View/Gradient)
const CONTAINER_VARIANTS = {
  primary: "bg-dream-blue border-b-4 border-blue-600",
  secondary:
    "bg-white dark:bg-dream-surface border-2 border-dream-purple/20 dark:border-dream-purple border-b-4 border-b-dream-purple/50",
  danger: "bg-red-500 border-b-4 border-red-700",
  ghost: "bg-transparent",
  premium: "w-full rounded-2xl py-3 px-4 border-b-4 border-purple-700", // Estilo base do gradiente
};

// Mapeamento de estilos para o Texto
const TEXT_VARIANTS = {
  primary: "text-dream-dark",
  secondary: "text-dream-purple dark:text-dream-lilac",
  ghost: "text-dream-purple dark:text-dream-lilac",
  danger: "text-white",
  premium: "text-white",
};

const CustomButton = ({
  onPress,
  title = "Click Me",
  variant = "primary",
  style,
  textStyle,
  leftIcon,
  isLoading = false,
  disabled = false,
  className, // Caso você queira passar classes extras de fora
}: CustomButtonProps & { className?: string }) => {
  const { colorScheme } = useColorScheme();

  // Definição da cor do loader
  const loaderColor =
    variant === "primary"
      ? "#1e1b4b"
      : colorScheme === "dark"
        ? "#ffffff"
        : "#4c1d95";

  const ButtonContent = () => (
    <View className="flex-row items-center justify-center space-x-2">
      {isLoading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={cn(
              "font-extrabold text-base",
              TEXT_VARIANTS[variant] || TEXT_VARIANTS.primary, // Fallback
              textStyle // Aceita estilos customizados se passar
            )}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.8}
      style={style}
      // Aqui o cn brilha: combina largura, margem, opacidade condicional e classes extras
      className={cn("w-full mb-3", disabled && "opacity-50", className)}
    >
      {variant === "premium" ? (
        <LinearGradient
          colors={["#c084fc", "#a855f7"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={cn(CONTAINER_VARIANTS.premium)}
        >
          <ButtonContent />
        </LinearGradient>
      ) : (
        <View
          className={cn(
            "w-full rounded-2xl py-3 px-4",
            CONTAINER_VARIANTS[variant] || CONTAINER_VARIANTS.primary
          )}
        >
          <ButtonContent />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
