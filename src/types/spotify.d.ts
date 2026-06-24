interface Window {
  Spotify?: typeof Spotify;
  onSpotifyWebPlaybackSDKReady?: () => void;
}

declare namespace Spotify {
  interface WebPlaybackPlayer {
    device_id: string;
  }

  interface WebPlaybackTrack {
    name: string;
    album: {
      images: Array<{
        url: string;
      }>;
    };
    artists: Array<{
      name: string;
    }>;
  }

  interface WebPlaybackState {
    paused: boolean;
    track_window: {
      current_track: WebPlaybackTrack;
    };
  }

  interface WebPlaybackError {
    message: string;
  }

  interface PlayerOptions {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }

  class Player {
    constructor(options: PlayerOptions);
    addListener(
      event: "ready",
      callback: (event: WebPlaybackPlayer) => void,
    ): boolean;
    addListener(
      event: "not_ready",
      callback: (event: WebPlaybackPlayer) => void,
    ): boolean;
    addListener(
      event: "player_state_changed",
      callback: (state: WebPlaybackState | null) => void,
    ): boolean;
    addListener(
      event:
        | "initialization_error"
        | "authentication_error"
        | "account_error"
        | "playback_error",
      callback: (error: WebPlaybackError) => void,
    ): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }
}
