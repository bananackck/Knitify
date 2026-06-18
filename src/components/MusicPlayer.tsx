import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import SkipPreviousRoundedIcon from "@mui/icons-material/SkipPreviousRounded";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      className="flex h-full min-h-[320px] min-w-0 flex-col items-center justify-center gap-5 rounded-app-panel p-6"
      aria-label="음악 플레이어"
    >
      <div className="relative flex aspect-square w-full max-w-88 items-center justify-center rounded-full bg-primary shadow-[inset_0_-10px_24px_rgba(31,26,23,0.08),0_18px_32px_rgba(31,26,23,0.08)]">
        <div className="absolute right-[18%] top-[15%] z-10 h-[20%] w-1.5 origin-top rotate-[40deg] rounded-full bg-app-muted/60" />
        <img
          src="/cd.svg"
          alt="음악 플레이어 CD"
          className={`aspect-square w-[90%] animate-spin rounded-full drop-shadow-[0_10px_20px_rgba(31,26,23,0.18)] [animation-duration:3s] [animation-timing-function:linear] motion-reduce:animate-none ${
            isPlaying
              ? "[animation-play-state:running]"
              : "[animation-play-state:paused]"
          }`}
        />
      </div>

      <div className="flex items-center gap-3 rounded-full border border-app-border bg-control-panel px-4 py-2 shadow-[0_8px_20px_rgba(31,26,23,0.08)]">
        <IconButton aria-label="이전 곡" size="medium">
          <SkipPreviousRoundedIcon />
        </IconButton>
        <IconButton
          aria-label={isPlaying ? "일시정지" : "재생"}
          size="large"
          onClick={() => setIsPlaying((current) => !current)}
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
        <IconButton aria-label="다음 곡" size="medium">
          <SkipNextRoundedIcon />
        </IconButton>
      </div>
    </section>
  );
}
