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
  logout: () => Promise<void>; // Nova função tipada
};

const useAuthStore = create<AuthState>((set) => ({
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

  logout: async () => {
    set({ isLoading: true });
    try {
      // 1. Limpa a sessão no Supabase e no AsyncStorage
      await supabase.auth.signOut();

      // 2. Limpa o estado global do App
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.log("Logout error", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
