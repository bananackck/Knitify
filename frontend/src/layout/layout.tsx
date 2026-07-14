import { AppHeader } from "../components/AppHeader";
import { LNB } from "../components/LNB";
import { WorkspaceMain } from "../components/WorkspaceMain";
import { useInitializeAuth } from "../hooks/useInitializeAuth";

export function AppLayout() {
  useInitializeAuth();

  return (
    <div className="mx-auto flex min-h-svh w-full flex-col bg-surface">
      <AppHeader />
      <div className="flex min-h-[calc(100svh-var(--spacing-app-header))] flex-1 flex-col md:flex-row">
        <LNB />
        <WorkspaceMain />
      </div>
    </div>
  );
}
