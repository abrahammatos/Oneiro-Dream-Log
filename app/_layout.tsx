import useAuthStore from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import i18n from "../lib/i18n"; // 👈 Importe o i18n instance (não apenas o arquivo)
import "./globals.css";

export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  // 1. Pegue o language da store
  const { theme, language } = useSettingsStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchAuthenticatedUser();

      // 2. Aplica Tema
      if (theme && theme !== "system") {
        setColorScheme(theme);
      }

      // 3. Aplica Idioma Salvo
      if (language) {
        i18n.changeLanguage(language);
      }

      setIsReady(true);
    };
    init();
  }, []);

  // Monitorar mudanças (Opcional, mas garante sincronia se mudar em outra tela)
  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [language]);

  if (!isReady || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
    </ThemeProvider>
  );
}
