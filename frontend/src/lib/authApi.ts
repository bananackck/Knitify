import { apiRequest } from "./apiClient";

export type AuthMember = {
  id: number;
  loginId: string;
  nickname: string;
};

export function fetchCurrentMember() {
  return apiRequest<AuthMember>("/auth/me");
}

export function login(loginId: string, password: string) {
  return apiRequest<AuthMember>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ loginId, password }) },
    false,
  );
}

export function signup(loginId: string, password: string, nickname: string) {
  return apiRequest<AuthMember>(
    "/auth/signup",
    { method: "POST", body: JSON.stringify({ loginId, password, nickname }) },
    false,
  );
}

export function logout() {
  return apiRequest<void>("/auth/logout", { method: "POST" }, false);
}
