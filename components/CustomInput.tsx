import { CustomInputProps } from "@/type";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

const CustomInput = ({
  placeholder = "e.g Alice Walker",
  value,
  onChangeText,
  label,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colorScheme } = useColorScheme();

  const placeholderColor =
    colorScheme === "dark"
      ? "rgba(233, 213, 255, 0.5)"
      : "rgba(109, 40, 217, 0.5)";

  return (
    <View className="mb-4">
      {/* Label */}
      {label && (
        <Text className="text-dream-purple dark:text-dream-lilac text-sm font-bold mb-2 ml-1">
          {label}
        </Text>
      )}

      {/* Input */}
      <TextInput
        autoCapitalize="none"
        value={value}
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full    
          bg-white dark:bg-dream-surface 
          border-2 
          rounded-2xl 
          px-4 py-3 
          text-dream-dark dark:text-dream-light
          ${
            isFocused
              ? "border-dream-blue" // Cor quando focado (focus:border-dream-blue)
              : "border-dream-purple/20 dark:border-dream-purple" // Cor padrão
          }
        `}
      />
    </View>
  );
};

export default CustomInput;
