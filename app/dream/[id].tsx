import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Edit2,
  Eye,
  MessageCircle,
  MoreVertical,
  Send,
  Share2,
  Smile,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

// Imports internos
import { DreamAnalysisCard } from "@/components/DreamAnalysisCard"; // <--- Seu novo componente
import { useDreamDetail } from "@/hooks/useDreamDetail"; // <--- Seu novo hook
import i18n from "@/lib/i18n";
import useAuthStore from "@/store/auth.store";
import { useTranslation } from "react-i18next";

export default function DreamDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const isPro = user?.profile?.is_pro || false;

  const {
    dream,
    comments,
    loading,
    isAnalyzing,
    handleDeleteDream,
    handleEditDream,
    handleAnalyzeDream,
    handleAddComment,
    handleRemoveComment,
  } = useDreamDetail(id as string, user);

  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const onPostComment = async () => {
    setSendingComment(true);
    const success = await handleAddComment(newComment);
    if (success) setNewComment("");
    setSendingComment(false);
  };

  const GlassButton = ({ onPress, children }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="overflow-hidden rounded-full mx-1"
      activeOpacity={0.7}
    >
      <BlurView
        intensity={30}
        className="p-2.5 bg-white/40 dark:bg-black/30 justify-center items-center"
      >
        {children}
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!dream) return null;
  const isOwner = user?.id === dream.userId;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
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
        {/* HEADER */}
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

        {/* MENU CONTEXTUAL */}
        {showMenu && isOwner && (
          <Animated.View
            entering={FadeIn.duration(200)}
            className="absolute right-4 bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-2xl z-50 border border-gray-100 dark:border-slate-700 w-40"
            style={{ top: insets.top + 60 }}
          >
            <TouchableOpacity
              className="flex-row items-center p-3 border-b border-gray-50 dark:border-slate-700"
              onPress={() => {
                setShowMenu(false);
                handleEditDream();
              }}
            >
              <Edit2
                size={16}
                className="text-slate-600 dark:text-slate-300 mr-3"
              />
              <Text className="text-slate-700 dark:text-white font-medium text-sm">
                {t("dream_detail.edit")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={handleDeleteDream}
            >
              <Trash2 size={16} className="text-red-500 mr-3" />
              <Text className="text-red-500 font-medium text-sm">
                {" "}
                {t("dream_detail.delete")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* CONTEÚDO SCROLLABLE */}
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
            paddingTop: insets.top + 70,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 space-y-6">
            {/* IMAGEM */}
            {dream.imageUrl && (
              <Animated.View
                entering={FadeInDown.duration(700).springify()}
                className="w-full h-[220px] rounded-[40px] overflow-hidden shadow-2xl bg-gray-200 dark:bg-slate-800"
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

            {/* METADADOS */}
            <View>
              <Text className="text-3xl pt-5 font-extrabold text-slate-900 dark:text-white mb-4 leading-[1.1]">
                {dream.title}
              </Text>
              <View className="flex-row items-center mb-4">
                <Image
                  source={{
                    uri: dream.authorAvatar || "https://i.pravatar.cc/150",
                  }}
                  className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900"
                />
                <View className="ml-3">
                  <Text className="text-slate-900 dark:text-white font-bold text-base">
                    {dream.authorName}
                  </Text>
                  <Text className="text-slate-400 text-xs font-medium">
                    {formatDistanceToNow(new Date(dream.date), {
                      locale: i18n.language?.startsWith("pt") ? ptBR : enUS,
                      addSuffix: true,
                    })}
                  </Text>
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

            {/* DESCRIÇÃO E TAGS */}
            <Text className="text-slate-600 dark:text-slate-300 text- leading-[1.8] font-normal">
              {dream.description}
            </Text>
            <View className="flex-row flex-wrap gap-2 pt-1">
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

            {/* AI CARD (Extraído) */}
            <DreamAnalysisCard
              analysis={dream.analysis}
              isAnalyzing={isAnalyzing}
              isPro={isPro}
              onAnalyze={handleAnalyzeDream}
            />

            {/* COMENTÁRIOS */}
            <View className="mt-4">
              <View className="flex-row items-center mb-6 space-x-2">
                <MessageCircle size={18} className="text-slate-400" />
                <Text className="text-slate-900 dark:text-white font-bold text-lg">
                  {t("dream_detail.comments")}
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
                        onPress={() => handleRemoveComment(comment.id)}
                        className="mt-2 ml-2 self-start"
                      >
                        <Text className="text-[10px] font-bold text-red-500 opacity-80">
                          {t("dream_detail.delete")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              ))}

              {comments.length === 0 && (
                <View className="py-10 items-center justify-center opacity-50">
                  <Text className="text-slate-400 text-sm">
                    {t("dream_detail.no_comments")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* INPUT DE COMENTÁRIO */}
        <BlurView
          intensity={Platform.OS === "ios" ? 80 : 0}
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/90"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="px-4 pt-3 flex-row items-center space-x-3">
            <TextInput
              placeholder={t("dream_detail.comment_placeholder")}
              placeholderTextColor="#94a3b8"
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1 bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3.5 rounded-full text-sm font-medium"
              style={{ maxHeight: 100 }}
              multiline
            />
            <TouchableOpacity
              onPress={onPostComment}
              disabled={!newComment.trim() || sendingComment}
              className={`w-12 h-12 rounded-full items-center justify-center shadow-lg ${!newComment.trim() ? "bg-gray-200 dark:bg-slate-700 shadow-none" : "bg-indigo-600 shadow-indigo-500/30"}`}
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
