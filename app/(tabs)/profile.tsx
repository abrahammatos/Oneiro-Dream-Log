import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Crown,
  Download,
  Edit3,
  LogOut,
  Save,
  Settings,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Imports internos
import DreamList from "@/components/DreamList";
import { ProfileHeader } from "@/components/ProfileHeader";
import { StatsAndAchievements } from "@/components/StatsAndAchievements";
import { useProfile } from "@/hooks/useProfile";
import { useSettingsStore } from "@/store/settings.store";
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const router = useRouter();
  const { sleepTime } = useSettingsStore();
  const { t } = useTranslation();

  // Hook com toda a lógica
  const profile = useProfile();

  // UI State local (Tabs não precisam ir pro hook)
  const [activeTab, setActiveTab] = useState<"overview" | "dreams">("overview");

  const isPro = profile.user?.user_metadata?.is_pro || false;

  if (!profile.user)
    return <View className="flex-1 bg-gray-50 dark:bg-slate-950" />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={profile.refreshing}
            onRefresh={profile.onRefresh}
            tintColor="#818CF8"
          />
        }
      >
        {/* --- NAVBAR --- */}
        <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
          <Text className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t("profile.title")}
          </Text>
          <View className="flex-row space-x-3">
            {profile.isEditing ? (
              <TouchableOpacity
                onPress={() => {
                  profile.resetForm();
                  profile.setIsEditing(false);
                }}
                className="p-2 rounded-full bg-red-100 dark:bg-red-900/30"
              >
                <X size={22} className="text-red-600 dark:text-red-400" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                className="p-2 rounded-full bg-gray-200 dark:bg-slate-800"
              >
                <Settings
                  size={22}
                  className="text-slate-600 dark:text-slate-300"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() =>
                profile.isEditing
                  ? profile.handleSaveProfile()
                  : profile.setIsEditing(true)
              }
              className={`p-2 rounded-full ${profile.isEditing ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-800"}`}
            >
              {profile.loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : profile.isEditing ? (
                <Save size={22} className="text-white" />
              ) : (
                <Edit3
                  size={22}
                  className="text-slate-600 dark:text-slate-300"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- COMPONENTE DE HEADER --- */}
        <ProfileHeader
          user={profile.user}
          isEditing={profile.isEditing}
          editAvatar={profile.editAvatar}
          setEditAvatar={profile.setEditAvatar}
          editName={profile.editName}
          setEditName={profile.setEditName}
          onPickImage={profile.handlePickImage}
          loading={profile.loading}
          avatarChanges={profile.avatarChanges}
          maxAvatarChanges={profile.maxAvatarChanges}
          isPro={isPro}
        />

        {/* --- TABS --- */}
        <View className="mx-6 mb-6 flex-row bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
          {(["overview", "dreams"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === tab ? "bg-indigo-600" : ""}`}
            >
              <Text
                className={`font-bold text-sm ${activeTab === tab ? "text-white" : "text-slate-500"}`}
              >
                {tab === "overview"
                  ? t("profile.tabs.overview")
                  : t("profile.tabs.dreams")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- CONTEÚDO --- */}
        <View className="px-6">
          {activeTab === "overview" ? (
            <View>
              {/* COMPONENTE DE STATS */}
              <StatsAndAchievements
                stats={profile.stats}
                sleepTime={sleepTime}
              />

              {/* Banner PRO */}
              {!isPro && (
                <TouchableOpacity activeOpacity={0.9} className="mb-6">
                  <LinearGradient
                    colors={["#6366f1", "#a855f7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-5 flex-row items-center justify-between shadow-xl shadow-indigo-500/30"
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="bg-white/20 p-2.5 rounded-full">
                        <Crown size={24} color="white" fill="white" />
                      </View>
                      <View>
                        <Text className="text-white font-bold text-base">
                          {t("profile.pro.title")}
                        </Text>
                        <Text className="text-indigo-100 text-xs">
                          {t("profile.pro.subtitle")}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Botões de Ação */}
              <TouchableOpacity
                onPress={profile.handleExportData}
                className="w-full border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-4 flex-row items-center justify-center gap-2 mb-4"
              >
                <Download
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
                <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {t("profile.export")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={profile.handleLogout}
                className="w-full bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 flex-row items-center justify-center gap-2 mb-8"
              >
                <LogOut size={18} className="text-red-500" />
                <Text className="text-red-500 font-bold text-sm">
                  {t("profile.logout")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DreamList dreams={profile.dreamsList} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
