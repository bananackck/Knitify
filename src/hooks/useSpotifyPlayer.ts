import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  completeSpotifyLoginFromUrl,
  getSpotifyConfig,
  logoutSpotify,
  redirectToSpotifyLogin,
} from "../lib/spotifyAuth";
import { getRecentTrack, storeRecentTrack } from "../lib/musicPersistence";
import {
  loadSpotifyPlaybackSdk,
  startSpotifyPlayback,
  transferSpotifyPlayback,
} from "../lib/spotifyPlayback";

type UseSpotifyPlayerOptions = {
  accessToken: string | null;
  onAccessTokenChange: (accessToken: string | null) => void;
  selectedPlaylistUri: string | null;
  playlistPlaybackRequestId: number;
};

export function useSpotifyPlayer({
  accessToken,
  onAccessTokenChange,
  selectedPlaylistUri,
  playlistPlaybackRequestId,
}: UseSpotifyPlayerOptions) {
  const recentTrack = useMemo(() => getRecentTrack(), []);
  const { clientId, defaultUri } = useMemo(() => getSpotifyConfig(), []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTrackImageUrl, setCurrentTrackImageUrl] = useState<
    string | null
  >(recentTrack?.imageUrl ?? null);
  const [currentTrackName, setCurrentTrackName] = useState<string | null>(
    recentTrack?.name ?? null,
  );
  const [currentTrackArtistName, setCurrentTrackArtistName] = useState<
    string | null
  >(recentTrack?.artistName ?? null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const activePlaybackUriRef = useRef<string | null>(null);
  const recentTrackRef = useRef(recentTrack);
  const hasRestoredPlaybackRef = useRef(false);
  const handledPlaylistRequestRef = useRef(0);
  const playlistRequestIdRef = useRef(playlistPlaybackRequestId);

  useEffect(() => {
    playlistRequestIdRef.current = playlistPlaybackRequestId;
  }, [playlistPlaybackRequestId]);

  useEffect(() => {
    completeSpotifyLoginFromUrl()
      .then((token) => token && onAccessTokenChange(token))
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
  }, [onAccessTokenChange]);

  useEffect(() => {
    if (!accessToken || playerRef.current) {
      return;
    }

    let isActive = true;

    loadSpotifyPlaybackSdk()
      .then(() => {
        if (!isActive || !window.Spotify) {
          return;
        }

        const player = new window.Spotify.Player({
          name: "Knitify Music Player",
          getOAuthToken: (callback) => callback(accessToken),
          volume: 0.6,
        });

        player.addListener("ready", ({ device_id }) => {
          setDeviceId(device_id);
          transferSpotifyPlayback(accessToken, device_id)
            .then(async () => {
              const storedTrack = recentTrackRef.current;

              if (
                !storedTrack ||
                hasRestoredPlaybackRef.current ||
                playlistRequestIdRef.current > 0
              ) {
                return;
              }

              hasRestoredPlaybackRef.current = true;
              await startSpotifyPlayback(
                accessToken,
                device_id,
                storedTrack.uri,
              );
              activePlaybackUriRef.current = storedTrack.uri;
            })
            .catch((error: unknown) => {
              setErrorMessage(getErrorMessage(error));
            });
        });

        player.addListener("not_ready", () => {
          setDeviceId(null);
        });

        player.addListener("player_state_changed", (state) => {
          if (!state) {
            return;
          }

          const currentTrack = state.track_window.current_track;
          const imageUrl = currentTrack.album.images[0]?.url ?? null;
          const artistName = currentTrack.artists
            .map((artist) => artist.name)
            .join(", ");

          setIsPlaying(!state.paused);
          setCurrentTrackImageUrl(imageUrl);
          setCurrentTrackName(currentTrack.name);
          setCurrentTrackArtistName(artistName);
          recentTrackRef.current = {
            uri: currentTrack.uri,
            name: currentTrack.name,
            artistName,
            imageUrl,
          };
          storeRecentTrack(recentTrackRef.current);
        });

        const handlePlayerError = (error: Spotify.WebPlaybackError) =>
          setErrorMessage(error.message);

        player.addListener("initialization_error", handlePlayerError);
        player.addListener("authentication_error", handlePlayerError);
        player.addListener("account_error", handlePlayerError);
        player.addListener("playback_error", handlePlayerError);
        player.connect().then((connected) => {
          if (!connected) {
            setErrorMessage("Spotify 플레이어 연결에 실패했습니다.");
          }
        });

        playerRef.current = player;
      })
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));

    return () => {
      isActive = false;
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [accessToken]);

  useEffect(() => {
    if (
      playlistPlaybackRequestId === 0 ||
      handledPlaylistRequestRef.current === playlistPlaybackRequestId ||
      !accessToken ||
      !deviceId ||
      !selectedPlaylistUri
    ) {
      return;
    }

    handledPlaylistRequestRef.current = playlistPlaybackRequestId;
    setErrorMessage(null);
    startSpotifyPlayback(accessToken, deviceId, selectedPlaylistUri)
      .then(() => {
        activePlaybackUriRef.current = selectedPlaylistUri;
      })
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
  }, [accessToken, deviceId, playlistPlaybackRequestId, selectedPlaylistUri]);

  const login = useCallback(() => {
    redirectToSpotifyLogin().catch((error: unknown) =>
      setErrorMessage(getErrorMessage(error)),
    );
  }, []);

  const logout = useCallback(() => {
    logoutSpotify();
    playerRef.current?.disconnect();
    playerRef.current = null;
    onAccessTokenChange(null);
    activePlaybackUriRef.current = null;
    setDeviceId(null);
    setIsPlaying(false);
    setCurrentTrackImageUrl(null);
    setCurrentTrackName(null);
    setCurrentTrackArtistName(null);
    hasRestoredPlaybackRef.current = false;
  }, [onAccessTokenChange]);

  const togglePlay = useCallback(async () => {
    const player = playerRef.current;

    if (!player || !accessToken || !deviceId) {
      setIsPlaying((current) => !current);
      return;
    }

    try {
      if (isPlaying || activePlaybackUriRef.current) {
        await player.togglePlay();
        return;
      }
      const playbackUri =
        selectedPlaylistUri ?? recentTrackRef.current?.uri ?? defaultUri;

      if (playbackUri && activePlaybackUriRef.current !== playbackUri) {
        await startSpotifyPlayback(accessToken, deviceId, playbackUri);
        activePlaybackUriRef.current = playbackUri;
        return;
      }

      await player.togglePlay();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [accessToken, defaultUri, deviceId, isPlaying, selectedPlaylistUri]);

  const previousTrack = useCallback(() => {
    playerRef.current
      ?.previousTrack()
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
  }, []);

  const nextTrack = useCallback(() => {
    playerRef.current
      ?.nextTrack()
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
  }, []);

  return {
    canUseSpotify: Boolean(clientId),
    currentTrackArtistName,
    currentTrackImageUrl,
    currentTrackName,
    deviceId,
    errorMessage,
    isPlaying,
    login,
    logout,
    nextTrack,
    previousTrack,
    togglePlay,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Spotify 처리 중 오류가 발생했습니다.";
}
