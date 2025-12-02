import { Stack } from "expo-router";
import React from "react";
import "../lib/i18n.ts";
import "./globals.css";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
