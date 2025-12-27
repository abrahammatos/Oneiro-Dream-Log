import { PRESET_AVATARS } from "@/hooks/useProfile";
import { Camera, Crown } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface Props {
  user: any;
  isEditing: boolean;
  editAvatar: string;
  setEditAvatar: (url: string) => void;
  editName: string;
  setEditName: (text: string) => void;
  onPickImage: () => void;
  loading: boolean;
  avatarChanges: number;
  maxAvatarChanges: number;
  isPro: boolean;
}

export function ProfileHeader({
  user,
  isEditing,
  editAvatar,
  setEditAvatar,
  editName,
  setEditName,
  onPickImage,
  loading,
  avatarChanges,
  maxAvatarChanges,
  isPro,
}: Props) {
  const { t } = useTranslation();

  const currentAvatar = isEditing
    ? editAvatar
    : user.user_metadata?.avatar_url || PRESET_AVATARS[0];

  return (
    <View className="items-center mb-8">
      <View className="relative">
        <Image
          source={{ uri: currentAvatar }}
          className={`w-32 h-32 rounded-full border-4 ${isEditing ? "border-indigo-500 opacity-80" : "border-white dark:border-slate-800"}`}
        />
        {isPro && !isEditing && (
          <View className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full border-4 border-gray-50 dark:border-slate-950 shadow-lg">
            <Crown size={16} color="white" fill="white" />
          </View>
        )}

        {isEditing && (
          <TouchableOpacity
            onPress={onPickImage}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Camera size={32} className="text-white" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {isEditing && (
        <>
          <Text className="text-[10px] text-slate-400 mt-2 font-bold">
            {t("profile.avatar_changes", {
              used: avatarChanges,
              total: maxAvatarChanges,
            })}
          </Text>
          <Animated.View entering={FadeIn} className="mt-4 w-full px-6">
            <Text className="text-slate-400 text-xs font-bold text-center mb-3 uppercase tracking-wider">
              {t("profile.avatar_presets")}
            </Text>
            <View className="flex-row justify-center gap-3 mb-4">
              {PRESET_AVATARS.map((url) => (
                <TouchableOpacity
                  key={url}
                  onPress={() => setEditAvatar(url)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 ${editAvatar === url ? "border-indigo-500 scale-110" : "border-transparent"}`}
                >
                  <Image source={{ uri: url }} className="w-full h-full" />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </>
      )}

      <View className="mt-4 items-center space-y-1">
        {isEditing ? (
          <TextInput
            value={editName}
            onChangeText={setEditName}
            className="text-2xl font-extrabold text-slate-900 dark:text-white text-center border-b border-indigo-500 pb-1 min-w-[200px]"
          />
        ) : (
          <Text className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user.user_metadata?.username || t("profile.default_username")}
          </Text>
        )}
        <Text className="text-slate-500 font-mono text-sm">{user.email}</Text>
      </View>
    </View>
  );
}
