import { useRouter } from "expo-router";
import { Lock, Moon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Dream {
  id: string;
  title: string;
  date: string;
  mood: string;
  tags?: string[];
  visibility: "public" | "private";
  is_lucid: boolean;
  analysis?: any;
}

interface DreamListProps {
  dreams: Dream[];
}

export default function DreamList({ dreams }: DreamListProps) {
  const router = useRouter();

  // Estado Vazio
  if (!dreams || dreams.length === 0) {
    return (
      <View className="items-center py-10 opacity-60">
        <Moon size={48} className="text-slate-300 mb-4" />
        <Text className="text-slate-400 font-bold text-center">
          Você ainda não tem sonhos registrados.
        </Text>
      </View>
    );
  }

  // Lista de Sonhos
  return (
    <View className="pb-20">
      {dreams.map((dream) => (
        <TouchableOpacity
          key={dream.id}
          onPress={() => router.push(`/dream/${dream.id}` as any)}
          // ⚠️ AQUI ESTÁ SEGURO: Usamos border em vez de shadow
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl mb-3 flex-row justify-between items-center"
        >
          <View className="flex-1 mr-4">
            <Text
              className="text-slate-900 dark:text-white font-bold text-base mb-1"
              numberOfLines={1}
            >
              {dream.title || "Sem título"}
            </Text>
            <Text className="text-slate-500 text-xs mb-1">
              {new Date(dream.date).toLocaleDateString()} •{" "}
              {dream.mood || "Neutro"}
            </Text>

            {/* Tags */}
            {dream.tags && dream.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mt-1">
                {dream.tags.slice(0, 2).map((t, index) => (
                  <Text
                    key={`${t}-${index}`}
                    className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-md"
                  >
                    #{t}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Ícones de Status */}
          <View className="items-end gap-1">
            {dream.visibility === "private" && (
              <Lock size={12} className="text-slate-400" />
            )}
            <View className="flex-row gap-1">
              {dream.is_lucid && (
                <View className="w-2 h-2 rounded-full bg-indigo-500" />
              )}
              {dream.analysis && (
                <View className="w-2 h-2 rounded-full bg-purple-500" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
