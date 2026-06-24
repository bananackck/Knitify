import { useEffect, useState } from "react";
import {
  fetchSpotifyLibraryPlaylists,
  type SpotifyLibraryPlaylist,
} from "../lib/spotifyLibrary";

type MusicLibraryProps = {
  accessToken: string | null;
  selectedPlaylistId: string | null;
  onPlaylistSelect: (playlist: SpotifyLibraryPlaylist) => void;
};

export function MusicLibrary({
  accessToken,
  selectedPlaylistId,
  onPlaylistSelect,
}: MusicLibraryProps) {
  const [playlists, setPlaylists] = useState<SpotifyLibraryPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive = true;

    Promise.resolve()
      .then(() => {
        if (isActive) {
          setIsLoading(true);
          setErrorMessage(null);
        }

        return fetchSpotifyLibraryPlaylists(accessToken);
      })
      .then((nextPlaylists) => {
        if (isActive) {
          setPlaylists(nextPlaylists);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(getErrorMessage(error));
          setPlaylists([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken]);

  return (
    <section
      className="flex min-h-32 min-w-0 flex-col gap-3 rounded-app-panel bg-surface p-4"
      aria-label="플리 선택 필터"
    >
      <h2 className="text-xs font-medium text-app-muted">라이브러리 탐색기</h2>

      {accessToken ? (
        <LibraryContent
          playlists={playlists}
          errorMessage={errorMessage}
          isLoading={isLoading}
          selectedPlaylistId={selectedPlaylistId}
          onPlaylistSelect={onPlaylistSelect}
        />
      ) : (
        <p className="flex min-h-20 items-center justify-center text-center text-[13px] text-app-muted">
          Spotify 연결 후 라이브러리를 볼 수 있어요.
        </p>
      )}
    </section>
  );
}

type LibraryContentProps = {
  playlists: SpotifyLibraryPlaylist[];
  errorMessage: string | null;
  isLoading: boolean;
  selectedPlaylistId: string | null;
  onPlaylistSelect: (playlist: SpotifyLibraryPlaylist) => void;
};

function LibraryContent({
  playlists,
  errorMessage,
  isLoading,
  selectedPlaylistId,
  onPlaylistSelect,
}: LibraryContentProps) {
  if (isLoading) {
    return (
      <p className="flex min-h-20 items-center justify-center text-center text-[13px] text-app-muted">
        라이브러리를 불러오는 중입니다.
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p className="flex min-h-20 items-center justify-center text-center text-[13px] text-app-muted">
        {errorMessage}
      </p>
    );
  }

  if (playlists.length === 0) {
    return (
      <p className="flex min-h-20 items-center justify-center text-center text-[13px] text-app-muted">
        저장된 플레이리스트가 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex min-w-0 list-none gap-4 overflow-x-auto p-0 pb-2">
      {playlists.map((playlist) => (
        <li key={playlist.id} className="w-24 shrink-0">
          <button
            type="button"
            aria-pressed={selectedPlaylistId === playlist.id}
            className="group w-full cursor-pointer rounded-app-panel text-left outline-none"
            onClick={() => onPlaylistSelect(playlist)}
          >
            <span
              className={`block aspect-square overflow-hidden rounded-app-panel border bg-panel transition ${
                selectedPlaylistId === playlist.id
                  ? "border-black shadow-[0_0_0_2px_rgba(31,26,23,0.18)]"
                  : "border-transparent group-hover:border-app-border"
              }`}
            >
              {playlist.imageUrl ? (
                <img
                  src={playlist.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </span>
            <span className="mt-2 block truncate text-sm font-semibold text-app-text">
              {playlist.name}
            </span>
            <span className="block truncate text-xs text-app-muted">
              {playlist.trackCount === null
                ? "플레이리스트"
                : `${playlist.trackCount}곡`}
            </span>
            <span className="block truncate text-xs text-app-muted">
              {playlist.ownerName}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Spotify 라이브러리 처리 중 오류가 발생했습니다.";
}
