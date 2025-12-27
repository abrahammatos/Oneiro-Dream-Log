import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  hasNotifications: boolean;
  sleepTime: string;
  theme: "light" | "dark" | "system";
  language: string; // 👈 1. Adicionado

  toggleNotifications: (value: boolean) => Promise<void>;
  setSleepTime: (time: string) => Promise<void>;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (lang: string) => void; // 👈 2. Adicionado
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hasNotifications: false,
      sleepTime: "23:00",
      theme: "system",
      language: "pt", // 👈 3. Valor padrão

      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }), // 👈 4. Ação para salvar

      toggleNotifications: async (value) => {
        set({ hasNotifications: value });
        if (value) {
          await scheduleNotification(get().sleepTime);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      },

      setSleepTime: async (time) => {
        set({ sleepTime: time });
        if (get().hasNotifications) {
          await scheduleNotification(time);
        }
      },
    }),
    {
      name: "oneiro-settings-local",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function scheduleNotification(timeString: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const [hour, minute] = timeString.split(":").map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de Dormir 🌙",
      body: "Não se esqueça de definir a intenção para os seus sonhos hoje!",
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    } as any,
  });
}
