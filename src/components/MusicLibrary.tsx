import { useEffect, useState } from "react";
import {
  fetchSpotifyLibraryPlaylists,
  type SpotifyLibraryPlaylist,
} from "../lib/spotifyLibrary";

type MusicLibraryProps = {
  accessToken: string | null;
};

export function MusicLibrary({ accessToken }: MusicLibraryProps) {
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
};

function LibraryContent({
  playlists,
  errorMessage,
  isLoading,
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
          <div className="aspect-square overflow-hidden rounded-app-panel bg-panel">
            {playlist.imageUrl ? (
              <img
                src={playlist.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-app-text">
            {playlist.name}
          </p>
          <p className="truncate text-xs text-app-muted">
            {playlist.trackCount === null
              ? "플레이리스트"
              : `${playlist.trackCount}곡`}
          </p>
          <p className="truncate text-xs text-app-muted">
            {playlist.ownerName}
          </p>
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
