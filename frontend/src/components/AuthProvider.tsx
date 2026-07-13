import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "../hooks/useAuth";
import * as authApi from "../lib/authApi";
import type { AuthMember } from "../lib/authApi";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<AuthMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .fetchCurrentMember()
      .then(setMember)
      .catch(() => setMember(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      member,
      isLoading,
      login: async (loginId, password) =>
        setMember(await authApi.login(loginId, password)),
      signup: async (loginId, password, nickname) =>
        setMember(await authApi.signup(loginId, password, nickname)),
      logout: async () => {
        await authApi.logout();
        setMember(null);
      },
    }),
    [isLoading, member],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
