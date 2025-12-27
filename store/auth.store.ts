import { getCurrentUser, supabase } from "@/lib/supabase";
import { User } from "@/type";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;

  // 👇 As duas funções de atualização (mantive ambas para compatibilidade)
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<void>;

  signOut: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });

    try {
      // getCurrentUser busca tanto Auth quanto a tabela Profiles (onde está o isPro)
      const user = await getCurrentUser();

      if (user) {
        set({ isAuthenticated: true, user: user as unknown as User });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.log("fetchAuthenticatedUser error", error);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  // 👇 Função usada para atualizar dados sem loading full (ex: editar perfil)
  refreshSession: async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        set({ user: user as unknown as User });
      }
    } catch (error) {
      console.log("Erro ao recarregar sessão", error);
    }
  },

  // 👇 AQUI ESTAVA O ERRO: Agora usamos a lógica correta
  // Essa função é chamada pelo Paywall para atualizar o status Pro
  refreshUser: async () => {
    try {
      // Não usamos supabase.auth.getUser() aqui, pois ele não traz o 'is_pro'
      // Usamos getCurrentUser() que traz tudo.
      const user = await getCurrentUser();

      if (user) {
        // Atualiza o estado com o usuário novo (agora com isPro: true)
        set({ user: user as unknown as User });
      }
    } catch (error) {
      console.log("Erro ao dar refresh no usuário:", error);
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.log("Logout error", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
