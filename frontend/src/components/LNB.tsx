import { AuthPanel } from "./AuthPanel";

export function LNB() {
  return (
    <aside
      className="w-full border-b border-app-border p-4 md:w-app-lnb md:flex-none md:border-r md:border-b-0"
      aria-label="LNB"
    >
      <AuthPanel />
    </aside>
  );
}
