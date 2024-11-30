export interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

export interface NowPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack;
} 