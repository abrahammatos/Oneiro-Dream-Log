import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ImageGenerator } from "@/components/ImageGenerator";
import { MoodSelector } from "@/components/MoodSelector";
import { VisibilitySelector } from "@/components/VisibilitySelector";
import { useCreateDream } from "@/hooks/useCreateDream";
import { supabase } from "@/lib/supabase";

export default function CreateScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  // Verifica se é edição
  const isEditing = params.isEditing === "true";
  const dreamIdToEdit = params.id as string;

  const {
    form,
    updateForm,
    loading,
    isPro,
    generateImage,
    submitDream,
    resetForm,
  } = useCreateDream();

  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // 1. GARANTE A LIMPEZA AO ENTRAR/SAIR
  // O useFocusEffect roda toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      // Se NÃO for edição (é um sonho novo), limpamos o formulário
      // para garantir que não tenha lixo de um sonho anterior.
      if (!isEditing) {
        resetForm();
      }

      // Cleanup opcional ao sair da tela
      return () => {
        // Se desejar limpar sempre que sair, descomente abaixo:
        // resetForm();
      };
    }, [isEditing]) // Roda quando o modo muda
  );

  // 2. PREENCHE DADOS SE FOR EDIÇÃO
  useEffect(() => {
    if (isEditing) {
      if (params.title) updateForm("title", params.title as string);
      if (params.description)
        updateForm("description", params.description as string);
      if (params.mood) updateForm("mood", params.mood as string);
      if (params.imageUrl) updateForm("imageUrl", params.imageUrl as string);
      if (params.visibility)
        updateForm("visibility", params.visibility as "public" | "private");
      updateForm("isLucid", params.isLucid === "true");
    }
    // Se não for edição, o useFocusEffect acima já limpou tudo.
  }, [dreamIdToEdit]); // Roda apenas se o ID mudar

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert("Ops", "Título e descrição são obrigatórios.");
      return;
    }

    if (isEditing) {
      // --- MODO EDIÇÃO ---
      setIsSavingEdit(true);
      try {
        const { error } = await supabase
          .from("dreams")
          .update({
            title: form.title,
            description: form.description,
            mood: form.mood,
            is_lucid: form.isLucid,
            image_url: form.imageUrl,
            visibility: form.visibility,
            tags: [form.mood, form.isLucid ? "Lucid" : null].filter(Boolean),
          })
          .eq("id", dreamIdToEdit);

        if (error) throw error;

        // Limpa tudo antes de voltar
        resetForm();

        // Zera os params forçadamente para a próxima navegação
        router.setParams({ isEditing: undefined, id: undefined });

        router.back();
      } catch (error) {
        console.error("Erro ao editar:", error);
        Alert.alert("Erro", "Não foi possível salvar as alterações.");
      } finally {
        setIsSavingEdit(false);
      }
    } else {
      // --- MODO CRIAÇÃO ---
      const success = await submitDream();
      if (success) {
        resetForm();
        router.back();
      }
    }
  };

  const isLoading = loading.submit || isSavingEdit;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dream-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          className="p-4"
          showsVerticalScrollIndicator={false}
        >
          {/* --- Header --- */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => {
                resetForm(); // Garante limpeza ao cancelar
                router.back();
              }}
              className="p-2 bg-gray-200 dark:bg-white/10 rounded-full mr-4"
            >
              <ArrowLeft size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "Editar Sonho" : t("create_dream.title")}
            </Text>
          </View>

          {/* ... O resto do formulário continua igual ... */}
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-4 mb-6 shadow-sm">
            <TextInput
              placeholder={t("create_dream.dream_title_placeholder")}
              placeholderTextColor="#9CA3AF"
              value={form.title}
              onChangeText={(text) => updateForm("title", text)}
              className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2"
            />
            <TextInput
              placeholder={t("create_dream.dream_description_placeholder")}
              placeholderTextColor="#9CA3AF"
              value={form.description}
              onChangeText={(text) => updateForm("description", text)}
              multiline
              className="text-gray-700 dark:text-gray-300 text-base min-h-[100px]"
              textAlignVertical="top"
            />
          </View>

          <ImageGenerator
            imageUrl={form.imageUrl}
            isPro={isPro}
            isLoading={loading.image}
            onGenerate={generateImage}
            onClear={() => updateForm("imageUrl", null)}
            canGenerate={!!form.title && !!form.description}
          />

          <View className="mb-6">
            <Text className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-3 ml-1">
              {t("create_dream.mood_title")}
            </Text>
            <MoodSelector
              selectedMood={form.mood}
              onSelect={(m) => updateForm("mood", m)}
            />
          </View>

          <View className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Sparkles size={20} color="#EAB308" />
              </View>
              <View>
                <Text className="font-bold text-gray-900 dark:text-white">
                  {t("create_dream.lucid_title")}
                </Text>
                <Text className="text-xs text-gray-500">
                  {t("create_dream.lucid_subtitle")}
                </Text>
              </View>
            </View>
            <Switch
              value={form.isLucid}
              onValueChange={(val) => updateForm("isLucid", val)}
              trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
              thumbColor={Platform.OS === "android" ? "#FFF" : ""}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <VisibilitySelector
            value={form.visibility}
            onChange={(val) => updateForm("visibility", val)}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`w-full py-4 rounded-2xl mt-2 items-center justify-center shadow-lg shadow-indigo-500/30 mb-8 ${isLoading ? "bg-indigo-400" : "bg-indigo-600"}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {isEditing ? "Salvar Alterações" : t("create_dream.save")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
