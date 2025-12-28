import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Imports internos
import { DreamExploreCard } from "@/components/DreamExploreCard";
import { ExploreHeader } from "@/components/ExploreHeader";
import { useExplore } from "@/hooks/useExplore";

export default function ExploreScreen() {
  const { t } = useTranslation();

  // Hook que controla toda a lógica
  const { query, setQuery, dreams, loading, refreshing, onRefresh } =
    useExplore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <FlatList
        data={dreams}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <DreamExploreCard item={item} index={index} />
        )}
        // Header Componentizado
        ListHeaderComponent={
          <ExploreHeader
            query={query}
            setQuery={setQuery}
            loading={loading}
            resultsCount={dreams.length}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center py-20 opacity-50">
              <Text className="text-4xl mb-2">🌑</Text>
              <Text className="text-slate-500 font-bold">
                {t("explore.empty")}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
