import useAuthStore from "@/store/auth.store";
import { TabIconProps } from "@/type";
import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#3b82f6", // dream-blue
  inactive: "#94a3b8", // slate-400 (cor neutra/roxa desbotada)
  bgDark: "#0A0F24", // Fundo da TabBar
};

const TabBarIcon = ({ focused, name }: TabIconProps) => (
  <View
    className={`items-center justify-center ${focused ? "-translate-y-1" : ""}`}
  >
    <Feather
      name={name}
      size={24}
      color={focused ? COLORS.primary : COLORS.inactive}
    />

    {focused && (
      <View className="absolute -bottom-4 w-1 h-1 bg-dream-blue rounded-full shadow-sm shadow-blue-500" />
    )}
  </View>
);

const FloatingCreateButton = () => (
  <View className="items-center justify-center -top-6">
    <View
      className="w-16 h-16 bg-dream-blue rounded-full items-center justify-center shadow-lg shadow-blue-500/40"
      style={{
        borderWidth: 5,
        borderColor: COLORS.bgDark,
      }}
    >
      <Feather name="plus" size={32} color="#0A0F24" strokeWidth={3} />
    </View>
  </View>
);

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: COLORS.bgDark,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 0,
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="home" />
          ),
        }}
      />

      {/* 2. Search */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="search" />
          ),
        }}
      />

      {/* 3. Create (Botão Central) */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: () => <FloatingCreateButton />,
        }}
      />

      {/* 4. Analysis */}
      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analysis",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="pie-chart" />
          ),
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="user" />
          ),
        }}
      />
    </Tabs>
  );
}
