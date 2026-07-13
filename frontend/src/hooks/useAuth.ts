import { createContext, useContext } from "react";
import type { AuthMember } from "../lib/authApi";

export type AuthContextValue = {
  member: AuthMember | null;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  signup: (
    loginId: string,
    password: string,
    nickname: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  return context;
}
