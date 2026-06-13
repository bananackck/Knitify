import { MusicPlayer } from "./MusicPlayer";

export function WorkspaceMain() {
  return (
    <main className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(148px,1fr)_minmax(260px,2fr)] md:grid-rows-[180px_96px_96px_24px_36px] md:gap-app-gap md:p-6">
      <section
        className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:min-h-0"
        aria-label="작품 미리보기"
      >
        작품 ai 완성본 예측 사진
      </section>
      <section
        className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:col-start-1 md:min-h-0"
        aria-label="시계와 타이머"
      >
        시계 / 타이머
      </section>
      <section
        className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:col-start-1 md:min-h-0"
        aria-label="카운터"
      >
        카운터들
      </section>
      <section className="md:col-start-2 md:row-span-3 md:row-start-1">
        <MusicPlayer />
      </section>
      <section
        className="flex min-h-24 min-w-0 items-center justify-center rounded-app-panel bg-panel p-4 text-center text-[13px] text-app-muted md:col-start-2 md:row-start-4 md:min-h-0"
        aria-label="플리 선택 필터"
      >
        플리 선택 필터
      </section>
    </main>
  );
}
