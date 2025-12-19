import { DreamCard } from "@/components/Dreamcard";
import Filter from "@/components/Filter";
import HeaderHome from "@/components/HeaderHome";
import RealityCheckWidget from "@/components/RealityCheckWidget";
import i18n from "@/lib/i18n";
import { fetchDreamsFeed, toggleDreamLike } from "@/services/dreamService";
import useAuthStore from "@/store/auth.store";
import { Dream } from "@/type";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 10;

export default function Index() {
  const { user, isAuthenticated } = useAuthStore();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [filter, setFilter] = useState<"recent" | "popular">("recent");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadDreams = useCallback(
    async (
      pageNumber: number,
      shouldRefresh = false,
      currentFilter = filter
    ) => {
      if (!shouldRefresh && !hasMore) return;

      try {
        if (shouldRefresh) setLoading(true);

        const offset = pageNumber * PAGE_SIZE;

        const deviceLang = i18n.language ? i18n.language.split("-")[0] : "en";

        const newData = await fetchDreamsFeed(
          user?.id,
          deviceLang, // Enviamos o idioma do celular
          currentFilter,
          PAGE_SIZE,
          offset
        );

        if (shouldRefresh) {
          setDreams(newData);
        } else {
          setDreams((prev) => [...prev, ...newData]);
        }

        setHasMore(newData.length >= PAGE_SIZE);
      } catch (error) {
        console.error("Erro ao carregar sonhos:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // Adicione i18n.language nas dependências para recarregar se o idioma mudar
    [user?.id, filter, i18n.language]
  );

  // --- Efeitos ---

  useEffect(() => {
    loadDreams(0, true, "recent");
  }, [user?.id, i18n.language]); // Recarrega se mudar o idioma

  // ... (Restante do código: handleFilterChange, handleToggleLike, etc, continua igual)

  // ... Mantendo o restante do código igual para economizar espaço ...

  // Apenas certifique-se que as funções abaixo estão no seu arquivo:
  const handleFilterChange = (newFilter: "recent" | "popular") => {
    if (newFilter === filter) return;
    setFilter(newFilter);
    setPage(0);
    setHasMore(true);
    setDreams([]);
    loadDreams(0, true, newFilter);
  };

  const handleToggleLike = async (dreamId: string) => {
    if (!isAuthenticated || !user?.id) return;
    setDreams((currentDreams) =>
      currentDreams.map((dream) => {
        if (dream.id === dreamId) {
          const isLiking = !dream.hasLiked;
          return {
            ...dream,
            hasLiked: isLiking,
            likes: isLiking ? dream.likes + 1 : dream.likes - 1,
          };
        }
        return dream;
      })
    );
    try {
      await toggleDreamLike(dreamId, user.id);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    loadDreams(0, true, filter);
  };

  const handleEndReached = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadDreams(nextPage, false, filter);
    }
  };

  return (
    <SafeAreaView className="flex-1 dark:bg-dream-dark">
      <FlashList<Dream>
        data={dreams}
        renderItem={({ item }) => (
          <DreamCard
            item={item}
            onToggleLike={() => handleToggleLike(item.id)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 20 }}
        contentContainerClassName="pb-32"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={["#4F46E5"]}
          />
        }
        ListHeaderComponent={() => (
          <View>
            <HeaderHome streak={user?.streak || 0} />
            <RealityCheckWidget />
            <Filter activeFilter={filter} onChangeFilter={handleFilterChange} />
          </View>
        )}
        ListFooterComponent={() =>
          loading && !refreshing && dreams.length > 0 ? (
            <View className="py-6">
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>
          ) : null
        }
        ListEmptyComponent={() =>
          !loading ? (
            <View className="items-center py-20 px-6 opacity-60">
              <Text className="text-slate-800 dark:text-dream-light font-bold text-center">
                Nada por aqui... 😴
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
