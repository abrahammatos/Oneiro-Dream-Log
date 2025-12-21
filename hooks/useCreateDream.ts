import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { aiService } from "@/services/ai.service";
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

// --- Tipagem Segura (Mantida) ---
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

  // --- FUNÇÃO DE GERAR IMAGEM CORRIGIDA ---
  const generateImage = async () => {
    if (!isPro) return Alert.alert("Pro Feature", "Assine o Premium!");
    if (!form.title || !form.description)
      return Alert.alert("Ops", "Preencha título e descrição.");

    Keyboard.dismiss();
    setLoading((prev) => ({ ...prev, image: true }));

    try {
      // 1. Gera o texto do prompt (Usando Gemini 1.5 Flash)
      const magicPrompt = await aiService.generateDreamImagePrompt(
        form.title,
        form.description
      );

      console.log("Prompt gerado:", magicPrompt);

      // 2. Gera a URL da imagem (Usando Pollinations)
      const url = aiService.generateImageFromPollinations(magicPrompt);

      // 3. Pré-carrega a imagem (Precisa do import 'Image' lá em cima)
      try {
        // await Image.prefetch(url);
      } catch (err) {
        console.warn(
          "Falha no prefetch, mas a imagem ainda pode carregar.",
          err
        );
      }

      // 4. Salva no estado
      updateForm("imageUrl", url);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "A IA não conseguiu gerar a imagem agora.");
    } finally {
      setLoading((prev) => ({ ...prev, image: false }));
    }
  };

  const submitDream = async (): Promise<boolean> => {
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
      const tags = [form.mood, form.isLucid ? "Lucid" : null].filter(Boolean);
      const language = i18n.language?.split("-")[0] || "en";

      const { error } = await supabase.from("dreams").insert({
        author_id: user.id,
        title: form.title,
        description: form.description,
        visibility: form.visibility,
        mood: form.mood,
        is_lucid: form.isLucid,
        image_url: form.imageUrl,
        tags,
        date: new Date().toISOString(),
        language,
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar.");
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
  };
}
