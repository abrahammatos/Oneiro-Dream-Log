import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { aiService } from "@/services/ai.service";

import { uploadImageFromUrl } from "@/services/imageService";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { useState } from "react";
import { Alert, Keyboard } from "react-native";

const INITIAL_STATE = {
  title: "",
  description: "",
  visibility: "public" as "public" | "private",
  mood: "",
  isLucid: false,
  imageUrl: null as string | null,
};

type UserWithProfile = User & {
  profile?: { is_pro: boolean };
  is_pro?: boolean;
  user_metadata?: { is_pro?: boolean };
};

export function useCreateDream() {
  const { user: rawUser } = useAuthStore();
  const user = rawUser as UserWithProfile | null;

  const isPro =
    user?.profile?.is_pro ||
    user?.is_pro ||
    user?.user_metadata?.is_pro ||
    false;

  const [form, setForm] = useState(INITIAL_STATE);

  const [loading, setLoading] = useState({
    submit: false,
    image: false,
  });

  const updateForm = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_STATE);
    setLoading({ submit: false, image: false });
  };

  // --- GERAR IMAGEM ---
  const generateImage = async () => {
    if (!isPro)
      return Alert.alert("Pro Feature", "Assine o Premium para gerar imagens!");

    if (!form.title || !form.description)
      return Alert.alert("Ops", "Preencha título e descrição antes de gerar.");

    Keyboard.dismiss();
    setLoading((prev) => ({ ...prev, image: true }));

    try {
      const magicPrompt = await aiService.generateDreamImagePrompt(
        form.title,
        form.description
      );
      const url = aiService.generateImageFromPollinations(magicPrompt);
      updateForm("imageUrl", url);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "A IA não conseguiu gerar a imagem agora.");
    } finally {
      setLoading((prev) => ({ ...prev, image: false }));
    }
  };

  // --- SALVAR SONHO ---
  // Agora aceita tags customizadas e data customizada
  const submitDream = async (
    customTags?: string[],
    customDate?: Date
  ): Promise<boolean> => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert("Ops!", "Título e descrição são obrigatórios.");
      return false;
    }

    if (!user) {
      Alert.alert("Erro", "Usuário não logado.");
      return false;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      let finalImageUrl = form.imageUrl;

      // 1. Upload da Imagem (Se for do Pollinations, salva no Storage do Supabase)
      if (form.imageUrl && form.imageUrl.includes("pollinations.ai")) {
        const uploadedUrl = await uploadImageFromUrl(form.imageUrl, user.id);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          console.warn("Upload falhou, usando URL temporária como fallback.");
        }
      }

      // 2. Definição das Tags
      // Se a UI passou tags (do input manual + IA), usa elas.
      // Se não, gera as tags básicas (Humor + Lucidez).
      let tagsToSave = customTags;

      if (!tagsToSave || tagsToSave.length === 0) {
        const lucidTag = form.isLucid
          ? i18n.language?.startsWith("pt")
            ? "Lúcido"
            : "Lucid"
          : null;
        tagsToSave = [form.mood, lucidTag].filter(Boolean) as string[];
      }

      const language = i18n.language?.split("-")[0] || "en";

      // 3. Monta o Payload
      const payload = {
        author_id: user.id,
        title: form.title,
        description: form.description,
        visibility: form.visibility,
        mood: form.mood,
        is_lucid: form.isLucid,
        image_url: finalImageUrl,
        tags: tagsToSave, // Usa as tags processadas
        language,
        // Usa a data passada ou a data atual
        date: customDate ? customDate.toISOString() : new Date().toISOString(),
      };

      const { error } = await supabase.from("dreams").insert(payload);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Erro no submit:", error);
      Alert.alert("Erro ao salvar", "Não foi possível registrar o sonho.");
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return {
    form,
    updateForm,
    loading,
    isPro,
    generateImage,
    submitDream,
    resetForm,
    setLoading,
  };
}
