import useAuthStore from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Redirect href="/" />;

  return (
    <SafeAreaView
      className="flex-1 bg-dream-dark"
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Slot />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
