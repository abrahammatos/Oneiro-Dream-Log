import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { aiService } from "@/services/ai.service";
import {
  addComment,
  deleteComment,
  fetchComments,
  saveDreamAnalysis,
} from "@/services/dreamService";
import { Dream } from "@/type";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useDreamDetail(id: string, user: any) {
  const router = useRouter();
  const [dream, setDream] = useState<Dream | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Carregar Dados
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("dreams")
          .select(`*, profiles:author_id (id, username, avatar)`)
          .eq("id", id)
          .single();

        if (error) throw error;

        setDream({
          ...data,
          userId: data.author_id,
          imageUrl: data.image_url,
          isLucid: data.is_lucid,
          authorName: data.profiles?.username || "Anônimo",
          authorAvatar: data.profiles?.avatar,
        });

        const commentsData = await fetchComments(id);
        setComments(commentsData);
      } catch (error) {
        Alert.alert("Erro", "Sonho não encontrado.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Ações do Sonho
  const handleDeleteDream = async () => {
    Alert.alert("Excluir", "Tem certeza?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await supabase.from("dreams").delete().eq("id", id);
          router.back();
        },
      },
    ]);
  };

  const handleEditDream = () => {
    if (!dream) return;
    router.push({
      pathname: "/create",
      params: {
        id: dream.id,
        isEditing: "true",
        title: dream.title || "",
        description: dream.description || "",
        imageUrl: dream.imageUrl || "",
        mood: dream.mood || "",
        visibility: dream.visibility || "public",
        isLucid: dream.isLucid ? "true" : "false",
      },
    });
  };

  // Ações de IA
  const handleAnalyzeDream = async () => {
    if (!dream) return;
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeDreamWithGemini(
        dream.title,
        dream.description,
        dream.mood,
        dream.isLucid,
        i18n.language
      );
      await saveDreamAnalysis(dream.id, result);
      setDream((prev) => (prev ? { ...prev, analysis: result } : null));
    } catch (error) {
      Alert.alert("Erro", "Falha na análise IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Ações de Comentários
  const handleAddComment = async (text: string) => {
    if (!text.trim() || !user || !dream) return;
    try {
      const added = await addComment(dream.id, user.id, text);
      const formatted = {
        ...added,
        authorName: user.user_metadata?.username || user.email?.split("@")[0],
        authorAvatar: user.user_metadata?.avatar_url,
      };
      setComments((prev) => [formatted, ...prev]);
      return true;
    } catch {
      Alert.alert("Erro", "Não foi possível comentar.");
      return false;
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      Alert.alert("Erro", "Falha ao apagar.");
    }
  };

  return {
    dream,
    comments,
    loading,
    isAnalyzing,
    handleDeleteDream,
    handleEditDream,
    handleAnalyzeDream,
    handleAddComment,
    handleRemoveComment,
  };
}
