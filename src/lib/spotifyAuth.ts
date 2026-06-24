const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const TOKEN_STORAGE_KEY = "knitify.spotify.token";
const VERIFIER_STORAGE_KEY = "knitify.spotify.codeVerifier";
const STATE_STORAGE_KEY = "knitify.spotify.state";

const scopes = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
];

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: "Bearer";
};

type StoredSpotifyToken = SpotifyTokenResponse & {
  expires_at: number;
};

let loginCompletionPromise: Promise<string | null> | null = null;

export function getSpotifyConfig() {
  return {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined,
    redirectUri:
      (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined) ??
      window.location.origin + "/",
    defaultUri: import.meta.env.VITE_SPOTIFY_DEFAULT_URI as string | undefined,
  };
}

export function getStoredSpotifyToken() {
  const rawToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!rawToken) {
    return null;
  }

  const token = JSON.parse(rawToken) as StoredSpotifyToken;

  if (Date.now() >= token.expires_at) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }

  return token.access_token;
}

export async function redirectToSpotifyLogin() {
  const { clientId, redirectUri } = getSpotifyConfig();

  if (!clientId) {
    throw new Error("VITE_SPOTIFY_CLIENT_ID가 설정되지 않았습니다.");
  }

  const codeVerifier = generateRandomString(64);
  const state = generateRandomString(24);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
    state,
  });

  localStorage.setItem(VERIFIER_STORAGE_KEY, codeVerifier);
  localStorage.setItem(STATE_STORAGE_KEY, state);
  window.location.assign(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
}

export function completeSpotifyLoginFromUrl() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return Promise.resolve(getStoredSpotifyToken());
  }

  loginCompletionPromise ??= exchangeSpotifyCode(url, code, state).finally(
    () => {
      loginCompletionPromise = null;
    },
  );

  return loginCompletionPromise;
}

async function exchangeSpotifyCode(
  url: URL,
  code: string,
  state: string | null,
) {
  const expectedState = localStorage.getItem(STATE_STORAGE_KEY);
  const codeVerifier = localStorage.getItem(VERIFIER_STORAGE_KEY);

  if (!codeVerifier || !state || state !== expectedState) {
    throw new Error("Spotify 인증 상태를 확인할 수 없습니다.");
  }

  const { clientId, redirectUri } = getSpotifyConfig();

  if (!clientId) {
    throw new Error("VITE_SPOTIFY_CLIENT_ID가 설정되지 않았습니다.");
  }

  window.history.replaceState({}, document.title, url.pathname);

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    localStorage.removeItem(VERIFIER_STORAGE_KEY);
    localStorage.removeItem(STATE_STORAGE_KEY);

    throw new Error(await getSpotifyTokenErrorMessage(response));
  }

  const token = (await response.json()) as SpotifyTokenResponse;
  const storedToken: StoredSpotifyToken = {
    ...token,
    expires_at: Date.now() + token.expires_in * 1000,
  };

  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(storedToken));
  localStorage.removeItem(VERIFIER_STORAGE_KEY);
  localStorage.removeItem(STATE_STORAGE_KEY);

  return token.access_token;
}

export function logoutSpotify() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(VERIFIER_STORAGE_KEY);
  localStorage.removeItem(STATE_STORAGE_KEY);
}

function generateRandomString(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(values)
    .map((value) => possible[value % possible.length])
    .join("");
}

async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getSpotifyTokenErrorMessage(response: Response) {
  const fallbackMessage = "Spotify 토큰 발급에 실패했습니다.";

  try {
    const body = (await response.json()) as {
      error?: string;
      error_description?: string;
    };

    return body.error_description
      ? `${fallbackMessage} ${body.error_description}`
      : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
