import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

export function useInitializeAuth() {
  useEffect(() => {
    void useAuthStore.getState().initialize();
  }, []);
}
