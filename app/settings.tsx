import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Clock,
  Globe,
  LogOut,
  Moon,
  Shield,
  Sun,
  Trash2,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import useAuthStore from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3 mt-6 ml-4">
    {title}
  </Text>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { signOut, user } = useAuthStore(); // Só precisamos para logout/delete

  // Store Local (Sem userId)
  const {
    hasNotifications,
    toggleNotifications,
    sleepTime,
    setSleepTime,
    setLanguage,
    setTheme,
  } = useSettingsStore();

  const { colorScheme, setColorScheme } = useColorScheme();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Lógica do TimePicker
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      setSleepTime(`${hours}:${minutes}`);
    }
  };

  const changeTheme = (theme: "light" | "dark") => {
    setColorScheme(theme);
    setTheme(theme);
  };

  const handleLogout = async () => {
    Alert.alert(t("settings.logout_title"), t("settings.logout_confirm"), [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(t("settings.danger_zone"), t("settings.delete_warning"), [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir Conta",
        style: "destructive",
        onPress: async () => {
          try {
            if (user?.id) {
              await supabase.from("profiles").delete().eq("id", user.id);
              await supabase.auth.signOut();
              signOut();
            }
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir a conta.");
          }
        },
      },
    ]);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    setShowLangModal(false);
  };

  const getLanguageLabel = () => {
    switch (i18n.language) {
      case "pt":
        return "Português";
      case "es":
        return "Español";
      default:
        return "English";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-200 dark:bg-slate-800 rounded-full mr-4"
          >
            <ArrowLeft
              size={24}
              className="text-slate-600 dark:text-slate-300"
            />
          </TouchableOpacity>
          <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t("settings.title")}
          </Text>
        </View>

        <View className="px-4">
          <SectionHeader title={t("settings.preferences", "Preferências")} />

          {/* Tema */}
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              onPress={() => changeTheme("light")}
              className={`flex-1 p-4 rounded-2xl border-2 items-center justify-center ${colorScheme === "light" ? "bg-white border-indigo-500 " : "bg-transparent border-gray-200 dark:border-slate-800"}`}
            >
              <Sun
                size={24}
                className={
                  colorScheme === "light" ? "text-indigo-500" : "text-gray-400"
                }
              />
              <Text
                className={`text-sm font-bold mt-2 ${colorScheme === "light" ? "text-slate-900" : "text-gray-400"}`}
              >
                {t("settings.light_mode")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeTheme("dark")}
              className={`flex-1 p-4 rounded-2xl border-2 items-center justify-center ${colorScheme === "dark" ? "bg-slate-800 border-indigo-500 " : "bg-transparent border-gray-200 dark:border-slate-800"}`}
            >
              <Moon
                size={24}
                className={
                  colorScheme === "dark" ? "text-indigo-500" : "text-gray-400"
                }
              />
              <Text
                className={`text-sm font-bold mt-2 ${colorScheme === "dark" ? "text-white" : "text-gray-400"}`}
              >
                {t("settings.dark_mode")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notificações */}
          <View className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl mb-3">
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Bell
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </View>
              <View>
                <Text className="font-bold text-slate-900 dark:text-white">
                  {t("settings.notifications")}
                </Text>
                <Text className="text-xs text-slate-500">
                  {t("settings.notifications_desc")}
                </Text>
              </View>
            </View>
            <Switch
              value={hasNotifications}
              onValueChange={toggleNotifications} // Simples assim agora
              trackColor={{ false: "#E5E7EB", true: "#4F46E5" }}
              thumbColor={"#FFF"}
            />
          </View>

          {/* Hora */}
          {hasNotifications && (
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl mb-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </View>
                <View>
                  <Text className="font-bold text-slate-900 dark:text-white">
                    {t("settings.sleep_time")}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {t("settings.sleep_time_desc")}
                  </Text>
                </View>
              </View>
              <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                <Text className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {sleepTime}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Idioma */}
          <TouchableOpacity
            onPress={() => setShowLangModal(true)}
            className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl mb-3"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Globe
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </View>
              <Text className="font-bold text-slate-900 dark:text-white">
                {t("settings.language")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold">
                {getLanguageLabel()}
              </Text>
              <ChevronRight size={16} className="text-gray-400" />
            </View>
          </TouchableOpacity>

          <SectionHeader title={t("settings.account", "Conta")} />
          <TouchableOpacity
            onPress={() => Linking.openURL("https://seusite.com/privacy")}
            className="w-full flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl mb-3"
          >
            <View className="flex-row items-center gap-3">
              <Shield
                size={20}
                className="text-slate-500 dark:text-slate-400"
              />
              <Text className="font-bold text-slate-700 dark:text-slate-300">
                {t("settings.privacy")}
              </Text>
            </View>
            <ChevronRight size={16} className="text-gray-400" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="w-full flex-row items-center justify-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl mb-3 mt-2"
          >
            <LogOut
              size={20}
              className="text-slate-600 dark:text-slate-300 mr-2"
            />
            <Text className="text-slate-600 dark:text-slate-300 font-bold">
              {t("settings.logout")}
            </Text>
          </TouchableOpacity>

          <View className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800">
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="w-full flex-row items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl"
            >
              <Trash2 size={20} className="text-red-500 mr-2" />
              <Text className="text-red-500 font-bold">
                {t("settings.delete_account")}
              </Text>
            </TouchableOpacity>
            <Text className="text-center text-xs text-gray-400 mt-6">
              Oneiro v1.0.2 • Build 4920
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Idioma */}
      <Modal
        visible={showLangModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLangModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              {t("settings.choose_language")}
            </Text>
            <View className="space-y-3">
              {[
                { code: "en", label: "English 🇺🇸" },
                { code: "pt", label: "Português 🇧🇷" },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => changeLanguage(lang.code)}
                  className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${i18n.language === lang.code ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-100 dark:border-slate-800"}`}
                >
                  <Text
                    className={`font-bold ${i18n.language === lang.code ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}
                  >
                    {lang.label}
                  </Text>
                  {i18n.language === lang.code && (
                    <View className="w-3 h-3 rounded-full bg-indigo-500" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowLangModal(false)}
              className="mt-6 p-3"
            >
              <Text className="text-center text-slate-500 font-medium">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
