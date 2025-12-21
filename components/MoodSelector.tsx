import { MOODS } from "@/constants/dream";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MoodSelectorProps {
  selectedMood: string;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {MOODS.map((m) => (
        <TouchableOpacity
          key={m.label}
          onPress={() => onSelect(m.label)}
          className={`w-[30%] p-3 rounded-2xl border-2 items-center justify-center ${
            selectedMood === m.label
              ? "bg-indigo-50 border-indigo-500"
              : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
          }`}
        >
          <Text className="text-2xl mb-1">{m.emoji}</Text>
          <Text
            className={`text-xs font-bold ${selectedMood === m.label ? "text-indigo-700" : "text-gray-500"}`}
          >
            {m.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
