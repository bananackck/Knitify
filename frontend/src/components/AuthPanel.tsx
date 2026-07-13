import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

export function AuthPanel() {
  const { member, isLoading, login, signup, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading)
    return (
      <p className="text-xs text-app-muted">회원 정보를 확인하는 중입니다.</p>
    );
  if (member) {
    return (
      <section className="flex flex-col gap-2" aria-label="회원 정보">
        <p className="text-sm font-semibold">{member.nickname}</p>
        <p className="text-xs text-app-muted">@{member.loginId}</p>
        <button
          className="rounded-app-panel border border-app-border px-3 py-2 text-xs"
          onClick={() => void logout()}
        >
          로그아웃
        </button>
      </section>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const loginId = String(values.get("loginId"));
      const password = String(values.get("password"));
      if (mode === "signup")
        await signup(loginId, password, String(values.get("nickname")));
      else await login(loginId, password);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "인증에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-3" aria-label="회원 인증">
      <h2 className="text-sm font-semibold">
        {mode === "login" ? "로그인" : "회원가입"}
      </h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          name="loginId"
          required
          placeholder="아이디"
          className="rounded-app-panel border border-app-border px-3 py-2 text-sm"
        />
        <input
          name="password"
          required
          type="password"
          minLength={8}
          placeholder="비밀번호"
          className="rounded-app-panel border border-app-border px-3 py-2 text-sm"
        />
        {mode === "signup" ? (
          <input
            name="nickname"
            required
            minLength={2}
            maxLength={30}
            placeholder="닉네임"
            className="rounded-app-panel border border-app-border px-3 py-2 text-sm"
          />
        ) : null}
        {errorMessage ? (
          <p className="text-xs text-red-700">{errorMessage}</p>
        ) : null}
        <button
          disabled={isSubmitting}
          className="rounded-app-panel bg-app-text px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "처리 중..."
            : mode === "login"
              ? "로그인"
              : "가입하기"}
        </button>
      </form>
      <button
        className="text-xs text-app-muted underline"
        onClick={() =>
          setMode((current) => (current === "login" ? "signup" : "login"))
        }
      >
        {mode === "login" ? "계정 만들기" : "로그인으로 돌아가기"}
      </button>
    </section>
  );
}
