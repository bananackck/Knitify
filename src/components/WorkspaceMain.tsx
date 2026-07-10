import { useState } from "react";
import { getStoredSpotifyToken } from "../lib/spotifyAuth";
import { MusicLibrary } from "./MusicLibrary";
import { MusicPlayer } from "./MusicPlayer";
import type { SpotifyLibraryPlaylist } from "../lib/spotifyLibrary";
import {
  getRecentPlaylist,
  storeRecentPlaylist,
} from "../lib/musicPersistence";

export function WorkspaceMain() {
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(
    () => getStoredSpotifyToken(),
  );
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyLibraryPlaylist | null>(() => getRecentPlaylist());

  const handlePlaylistSelect = (playlist: SpotifyLibraryPlaylist) => {
    setSelectedPlaylist(playlist);
    storeRecentPlaylist(playlist);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-app-gap md:p-6">
      <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-app-gap">
        <section
          className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:h-[180px] md:min-h-0"
          aria-label="작품 미리보기"
        >
          작품 ai 완성본 예측 사진
        </section>
        <section
          className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:h-24 md:min-h-0"
          aria-label="시계와 타이머"
        >
          시계 / 타이머
        </section>
        <section
          className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:h-24 md:min-h-0"
          aria-label="카운터"
        >
          카운터들
        </section>
      </div>

      <div className="flex min-w-0 flex-[2] flex-col gap-4 md:gap-app-gap">
        <section className="md:h-full">
          <MusicPlayer
            accessToken={spotifyAccessToken}
            onAccessTokenChange={setSpotifyAccessToken}
            selectedPlaylistName={selectedPlaylist?.name ?? null}
            selectedPlaylistUri={selectedPlaylist?.uri ?? null}
          />
        </section>
        <MusicLibrary
          accessToken={spotifyAccessToken}
          selectedPlaylistId={selectedPlaylist?.id ?? null}
          onPlaylistSelect={handlePlaylistSelect}
        />
      </div>
    </main>
  );
}
