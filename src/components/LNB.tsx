import { useState } from "react";
import { getStoredSpotifyToken } from "../lib/spotifyAuth";
import type { SpotifyLibraryPlaylist } from "../lib/spotifyLibrary";
import {
  getRecentPlaylist,
  storeRecentPlaylist,
} from "../lib/musicPersistence";
import { MusicLibrary } from "./MusicLibrary";
import { MusicPlayer } from "./MusicPlayer";

export function LNB() {
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(
    () => getStoredSpotifyToken(),
  );
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyLibraryPlaylist | null>(() => getRecentPlaylist());
  const [playlistPlaybackRequestId, setPlaylistPlaybackRequestId] = useState(0);

  const handlePlaylistSelect = (playlist: SpotifyLibraryPlaylist) => {
    setSelectedPlaylist(playlist);
    storeRecentPlaylist(playlist);
    setPlaylistPlaybackRequestId((current) => current + 1);
  };

  return (
    <aside
      className="flex w-full flex-col gap-4 border-b border-app-border p-4 md:max-h-[calc(100svh-var(--spacing-app-header))] md:w-app-lnb md:flex-none md:border-r md:border-b-0"
      aria-label="LNB"
    >
      <MusicPlayer
        accessToken={spotifyAccessToken}
        onAccessTokenChange={setSpotifyAccessToken}
        selectedPlaylistName={selectedPlaylist?.name ?? null}
        selectedPlaylistUri={selectedPlaylist?.uri ?? null}
        playlistPlaybackRequestId={playlistPlaybackRequestId}
      />
      <MusicLibrary
        accessToken={spotifyAccessToken}
        selectedPlaylistId={selectedPlaylist?.id ?? null}
        onPlaylistSelect={handlePlaylistSelect}
      />
    </aside>
  );
}
