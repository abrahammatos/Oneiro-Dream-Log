import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Filter = () => {
  // Estado para controlar qual filtro está ativo
  const [filter, setFilter] = useState<"all" | "popular">("all");

  return (
    // Adicionei 'flex-row' e 'px-4' (padding horizontal) para não colar na borda
    <View className="flex-row space-x-3 py-2 mb-5 px-4 gap-4 bg-dream-light/95 dark:bg-dream-dark/95 z-20 border-b border-gray-100 dark:border-slate-800/50">
      {/* Botão RECENT */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setFilter("all")}
        className={`px-5 py-2 rounded-xl border transition-all ${
          filter === "all"
            ? "bg-dream-blue border-dream-blue shadow-sm" // Estilo Ativo
            : "bg-white dark:bg-dream-surface border-gray-200 dark:border-dream-purple" // Estilo Inativo
        }`}
      >
        <Text
          className={`font-bold text-sm ${
            filter === "all"
              ? "text-white dark:text-dream-dark" // Texto Ativo
              : "text-dream-purple dark:text-dream-lilac" // Texto Inativo
          }`}
        >
          Recent
        </Text>
      </TouchableOpacity>

      {/* Botão POPULAR */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setFilter("popular")}
        className={`px-5 py-2 rounded-xl border transition-all ${
          filter === "popular"
            ? "bg-dream-blue border-dream-blue shadow-sm"
            : "bg-white dark:bg-dream-surface border-gray-200 dark:border-dream-purple"
        }`}
      >
        <Text
          className={`font-bold text-sm ${
            filter === "popular"
              ? "text-white dark:text-dream-dark"
              : "text-dream-purple dark:text-dream-lilac"
          }`}
        >
          Popular
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Filter;
