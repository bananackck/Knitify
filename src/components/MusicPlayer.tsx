import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer";

type MusicPlayerProps = {
  accessToken: string | null;
  onAccessTokenChange: (accessToken: string | null) => void;
  selectedPlaylistName: string | null;
  selectedPlaylistUri: string | null;
  playlistPlaybackRequestId: number;
};

export function MusicPlayer({
  accessToken,
  onAccessTokenChange,
  selectedPlaylistName,
  selectedPlaylistUri,
  playlistPlaybackRequestId,
}: MusicPlayerProps) {
  const {
    canUseSpotify,
    currentTrackImageUrl,
    currentTrackName,
    deviceId,
    errorMessage,
    isPlaying,
    login,
    logout,
    nextTrack,
    previousTrack,
    status,
    togglePlay,
  } = useSpotifyPlayer({
    accessToken,
    onAccessTokenChange,
    selectedPlaylistName,
    selectedPlaylistUri,
    playlistPlaybackRequestId,
  });

  return (
    <section
      className="flex min-h-[280px] min-w-0 flex-col items-center justify-center gap-3 rounded-app-panel p-3"
      aria-label="음악 플레이어"
    >
      <div className="relative flex aspect-square w-full max-w-44 items-center justify-center rounded-full bg-primary shadow-[inset_0_-10px_24px_rgba(31,26,23,0.08),0_18px_32px_rgba(31,26,23,0.08)]">
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

      <div className="flex items-center gap-1 rounded-full border border-app-border bg-control-panel px-2 py-1 shadow-[0_8px_20px_rgba(31,26,23,0.08)]">
        <IconButton
          aria-label="이전 곡"
          size="medium"
          disabled={!accessToken}
          onClick={previousTrack}
        >
          <SkipPreviousRoundedIcon />
        </IconButton>
        <IconButton
          aria-label={isPlaying ? "일시정지" : "재생"}
          size="large"
          disabled={Boolean(accessToken && !deviceId)}
          onClick={togglePlay}
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
          onClick={nextTrack}
        >
          <SkipNextRoundedIcon />
        </IconButton>
      </div>

      <div className="flex max-w-52 flex-col items-center gap-1 text-center text-xs text-app-muted">
        {selectedPlaylistName ? (
          <span className="font-medium text-app-text">
            선택됨: {selectedPlaylistName}
          </span>
        ) : null}
        <span>{errorMessage ?? status}</span>
        {canUseSpotify ? (
          accessToken ? (
            <Button size="small" variant="text" onClick={logout}>
              Spotify 연결 해제
            </Button>
          ) : (
            <Button size="small" variant="outlined" onClick={login}>
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
