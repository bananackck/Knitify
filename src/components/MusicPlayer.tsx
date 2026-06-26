import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  completeSpotifyLoginFromUrl,
  getSpotifyConfig,
  logoutSpotify,
  redirectToSpotifyLogin,
} from "../lib/spotifyAuth";
import {
  loadSpotifyPlaybackSdk,
  startSpotifyPlayback,
  transferSpotifyPlayback,
} from "../lib/spotifyPlayback";

type MusicPlayerProps = {
  accessToken: string | null;
  onAccessTokenChange: (accessToken: string | null) => void;
  selectedPlaylistName: string | null;
  selectedPlaylistUri: string | null;
};

export function MusicPlayer({
  accessToken,
  onAccessTokenChange,
  selectedPlaylistName,
  selectedPlaylistUri,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState("Spotify 연결 대기 중");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTrackImageUrl, setCurrentTrackImageUrl] = useState<
    string | null
  >(null);
  const [currentTrackName, setCurrentTrackName] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const activePlaybackUriRef = useRef<string | null>(null);

  const { clientId, defaultUri } = useMemo(() => getSpotifyConfig(), []);
  const canUseSpotify = Boolean(clientId);

  useEffect(() => {
    completeSpotifyLoginFromUrl()
      .then((token) => {
        if (token) {
          onAccessTokenChange(token);
        }
      })
      .catch((error: unknown) => {
        setErrorMessage(getErrorMessage(error));
      });
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
          setStatus("Spotify 플레이어 준비 완료");
          transferSpotifyPlayback(accessToken, device_id).catch(
            (error: unknown) => setErrorMessage(getErrorMessage(error)),
          );
        });

        player.addListener("not_ready", () => {
          setDeviceId(null);
          setStatus("Spotify 플레이어 연결이 끊어졌습니다.");
        });

        player.addListener("player_state_changed", (state) => {
          if (!state) {
            return;
          }

          setIsPlaying(!state.paused);
          setCurrentTrackImageUrl(
            state.track_window.current_track.album.images[0]?.url ?? null,
          );
          setCurrentTrackName(state.track_window.current_track.name);
        });

        player.addListener("initialization_error", (error) =>
          setErrorMessage(error.message),
        );
        player.addListener("authentication_error", (error) =>
          setErrorMessage(error.message),
        );
        player.addListener("account_error", (error) =>
          setErrorMessage(error.message),
        );
        player.addListener("playback_error", (error) =>
          setErrorMessage(error.message),
        );

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

  const handleSpotifyLogin = useCallback(() => {
    redirectToSpotifyLogin().catch((error: unknown) =>
      setErrorMessage(getErrorMessage(error)),
    );
  }, []);

  const handleSpotifyLogout = useCallback(() => {
    logoutSpotify();
    playerRef.current?.disconnect();
    playerRef.current = null;
    onAccessTokenChange(null);
    activePlaybackUriRef.current = null;
    setDeviceId(null);
    setIsPlaying(false);
    setCurrentTrackImageUrl(null);
    setCurrentTrackName(null);
    setStatus("Spotify 연결 대기 중");
  }, [onAccessTokenChange]);

  const handleTogglePlay = useCallback(async () => {
    const player = playerRef.current;

    if (!player || !accessToken || !deviceId) {
      setIsPlaying((current) => !current);
      return;
    }

    try {
      const playbackUri = selectedPlaylistUri ?? defaultUri;

      if (playbackUri && activePlaybackUriRef.current !== playbackUri) {
        await startSpotifyPlayback(accessToken, deviceId, playbackUri);
        activePlaybackUriRef.current = playbackUri;
        setStatus(
          selectedPlaylistName
            ? `${selectedPlaylistName} 재생 중`
            : "Spotify 재생 중",
        );
        return;
      }

      await player.togglePlay();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [
    accessToken,
    defaultUri,
    deviceId,
    selectedPlaylistName,
    selectedPlaylistUri,
  ]);

  const handlePreviousTrack = useCallback(() => {
    playerRef.current
      ?.previousTrack()
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
  }, []);

  const handleNextTrack = useCallback(() => {
    playerRef.current
      ?.nextTrack()
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)));
  }, []);

  return (
    <section
      className="flex h-full min-h-[320px] min-w-0 flex-col items-center justify-center gap-5 rounded-app-panel p-6"
      aria-label="음악 플레이어"
    >
      <div className="relative flex aspect-square w-full max-w-88 items-center justify-center rounded-full bg-primary shadow-[inset_0_-10px_24px_rgba(31,26,23,0.08),0_18px_32px_rgba(31,26,23,0.08)]">
        <div className="absolute right-[18%] top-[15%] z-10 h-[20%] w-1.5 origin-top rotate-[40deg] rounded-full bg-app-muted/60" />
        <img
          src={currentTrackImageUrl ?? "/cd.svg"}
          alt={
            currentTrackName
              ? `${currentTrackName} 앨범 커버`
              : "음악 플레이어 CD"
          }
          className={`aspect-square w-[90%] animate-spin rounded-full drop-shadow-[0_10px_20px_rgba(31,26,23,0.18)] [animation-duration:3s] [animation-timing-function:linear] motion-reduce:animate-none ${
            isPlaying
              ? "[animation-play-state:running]"
              : "[animation-play-state:paused]"
          }`}
        />
      </div>

      <div className="flex items-center gap-3 rounded-full border border-app-border bg-control-panel px-4 py-2 shadow-[0_8px_20px_rgba(31,26,23,0.08)]">
        <IconButton
          aria-label="이전 곡"
          size="medium"
          disabled={!accessToken}
          onClick={handlePreviousTrack}
        >
          <SkipPreviousRoundedIcon />
        </IconButton>
        <IconButton
          aria-label={isPlaying ? "일시정지" : "재생"}
          size="large"
          disabled={Boolean(accessToken && !deviceId)}
          onClick={handleTogglePlay}
          sx={{
            backgroundColor: "var(--color-black)",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "var(--color-black-hover)",
            },
          }}
        >
          {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </IconButton>
        <IconButton
          aria-label="다음 곡"
          size="medium"
          disabled={!accessToken}
          onClick={handleNextTrack}
        >
          <SkipNextRoundedIcon />
        </IconButton>
      </div>

      <div className="flex max-w-72 flex-col items-center gap-2 text-center text-xs text-app-muted">
        {selectedPlaylistName ? (
          <span className="font-medium text-app-text">
            선택됨: {selectedPlaylistName}
          </span>
        ) : null}
        <span>{errorMessage ?? status}</span>
        {canUseSpotify ? (
          accessToken ? (
            <Button size="small" variant="text" onClick={handleSpotifyLogout}>
              Spotify 연결 해제
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={handleSpotifyLogin}
            >
              Spotify 연결
            </Button>
          )
        ) : (
          <span>VITE_SPOTIFY_CLIENT_ID를 설정해 주세요.</span>
        )}
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Spotify 처리 중 오류가 발생했습니다.";
}
