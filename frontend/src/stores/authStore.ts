import { create } from "zustand";
import * as authApi from "../lib/authApi";
import type { AuthMember } from "../lib/authApi";

type AuthState = {
  member: AuthMember | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (loginId: string, password: string) => Promise<void>;
  signup: (
    loginId: string,
    password: string,
    nickname: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

let initializePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  member: null,
  isLoading: true,
  isInitialized: false,
  initialize: async () => {
    if (get().isInitialized) return;
    if (initializePromise) return initializePromise;

    initializePromise = authApi
      .fetchCurrentMember()
      .then((member) => set({ member }))
      .catch(() => set({ member: null }))
      .finally(() => {
        set({ isLoading: false, isInitialized: true });
        initializePromise = null;
      });

    return initializePromise;
  },
  login: async (loginId, password) => {
    set({ member: await authApi.login(loginId, password) });
  },
  signup: async (loginId, password, nickname) => {
    set({ member: await authApi.signup(loginId, password, nickname) });
  },
  logout: async () => {
    await authApi.logout();
    set({ member: null });
  },
}));
