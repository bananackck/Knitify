import type { SpotifyLibraryPlaylist } from "./spotifyLibrary";

const RECENT_PLAYLIST_KEY = "knitify.recentPlaylist";
const RECENT_TRACK_KEY = "knitify.recentTrack";

export type RecentTrack = {
  uri: string;
  name: string;
  imageUrl: string | null;
};

function readStoredValue<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function storeValue<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간이 차단된 환경에서도 재생 기능은 계속 동작하게 둡니다.
  }
}

export function getRecentPlaylist() {
  return readStoredValue<SpotifyLibraryPlaylist>(RECENT_PLAYLIST_KEY);
}

export function storeRecentPlaylist(playlist: SpotifyLibraryPlaylist) {
  storeValue(RECENT_PLAYLIST_KEY, playlist);
}

export function getRecentTrack() {
  return readStoredValue<RecentTrack>(RECENT_TRACK_KEY);
}

export function storeRecentTrack(track: RecentTrack) {
  storeValue(RECENT_TRACK_KEY, track);
}
