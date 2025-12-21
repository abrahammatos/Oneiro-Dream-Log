import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Edit2,
  Eye,
  Lock,
  MessageCircle,
  MoreVertical,
  Send,
  Share2,
  Smile,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Imports do projeto
import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { aiService } from "@/services/ai.service"; // Ajuste conforme seu arquivo
import {
  addComment,
  deleteComment,
  fetchComments,
  saveDreamAnalysis,
} from "@/services/dreamService";
import useAuthStore from "@/store/auth.store";
import { Dream } from "@/type";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#4F46E5",
  secondary: "#818CF8",
  darkBg: "#0F172A",
  surfaceDark: "#1E293B",
};

export default function DreamDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { user: rawUser } = useAuthStore();
  const user = rawUser as any;
  const insets = useSafeAreaInsets();

  const isPro =
    user?.profile?.is_pro ||
    user?.is_pro ||
    user?.user_metadata?.is_pro ||
    false;

  const [dream, setDream] = useState<Dream | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showMenu, setShowMenu] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: dreamData, error } = await supabase
          .from("dreams")
          .select(`*, profiles:author_id (id, username, avatar)`)
          .eq("id", id)
          .single();

        if (error) throw error;

        setDream({
          ...dreamData,
          // 👇 AQUI: Mapeamento essencial para o isOwner funcionar
          userId: dreamData.author_id,
          imageUrl: dreamData.image_url,
          isLucid: dreamData.is_lucid,
          authorName: dreamData.profiles?.username || "Anônimo",
          authorAvatar: dreamData.profiles?.avatar,
        });

        const commentsData = await fetchComments(id as string);
        setComments(commentsData);
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Sonho não encontrado.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const handleAnalysis = async () => {
    if (!isPro) {
      Alert.alert(
        "Recurso Premium",
        "Apenas usuários Pro podem revelar os mistérios dos sonhos com IA."
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeDreamWithGemini(
        dream!.title,
        dream!.description,
        dream!.mood,
        dream!.isLucid,
        i18n.language
      );
      await saveDreamAnalysis(dream!.id, result);
      setDream((prev) => (prev ? { ...prev, analysis: result } : null));
    } catch (error) {
      Alert.alert("Erro", "Falha na análise IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;
    setSendingComment(true);
    try {
      const addedComment = await addComment(dream!.id, user.id, newComment);
      const formatted = {
        ...addedComment,
        authorName:
          (user as any).user_metadata?.username || user.email?.split("@")[0],
        authorAvatar: (user as any).user_metadata?.avatar_url,
      };
      setComments((prev) => [formatted, ...prev]);
      setNewComment("");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível comentar.");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      Alert.alert("Erro", "Falha ao apagar.");
    }
  };

  const handleEdit = () => {
    if (!dream) return; // Segurança básica

    setShowMenu(false); // Fecha o menu

    // Navega para a tela de criação passando TODOS os dados atuais
    router.push({
      pathname: "/create", // Certifique-se que esta é a rota correta da sua tela de criar/editar
      params: {
        id: dream.id, // ID é crucial para saber qual sonho atualizar
        isEditing: "true", // Uma flag para a tela de destino saber que é modo edição

        // Dados de texto
        title: dream.title || "",
        description: dream.description || "",

        // Dados visuais e de estado
        // Passamos uma string vazia se não houver imagem para não passar "undefined" ou "null"
        imageUrl: dream.imageUrl || "",
        mood: dream.mood || "",
        visibility: dream.visibility || "public",

        // Booleanos precisam ser convertidos para string para passar nos params
        isLucid: dream.isLucid ? "true" : "false",

        // Tags (Opcional: passar arrays via params pode ser chato,
        // se sua tela de create não suportar isso facilmente, pode omitir por enquanto)
        // tags: (dream.tags || []).join(','),
      },
    });
  };

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

  // Componente de Botão do Header com Blur
  const GlassButton = ({ onPress, children }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="overflow-hidden rounded-full mx-1"
      activeOpacity={0.7}
    >
      <BlurView
        intensity={30}
        tint="default"
        className="p-2.5 bg-white/40 dark:bg-black/30 justify-center items-center"
      >
        {children}
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (!dream) return null;

  // Verifica se é dono (Agora funcionará porque mapeamos userId no useEffect)
  const isOwner = user?.id === dream.userId;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      {/* Background Decorativo Sutil */}
      <View className="absolute top-0 left-0 right-0 h-[400px]">
        <LinearGradient
          colors={[
            Platform.OS === "ios"
              ? "rgba(79, 70, 229, 0.1)"
              : "rgba(79, 70, 229, 0.05)",
            "transparent",
          ]}
          style={{ flex: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* --- Header Flutuante --- */}
        <View
          className="absolute top-0 left-0 right-0 z-50 flex-row justify-between items-center px-4"
          style={{ paddingTop: insets.top + 10 }}
        >
          <GlassButton onPress={() => router.back()}>
            <ArrowLeft size={22} className="text-gray-800 dark:text-white" />
          </GlassButton>

          <View className="flex-row">
            <GlassButton
              onPress={() => Share.share({ message: `Sonho: ${dream.title}` })}
            >
              <Share2 size={20} className="text-gray-800 dark:text-white" />
            </GlassButton>

            {isOwner && (
              <GlassButton onPress={() => setShowMenu(!showMenu)}>
                <MoreVertical
                  size={20}
                  className="text-gray-800 dark:text-white"
                />
              </GlassButton>
            )}
          </View>
        </View>

        {/* Menu Contextual (CORRIGIDO E ARREDONDADO) */}
        {showMenu && isOwner && (
          <Animated.View
            entering={FadeIn.duration(200)}
            className="absolute right-4 bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-2xl z-50 border border-gray-100 dark:border-slate-700 w-40"
            style={{ top: insets.top + 60 }}
          >
            <TouchableOpacity
              className="flex-row items-center p-3 border-b border-gray-50 dark:border-slate-700"
              onPress={handleEdit}
            >
              <Edit2
                size={16}
                className="text-slate-600 dark:text-slate-300 mr-3"
              />
              <Text className="text-slate-700 dark:text-white font-medium text-sm">
                Editar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={handleDeleteDream}
            >
              <Trash2 size={16} className="text-red-500 mr-3" />
              <Text className="text-red-500 font-medium text-sm">Excluir</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
            paddingTop: insets.top + 70,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 space-y-8">
            {/* ... Resto do seu código de imagem e conteúdo ... */}

            {dream.imageUrl && (
              <Animated.View
                entering={FadeInDown.duration(700).springify()}
                className="w-full h-[220px] rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-500/20 bg-gray-200 dark:bg-slate-800"
              >
                <Image
                  source={{ uri: dream.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)"]}
                  className="absolute bottom-0 left-0 right-0 h-24"
                />
              </Animated.View>
            )}

            <View className="mt-6">
              <Text className="text-[34px] font-extrabold text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tight">
                {dream.title}
              </Text>

              <View className="flex-row items-center mb-6">
                <View className="p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full">
                  <Image
                    source={{
                      uri: dream.authorAvatar || "https://i.pravatar.cc/150",
                    }}
                    className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900"
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-slate-900 dark:text-white font-bold text-base">
                    {dream.authorName}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-xs font-medium">
                      {formatDistanceToNow(new Date(dream.date), {
                        locale: i18n.language?.startsWith("pt") ? ptBR : enUS,
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </View>

                <View className="ml-auto flex-row gap-2">
                  {dream.isLucid && (
                    <View className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
                      <Eye
                        size={16}
                        className="text-purple-600 dark:text-purple-300"
                      />
                    </View>
                  )}
                  {dream.mood && (
                    <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
                      <Smile
                        size={16}
                        className="text-orange-600 dark:text-orange-300"
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Text className="text-slate-600 dark:text-slate-300 text-[18px] leading-[1.8] font-normal">
              {dream.description}
            </Text>

            <View className="flex-row flex-wrap gap-2 pt-2">
              {dream.tags?.map((t: string, i: number) => (
                <View
                  key={i}
                  className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full"
                >
                  <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold">
                    #{t}
                  </Text>
                </View>
              ))}
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(800)}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[32px] p-1 shadow-xl shadow-indigo-500/30 my-4"
              >
                <View className="bg-white/10 p-6 rounded-[30px] backdrop-blur-sm">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                      <Sparkles size={20} color="#FFD700" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-lg">
                        Oneiro AI
                      </Text>
                      <Text className="text-indigo-100 text-xs">
                        Interpretação dos Símbolos
                      </Text>
                    </View>
                  </View>

                  {dream.analysis ? (
                    <Animated.View entering={FadeIn}>
                      <Text className="text-white text-[15px] leading-relaxed font-medium opacity-95">
                        {dream.analysis}
                      </Text>
                    </Animated.View>
                  ) : (
                    <View className="items-center py-2">
                      <Text className="text-indigo-100 text-center text-sm mb-6 px-4">
                        Descubra os significados ocultos deste sonho através da
                        nossa inteligência artificial.
                      </Text>

                      <TouchableOpacity
                        onPress={handleAnalysis}
                        disabled={isAnalyzing}
                        activeOpacity={0.8}
                        className="bg-white px-8 py-3 rounded-full flex-row items-center shadow-lg"
                      >
                        {isAnalyzing ? (
                          <ActivityIndicator size="small" color="#4F46E5" />
                        ) : (
                          <>
                            {!isPro && (
                              <Lock
                                size={14}
                                color="#4F46E5"
                                style={{ marginRight: 8 }}
                              />
                            )}
                            <Text className="text-indigo-700 font-bold text-sm">
                              {isPro
                                ? "Revelar Significado"
                                : "Desbloquear (Pro)"}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>

            <View className="mt-4">
              <View className="flex-row items-center mb-6 space-x-2">
                <MessageCircle size={18} className="text-slate-400" />
                <Text className="text-slate-900 dark:text-white font-bold text-lg">
                  Comentários{" "}
                  <Text className="text-slate-400 font-normal">
                    ({comments.length})
                  </Text>
                </Text>
              </View>

              {comments.map((comment, index) => (
                <Animated.View
                  key={comment.id}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                  layout={Layout.springify()}
                  className="flex-row space-x-3 mb-5"
                >
                  <Image
                    source={{
                      uri: comment.authorAvatar || "https://i.pravatar.cc/150",
                    }}
                    className="w-10 h-10 rounded-full bg-gray-200 mt-1"
                  />
                  <View className="flex-1">
                    <View className="bg-gray-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-bold text-xs text-slate-800 dark:text-white">
                          {comment.authorName}
                        </Text>
                        <Text className="text-[10px] text-slate-400">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            locale: i18n.language?.startsWith("pt")
                              ? ptBR
                              : enUS,
                          })}
                        </Text>
                      </View>
                      <Text className="text-slate-700 dark:text-slate-300 text-sm leading-snug">
                        {comment.text}
                      </Text>
                    </View>

                    {user?.id === comment.user_id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(comment.id)}
                        className="mt-2 ml-2 self-start"
                      >
                        <Text className="text-[10px] font-bold text-red-500 opacity-80">
                          Excluir
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              ))}

              {comments.length === 0 && (
                <View className="py-10 items-center justify-center opacity-50">
                  <Text className="text-slate-400 text-sm">
                    Nenhum comentário ainda.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <BlurView
          intensity={Platform.OS === "ios" ? 80 : 0}
          tint="default"
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/90"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="px-4 pt-3 flex-row items-center space-x-3">
            <TextInput
              placeholder="Escreva seu pensamento..."
              placeholderTextColor="#94a3b8"
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1 bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3.5 rounded-full text-sm font-medium"
              style={{ maxHeight: 100 }}
              multiline
            />
            <TouchableOpacity
              onPress={handlePostComment}
              disabled={!newComment.trim() || sendingComment}
              className={`w-12 h-12 rounded-full items-center justify-center shadow-lg ${
                !newComment.trim()
                  ? "bg-gray-200 dark:bg-slate-700 shadow-none"
                  : "bg-indigo-600 shadow-indigo-500/30"
              }`}
            >
              {sendingComment ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send
                  size={20}
                  color={!newComment.trim() ? "#94a3b8" : "white"}
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}
