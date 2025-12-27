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

  // 👇 Mudança 1: Renomeado de logout para signOut (padrão Supabase)
  signOut: () => Promise<void>;

  // 👇 Mudança 2: Adicionada a função refreshSession
  refreshSession: () => Promise<void>;
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

  // 👇 Nova função: Serve para atualizar os dados do usuário na tela
  // sem precisar fazer logout/login de novo. Útil após editar perfil.
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

  // 👇 Renomeado para signOut para bater com a tela de Profile
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
