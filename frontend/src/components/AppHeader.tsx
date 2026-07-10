export function AppHeader() {
  return (
    <header className="flex min-h-app-header items-center justify-between border-b border-app-border bg-surface-muted px-4">
      <a
        href="/"
        aria-label="메인으로 이동"
        className="inline-flex cursor-pointer items-center"
      >
        <img src="/logo.png" alt="Knitify Logo" className="h-8 w-24" />
      </a>
      <div className="flex h-8" aria-hidden="true"></div>
    </header>
  );
}
