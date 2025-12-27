import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import useAuthStore from "@/store/auth.store";

// --- CONFIGURAÇÃO DOS PRODUTOS (IDs do Google Play Console) ---
const PRODUCTS = {
  MONTHLY: "oneiro_pro_monthly",
  YEARLY: "oneiro_pro_yearly",
};

// --- COMPONENTES VISUAIS ---

const BenefitRow = ({ icon: Icon, text, delay }: any) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    className="flex-row items-center mb-5"
  >
    <View className="bg-indigo-500/20 p-2 rounded-full mr-4">
      <Icon size={20} color="#818cf8" />
    </View>
    <Text className="text-white font-medium text-base flex-1">{text}</Text>
    <Check size={20} color="#4ade80" />
  </Animated.View>
);

export default function PaywallScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [loading, setLoading] = useState(false);

  // Animação de escala ao selecionar
  const scaleYearly = useSharedValue(1);
  const scaleMonthly = useSharedValue(0.95);

  const selectPlan = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    if (plan === "yearly") {
      scaleYearly.value = withSpring(1.05);
      scaleMonthly.value = withSpring(0.95);
    } else {
      scaleYearly.value = withSpring(0.95);
      scaleMonthly.value = withSpring(1.05);
    }
  };

  const animatedYearlyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleYearly.value }],
  }));
  const animatedMonthlyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleMonthly.value }],
  }));

  // --- LÓGICA DE COMPRA (INTEGRAÇÃO GOOGLE PAY AQUI) ---
  const handlePurchase = async () => {
    setLoading(true);

    try {
      const productId =
        selectedPlan === "yearly" ? PRODUCTS.YEARLY : PRODUCTS.MONTHLY;
      console.log(`💳 Iniciando compra para: ${productId}`);

      // ------------------------------------------------------------------
      // TODO: AQUI ENTRA O CÓDIGO DO REVENUECAT OU REACT-NATIVE-IAP
      // Exemplo RevenueCat:
      // const { customerInfo } = await Purchases.purchasePackage(package);
      // if (customerInfo.entitlements.active["pro_access"]) { ... }
      // ------------------------------------------------------------------

      // 👇 SIMULAÇÃO DE SUCESSO (Para testar o App agora)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Finge espera

      // Atualiza o banco de dados (Isso seria feito via Webhook na produção real)
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { is_pro: true },
        });

        if (error) throw error;

        // Atualiza a store local
        await refreshUser();
      }

      Alert.alert("Sucesso! 🎉", "Bem-vindo ao Oneiro Pro!", [
        { text: "Vamos lá", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Cancelado", "A compra não foi concluída.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Restaurar", "Nenhuma compra anterior encontrada.");
    }, 1500);
  };

  const openLink = (url: string) => Linking.openURL(url);

  return (
    <View className="flex-1 bg-slate-950">
      {/* Imagem de Fundo / Gradiente */}
      <LinearGradient
        colors={["#4338ca", "#0f172a", "#020617"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header com Botão Fechar */}
          <View className="px-6 pt-2 flex-row justify-between items-center z-10">
            <TouchableOpacity
              onPress={handleRestore}
              className="px-3 py-1 rounded-full bg-white/10"
            >
              <Text className="text-white/60 text-xs font-bold">Restaurar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
            >
              <X size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Conteúdo Principal */}
          <View className="px-6 mt-6 items-center">
            {/* Ícone de Coroa Animado */}
            <Animated.View
              entering={FadeInUp.springify()}
              className="w-24 h-24 bg-indigo-500 rounded-full items-center justify-center mb-6 shadow-2xl shadow-indigo-500/50"
            >
              <Crown size={48} color="white" fill="white" />
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(100)}
              className="text-4xl font-black text-white text-center mb-2"
            >
              Oneiro <Text className="text-indigo-400">Pro</Text>
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.delay(200)}
              className="text-slate-300 text-center text-base mb-10 px-4 leading-6"
            >
              Desbloqueie todo o poder do seu subconsciente com inteligência
              artificial e análises profundas.
            </Animated.Text>

            {/* Lista de Benefícios */}
            <View className="w-full mb-10 pl-2">
              <BenefitRow
                delay={300}
                icon={Sparkles}
                text="Interpretação de Sonhos com IA"
              />
              <BenefitRow
                delay={400}
                icon={Zap}
                text="Geração Ilimitada de Imagens"
              />
              <BenefitRow
                delay={500}
                icon={Star}
                text="Estatísticas e Gráficos Avançados"
              />
              <BenefitRow
                delay={600}
                icon={ShieldCheck}
                text="Backup na Nuvem e Sem Anúncios"
              />
            </View>

            {/* Seleção de Planos */}
            <View className="flex-row gap-4 w-full mb-8">
              {/* Plano Mensal */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => selectPlan("monthly")}
                className="flex-1"
              >
                <Animated.View
                  style={[animatedMonthlyStyle]}
                  className={`p-4 rounded-2xl border-2 ${selectedPlan === "monthly" ? "bg-indigo-900/40 border-indigo-500" : "bg-slate-900/40 border-slate-800"}`}
                >
                  <Text className="text-slate-400 font-bold mb-1">Mensal</Text>
                  <Text className="text-white text-xl font-bold">R$ 14,90</Text>
                  <Text className="text-slate-500 text-xs">/mês</Text>
                </Animated.View>
              </TouchableOpacity>

              {/* Plano Anual (Destaque) */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => selectPlan("yearly")}
                className="flex-1"
              >
                {/* Badge de Desconto */}
                <View className="absolute -top-3 right-0 left-0 items-center z-10">
                  <View className="bg-emerald-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-[10px] font-bold uppercase">
                      Economize 30%
                    </Text>
                  </View>
                </View>

                <Animated.View
                  style={[animatedYearlyStyle]}
                  className={`p-4 rounded-2xl border-2 ${selectedPlan === "yearly" ? "bg-indigo-900/40 border-indigo-500" : "bg-slate-900/40 border-slate-800"} relative`}
                >
                  <Text className="text-slate-400 font-bold mb-1">Anual</Text>
                  <Text className="text-white text-xl font-bold">
                    R$ 119,90
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    apenas R$ 9,99/mês
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Botão de Compra */}
            <Animated.View entering={FadeInUp.delay(700)} className="w-full">
              <TouchableOpacity
                onPress={handlePurchase}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#6366f1", "#4f46e5", "#4338ca"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full py-4 rounded-full items-center justify-center shadow-lg shadow-indigo-500/50"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-black text-lg uppercase tracking-wider">
                      {selectedPlan === "yearly"
                        ? "Começar Agora"
                        : "Assinar Mensal"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <Text className="text-slate-500 text-xs text-center mt-4">
                Cobrança recorrente, cancele quando quiser.
              </Text>
            </Animated.View>

            {/* Links Legais (Obrigatório para Google/Apple) */}
            <View className="flex-row gap-6 mt-8">
              <TouchableOpacity
                onPress={() => openLink("https://seusite.com/terms")}
              >
                <Text className="text-slate-500 text-xs underline">
                  Termos de Uso
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openLink("https://seusite.com/privacy")}
              >
                <Text className="text-slate-500 text-xs underline">
                  Política de Privacidade
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
