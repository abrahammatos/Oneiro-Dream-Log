import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { images } from "@/constants";
import { signIn } from "@/lib/appwrite";
import { AntDesign } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SignIn() {
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    const { email, password } = form;

    if (!email || !password)
      return Alert.alert("Error", "Please enter valid Email address.");

    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Google Login");
      router.replace("/");
    }, 1500);
  };

  return (
    <View className="flex-1 justify-center px-6 w-full max-w-sm mx-auto z-10">
      <View className="absolute top-0 right-0 w-64 h-64 bg-dream-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30" />
      <View className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-30" />

      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <View className="items-center mb-8">
          <Image
            source={images.logo}
            className="w-32 h-32 mb-1"
            resizeMode="contain"
          />

          <Text className="text-dream-lilac font-medium">
            {t("sign_in.unlock_your_sub")}
          </Text>
        </View>

        {/* --- Form Section --- */}
        <View className="space-y-4">
          <View className="bg-dream-surface/50 border border-dream-purple/30 rounded-3xl p-6 shadow-xl mb-6">
            <CustomInput
              label={t("sign_in.email_label")}
              placeholder={t("sign_in.email_placeholder")}
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, email: text }))
              }
            />
            <CustomInput
              label={t("sign_in.password_label")}
              placeholder="••••••••"
              value={form.password}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, password: text }))
              }
              secureTextEntry={true}
            />
          </View>

          {/* Botão Principal */}
          <CustomButton
            title={t("sign_in.login_btn")}
            onPress={submit}
            isLoading={isSubmitting}
            variant="primary"
          />

          {/* Divisor "OR" */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-dream-purple/30" />
            <Text className="px-4 text-dream-lilac/50 text-xs font-bold uppercase">
              {t("sign_in.or")}
            </Text>
            <View className="flex-1 h-[1px] bg-dream-purple/30" />
          </View>

          {/* Botão Google */}
          <CustomButton
            title={t("sign_in.google_btn")}
            onPress={handleGoogleLogin}
            variant="secondary"
            leftIcon={<AntDesign name="google" size={20} color="#EA4335" />}
          />

          {/* Footer Link */}
          <View className="mt-8 items-center">
            <Text className="text-dream-lilac/60 text-sm">
              {t("sign_in.no_account")}
            </Text>
            <Link href="/sign-up" asChild>
              <Text className="text-dream-blue font-bold text-sm mt-1">
                {t("sign_in.create_account")}
              </Text>
            </Link>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
