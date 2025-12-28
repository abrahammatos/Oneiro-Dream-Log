import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Sparkles, Tag, X } from "lucide-react-native";
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
import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { aiService } from "@/services/ai.service";

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

  // --- ESTADOS PARA TAGS ---
  const [tags, setTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  // 1. LIMPEZA AO ENTRAR/SAIR
  useFocusEffect(
    useCallback(() => {
      // Se for um novo sonho, limpa tudo para não ter lixo de memória
      if (!isEditing) {
        resetForm();
        setTags([]);
      }
    }, [isEditing])
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

      // Tenta recuperar as tags vindas da navegação
      if (params.tags) {
        try {
          // As tags podem vir como string JSON ou array direto dependendo do router
          const parsedTags =
            typeof params.tags === "string"
              ? JSON.parse(params.tags)
              : params.tags;
          if (Array.isArray(parsedTags)) setTags(parsedTags);
        } catch (e) {
          console.log("Erro ao carregar tags na edição", e);
        }
      }
    }
  }, [dreamIdToEdit]);

  // --- GERAR TAGS COM IA ---
  const handleGenerateTags = async () => {
    if (!form.description || form.description.length < 10) {
      Alert.alert(
        t("attention") || "Atenção",
        t("create_dream.description_short_for_tags") ||
          "Escreva uma descrição maior para a IA entender."
      );
      return;
    }

    setIsGeneratingTags(true);
    try {
      const currentLanguage = i18n.language || "en";

      const generatedTags = await aiService.generateTagsForDream(
        form.description,
        currentLanguage
      );

      // Adiciona as novas tags sem duplicar as existentes
      setTags((prev) => Array.from(new Set([...prev, ...generatedTags])));
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao conectar com o oráculo dos sonhos.");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // --- GERENCIAMENTO MANUAL DE TAGS ---
  const addManualTag = () => {
    if (newTagInput.trim()) {
      const cleanTag = newTagInput.trim();
      if (!tags.includes(cleanTag)) {
        setTags((prev) => [...prev, cleanTag]);
      }
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // --- SALVAR (CRIAÇÃO OU EDIÇÃO) ---
  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert("Ops", "Título e descrição são obrigatórios.");
      return;
    }

    // Consolida todas as tags: Manuais/IA + Humor + Lucidez
    const finalTags = [
      ...tags,
      form.mood,
      form.isLucid
        ? i18n.language?.startsWith("pt")
          ? "Lúcido"
          : "Lucid"
        : null,
    ].filter(Boolean) as string[];

    // Remove duplicatas
    const uniqueTags = Array.from(new Set(finalTags));

    if (isEditing) {
      // --- MODO EDIÇÃO ---
      // (Mantemos a lógica manual aqui pois o hook é focado em CREATE)
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
            tags: uniqueTags,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dreamIdToEdit);

        if (error) throw error;

        // Limpeza e Navegação
        resetForm();
        setTags([]);
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
      // Usamos o hook refatorado passando as tags e a data atual
      const success = await submitDream(uniqueTags, new Date());

      if (success) {
        resetForm();
        setTags([]);
        router.back();
      }
    }
  };

  const isLoading = loading.submit || isSavingEdit;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          className="p-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- Header --- */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setTags([]);
                router.back();
              }}
              className="p-2 bg-gray-200 dark:bg-white/10 rounded-full mr-4"
            >
              <ArrowLeft size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing
                ? t("create_dream.title_edit_dream")
                : t("create_dream.title")}
            </Text>
          </View>

          {/* Inputs Principais */}
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

          {/* --- SEÇÃO DE TAGS --- */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2 px-1">
              <Text className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                Tags & Temas
              </Text>

              {/* Botão Gerar com IA */}
              <TouchableOpacity
                onPress={handleGenerateTags}
                disabled={isGeneratingTags || !form.description}
                className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${isGeneratingTags || !form.description ? "bg-gray-100 dark:bg-slate-800" : "bg-indigo-100 dark:bg-indigo-900/50"}`}
              >
                {isGeneratingTags ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
                ) : (
                  <>
                    <Sparkles
                      size={14}
                      className={
                        !form.description
                          ? "text-gray-400"
                          : "text-indigo-600 dark:text-indigo-400"
                      }
                    />
                    <Text
                      className={`text-xs font-bold ${!form.description ? "text-gray-400" : "text-indigo-600 dark:text-indigo-400"}`}
                    >
                      {isGeneratingTags ? "Gerando..." : "Gerar com IA"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Input Manual e Lista */}
            <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
              {/* Input */}
              <View className="flex-row gap-2 mb-3">
                <TextInput
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                  placeholder="Adicionar tag manual..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg text-slate-900 dark:text-white text-sm"
                  onSubmitEditing={addManualTag}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={addManualTag}
                  className="bg-gray-200 dark:bg-slate-700 p-2 rounded-lg items-center justify-center"
                >
                  <Tag size={18} className="text-gray-600 dark:text-gray-300" />
                </TouchableOpacity>
              </View>

              {/* Chips */}
              <View className="flex-row flex-wrap gap-2">
                {tags.length === 0 && (
                  <Text className="text-gray-400 text-xs italic p-1">
                    Nenhuma tag selecionada.
                  </Text>
                )}
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800"
                  >
                    <Text className="text-indigo-600 dark:text-indigo-300 text-xs font-bold mr-1 capitalize">
                      {tag}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeTag(tag)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={12} className="text-indigo-400" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Gerador de Imagem */}
          <ImageGenerator
            imageUrl={form.imageUrl}
            isPro={isPro}
            isLoading={loading.image}
            onGenerate={generateImage}
            onClear={() => updateForm("imageUrl", null)}
            canGenerate={!!form.title && !!form.description}
          />

          {/* Seletor de Humor */}
          <View className="mb-6">
            <Text className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-3 ml-1">
              {t("create_dream.mood_title")}
            </Text>
            <MoodSelector
              selectedMood={form.mood}
              onSelect={(m) => updateForm("mood", m)}
            />
          </View>

          {/* Switch Sonho Lúcido */}
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

          {/* Seletor de Visibilidade */}
          <VisibilitySelector
            value={form.visibility}
            onChange={(val) => updateForm("visibility", val)}
          />

          {/* Botão Salvar */}
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
                {isEditing
                  ? t("create_dream.editSave")
                  : t("create_dream.save")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
