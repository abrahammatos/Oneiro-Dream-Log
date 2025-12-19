import { CreateUserParams, SignInParams } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// 2. CONFIGURAR O CLIENTE CORRETAMENTE
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Aqui está o segredo!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// lib/supabase.ts ATUALIZADO
export const createUser = async ({
  name,
  username,
  email,
  password,
}: CreateUserParams) => {
  try {
    // 1. Verificamos se o username existe (isso continua igual)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      throw new Error("Este nome de usuário já está em uso.");
    }

    // 2. Criamos o usuário passando os dados extras em "data"
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          username: username,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
        },
      },
    });

    if (authError) throw authError;

    // NÃO fazemos mais o insert manual aqui. O Trigger do banco fará isso.

    return authData.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async () => {
  try {
    // Tenta pegar a sessão
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // SE NÃO TIVER SESSÃO: Não é erro, é apenas null
    if (sessionError || !session) {
      console.log("Nenhuma sessão ativa. Usuário deslogado.");
      return null; // <--- MUDANÇA IMPORTANTE: Retorna null em vez de throw Error
    }

    // Se tem sessão, busca o perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles") // ou 'users' dependendo da sua tabela
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    // Retorna o objeto combinado
    return {
      ...session.user,
      profile: profile, // pode ser null, mas o user existe
    };
  } catch (error) {
    console.log("Erro inesperado no getCurrentUser:", error);
    return null;
  }
};

const fetchProfile = async (user: any) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle(); // <--- MUDE DE .single() PARA .maybeSingle()

  if (profileError) {
    console.error("Erro ao buscar profile:", profileError);
    // Retorna o usuário mesmo sem perfil, para não travar o app
    return { ...user, profile: null };
  }

  // Se não tem perfil (profile é null), retorna user + profile null
  if (!profile) {
    console.log("Perfil não encontrado para este usuário.");
    return { ...user, profile: null };
  }

  return { ...user, ...profile };
};
