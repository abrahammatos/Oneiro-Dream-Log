import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { AntDesign } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SignUp() {
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = async () => {
    setError("");

    const { name, username, email, password, confirmPassword } = form;

    if (!name || !username || !email || !password || !confirmPassword) {
      setError(t("sign_up.error_missing_fields"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("sign_up.error_password_match"));
      return;
    }

    setIsSubmitting(true);

    try {
      await createUser({
        name,
        username,
        email,
        password,
      });

      router.replace("/");
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Google Signup");
      router.replace("/");
    }, 1500);
  };

  return (
    <View className="flex-1 justify-center px-6 w-full max-w-sm mx-auto z-10">
      <View className="absolute top-0 left-0 w-64 h-64 bg-dream-blue/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 opacity-30" />
      <View className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 opacity-30" />

      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <View className="items-center mb-6">
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            {t("sign_up.title")}{" "}
          </Text>
          <Text className="text-dream-lilac font-medium mt-1">
            {t("sign_up.subtitle")}{" "}
          </Text>
        </View>

        {/* --- Form Section --- */}
        <View className="space-y-4">
          <View className="bg-dream-surface/50 border border-dream-purple/30 rounded-3xl p-6 shadow-xl mb-4">
            {/* Mensagem de Erro (Renderização Condicional) */}
            {error ? (
              <View className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl mb-4">
                <Text className="text-red-200 text-sm text-center font-medium">
                  {error}
                </Text>
              </View>
            ) : null}

            <CustomInput
              label={t("sign_up.name_label")}
              placeholder={t("sign_up.name_placeholder")}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />

            <CustomInput
              label={t("sign_up.username_label")}
              placeholder="@dreamer"
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
            />

            <CustomInput
              label={t("sign_up.email_label")}
              placeholder="alice@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />

            {/* Linha das Senhas (Lado a Lado) */}
            <View className="flex-row space-x-3 gap-1">
              <View className="flex-1">
                <CustomInput
                  label={t("sign_up.password_label")}
                  placeholder="••••••"
                  secureTextEntry
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                />
              </View>
              <View className="flex-1">
                <CustomInput
                  label={t("sign_up.confirm_label")}
                  placeholder="••••••"
                  secureTextEntry
                  value={form.confirmPassword}
                  onChangeText={(text) =>
                    setForm({ ...form, confirmPassword: text })
                  }
                />
              </View>
            </View>
          </View>

          {/* Botão Principal */}
          <CustomButton
            title={t("sign_up.btn_submit")}
            onPress={handleRegister}
            isLoading={isSubmitting}
            variant="primary"
          />

          {/* Divisor "OR" */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-dream-purple/30" />
            <Text className="px-4 text-dream-lilac/50 text-xs font-bold uppercase">
              {t("sign_up.or")}{" "}
            </Text>
            <View className="flex-1 h-[1px] bg-dream-purple/30" />
          </View>

          {/* Botão Google */}
          <CustomButton
            title={t("sign_up.btn_google")}
            onPress={handleGoogleSignup}
            variant="secondary"
            leftIcon={<AntDesign name="google" size={20} color="#EA4335" />}
          />

          {/* Footer Link */}
          <View className="mt-8 items-center">
            <Text className="text-dream-lilac/60 text-sm">
              {t("sign_up.already_have_account")}{" "}
            </Text>
            <Link href="/sign-in" asChild>
              <Text className="text-dream-blue font-bold text-sm mt-1">
                {t("sign_up.login_link")}
              </Text>
            </Link>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
