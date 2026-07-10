const SPOTIFY_SDK_URL = "https://sdk.scdn.co/spotify-player.js";

export function loadSpotifyPlaybackSdk() {
  if (window.Spotify) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${SPOTIFY_SDK_URL}"]`,
    );

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = SPOTIFY_SDK_URL;
    script.async = true;
    script.onerror = () =>
      reject(new Error("Spotify SDK 로드에 실패했습니다."));

    document.body.appendChild(script);
  });
}

export async function transferSpotifyPlayback(token: string, deviceId: string) {
  const response = await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Spotify 재생 기기 전환에 실패했습니다.");
  }
}

export async function startSpotifyPlayback(
  token: string,
  deviceId: string,
  spotifyUri: string,
) {
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        spotifyUri.startsWith("spotify:track:")
          ? { uris: [spotifyUri] }
          : { context_uri: spotifyUri, offset: { position: 0 } },
      ),
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new Error("Spotify 재생 시작에 실패했습니다.");
  }
}
