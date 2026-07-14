const API_PREFIX = "/api";
let csrf: { headerName: string; token: string } | null = null;
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retryAuth = true,
): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await getCsrfToken();
    headers.set(csrfToken.headerName, csrfToken.token);
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retryAuth && path !== "/auth/refresh") {
    if (await refreshAuthentication()) {
      return apiRequest<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

async function getCsrfToken() {
  if (csrf) return csrf;
  const response = await fetch(`${API_PREFIX}/auth/csrf`, {
    credentials: "include",
  });
  if (!response.ok)
    throw new ApiError(response.status, "보안 토큰을 가져오지 못했습니다.");
  csrf = (await response.json()) as typeof csrf;
  if (!csrf) throw new ApiError(500, "보안 토큰 응답이 올바르지 않습니다.");
  return csrf;
}

async function refreshAuthentication() {
  refreshPromise ??= apiRequest<unknown>(
    "/auth/refresh",
    { method: "POST" },
    false,
  )
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "요청을 처리하지 못했습니다.";
  }
}
