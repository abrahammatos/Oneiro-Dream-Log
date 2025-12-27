import { supabase } from "@/lib/supabase";
import useAuthStore from "@/store/auth.store";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Share } from "react-native";

const MAX_AVATAR_CHANGES = 3;
export const PRESET_AVATARS = [
  "https://api.dicebear.com/9.x/micah/png?seed=Felix",
  "https://api.dicebear.com/9.x/micah/png?seed=Aneka",
  "https://api.dicebear.com/9.x/micah/png?seed=Zoe",
  "https://api.dicebear.com/9.x/micah/png?seed=Leo",
  "https://api.dicebear.com/9.x/micah/png?seed=George",
];

export function useProfile() {
  const { user, refreshSession, signOut } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, lucid: 0, streak: 0 });
  const [dreamsList, setDreamsList] = useState<any[]>([]);
  const [avatarChanges, setAvatarChanges] = useState(0);

  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const resetForm = useCallback(() => {
    setEditName(user?.user_metadata?.username || "Sonhador");
    setEditAvatar(user?.user_metadata?.avatar_url || PRESET_AVATARS[0]);
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Busca Stats e Sonhos em paralelo
      const [dreamsRes, lucidRes, listRes, profileRes] = await Promise.all([
        supabase
          .from("dreams")
          .select("*", { count: "exact", head: true })
          .eq("author_id", user.id),
        supabase
          .from("dreams")
          .select("*", { count: "exact", head: true })
          .eq("author_id", user.id)
          .eq("is_lucid", true),
        supabase
          .from("dreams")
          .select("*")
          .eq("author_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("profiles")
          .select("avatar_updated_at, avatar_changes_count")
          .eq("id", user.id)
          .single(),
      ]);

      // Lógica de limite de Avatar
      const today = new Date().toISOString().split("T")[0];
      const profileData = profileRes.data;
      if (profileData && profileData.avatar_updated_at !== today) {
        setAvatarChanges(0);
      } else {
        setAvatarChanges(profileData?.avatar_changes_count || 0);
      }

      setStats({
        total: dreamsRes.count || 0,
        lucid: lucidRes.count || 0,
        streak: 1, // TODO: Implementar lógica real de streak depois
      });
      if (listRes.data) setDreamsList(listRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      resetForm();
      fetchData();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await refreshSession();
    setRefreshing(false);
  };

  const handlePickImage = async () => {
    if (avatarChanges >= MAX_AVATAR_CHANGES) {
      return Alert.alert(
        t("profile.alerts.avatar_limit_title"),
        t("profile.alerts.avatar_limit_desc", { count: MAX_AVATAR_CHANGES })
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Atualizado para nova API do Expo
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadAvatar(result.assets[0].base64);
    }
  };

  const uploadAvatar = async (base64Data: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64Data), {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setEditAvatar(data.publicUrl);
    } catch (error) {
      Alert.alert(t("common.error"), t("profile.alerts.upload_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const isAvatarChanged = editAvatar !== user.user_metadata?.avatar_url;
      let newCount = avatarChanges;

      if (isAvatarChanged) {
        if (avatarChanges >= MAX_AVATAR_CHANGES)
          throw new Error("Limite de trocas atingido.");
        newCount += 1;
      }

      const { error } = await supabase.auth.updateUser({
        data: { username: editName, avatar_url: editAvatar },
      });
      if (error) throw error;

      await supabase
        .from("profiles")
        .update({
          username: editName,
          avatar: editAvatar,
          avatar_updated_at: today,
          avatar_changes_count: isAvatarChanged ? newCount : avatarChanges,
        })
        .eq("id", user.id);

      Alert.alert(t("common.success"), t("profile.alerts.profile_updated"));

      setIsEditing(false);
      setAvatarChanges(newCount);
      refreshSession();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("profile.alerts.generic_error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      await Share.share({
        message: JSON.stringify(
          { user: { email: user?.email, name: editName }, dreams: dreamsList },
          null,
          2
        ),
        title: t("profile.export_title"),
      });
    } catch (error) {
      Alert.alert(t("common.error"), t("profile.alerts.export_failed"));
    }
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logout_title"), t("profile.logout_desc"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout_confirm"),
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  return {
    user,
    loading,
    refreshing,
    stats,
    dreamsList,
    avatarChanges,
    maxAvatarChanges: MAX_AVATAR_CHANGES,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    editAvatar,
    setEditAvatar,
    onRefresh,
    handlePickImage,
    handleSaveProfile,
    handleExportData,
    handleLogout,
    resetForm,
  };
}
