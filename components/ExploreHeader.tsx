import { Search } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SUGGESTED_TOPICS = [
  "Voo",
  "Pesadelo",
  "Lúcido",
  "Água",
  "Cair",
  "Animais",
];

interface Props {
  query: string;
  setQuery: (text: string) => void;
  loading: boolean;
  resultsCount: number;
}

export function ExploreHeader({
  query,
  setQuery,
  loading,
  resultsCount,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="mb-4 pt-2 my-5">
      <Text className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        {t("explore.title")}
      </Text>

      {/* Barra de Busca */}
      <View className="relative mb-6">
        <TextInput
          placeholder={t("explore.searchPlaceholder")}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          className="bg-white dark:bg-slate-900 pl-12 pr-4 py-4 rounded-2xl text-slate-900 dark:text-white border border-gray-200 dark:border-slate-800 shadow-sm font-medium"
        />
        <Search size={20} className="absolute left-4 top-4 text-indigo-500" />
        {loading && (
          <View className="absolute right-4 top-4">
            <ActivityIndicator size="small" color="#6366f1" />
          </View>
        )}
      </View>

      {/* Tópicos Sugeridos (Só aparece se não estiver buscando) */}
      {!query && (
        <View className="mb-2">
          <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            {t("explore.trending")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTED_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic}
                onPress={() => setQuery(topic)}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-xl active:scale-95"
              >
                <Text className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  #{t(`${topic}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Contador de Resultados */}
      {!!query && (
        <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          {t("explore.results", { count: resultsCount })}
        </Text>
      )}
    </View>
  );
}
