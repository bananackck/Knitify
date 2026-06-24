const SPOTIFY_PLAYLISTS_URL = "https://api.spotify.com/v1/me/playlists";

type SpotifyImage = {
  url: string;
};

type SpotifyPlaylistOwner = {
  display_name: string | null;
};

type SpotifyPlaylistsResponse = {
  items: {
    id: string;
    name: string;
    images: SpotifyImage[];
    owner: SpotifyPlaylistOwner;
    items?: {
      total: number;
    };
    tracks?: {
      total: number;
    };
  }[];
};

export type SpotifyLibraryPlaylist = {
  id: string;
  name: string;
  ownerName: string;
  trackCount: number | null;
  imageUrl: string | null;
};

export async function fetchSpotifyLibraryPlaylists(accessToken: string) {
  const params = new URLSearchParams({
    limit: "50",
  });

  const response = await fetch(`${SPOTIFY_PLAYLISTS_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getSpotifyLibraryErrorMessage(response));
  }

  const data = (await response.json()) as SpotifyPlaylistsResponse;

  return data.items.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    ownerName: playlist.owner.display_name ?? "알 수 없음",
    trackCount: playlist.items?.total ?? playlist.tracks?.total ?? null,
    imageUrl: playlist.images[0]?.url ?? null,
  }));
}

async function getSpotifyLibraryErrorMessage(response: Response) {
  if (response.status === 401) {
    return "Spotify 로그인이 만료되었습니다. 연결 해제 후 다시 연결해 주세요.";
  }

  if (response.status === 403) {
    return "Spotify 플레이리스트 권한이 없습니다. 연결 해제 후 다시 연결해 주세요.";
  }

  try {
    const body = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    return body.error?.message
      ? `Spotify 플레이리스트를 불러오지 못했습니다. ${body.error.message}`
      : "Spotify 플레이리스트를 불러오지 못했습니다.";
  } catch {
    return "Spotify 플레이리스트를 불러오지 못했습니다.";
  }
}
