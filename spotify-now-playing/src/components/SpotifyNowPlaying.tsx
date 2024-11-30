import { useState, useEffect } from 'react'
import { getAccessToken } from '../utils/spotify'

export interface SpotifyTrack {
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  external_urls: {
    spotify: string
  }
}

export interface NowPlayingResponse {
  is_playing: boolean
  item: SpotifyTrack
}

export interface RecentlyPlayedResponse {
  items: Array<{
    track: SpotifyTrack
    played_at: string
  }>
}

export function SpotifyNowPlaying() {
  const [trackData, setTrackData] = useState<{
    name: string
    artist: string
    album: string
    albumImageUrl: string
    isPlaying: boolean
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token for currently playing
        const currentToken = await getAccessToken('current')
        if (!currentToken) {
          console.error('Failed to get current playing access token')
          return
        }

        // First try to get currently playing
        const currentResponse = await fetch(
          'https://api.spotify.com/v1/me/player/currently-playing',
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        )

        if (currentResponse.status === 200) {
          const currentData: NowPlayingResponse = await currentResponse.json()
          setTrackData({
            name: currentData.item.name,
            artist: currentData.item.artists[0].name,
            album: currentData.item.album.name,
            albumImageUrl: currentData.item.album.images[0]?.url,
            isPlaying: currentData.is_playing,
          })
        } else {
          // Get token for recently played
          const recentToken = await getAccessToken('recent')
          if (!recentToken) {
            console.error('Failed to get recent played access token')
            return
          }

          // If nothing is playing, get recently played
          const recentResponse = await fetch(
            'https://api.spotify.com/v1/me/player/recently-played?limit=1',
            {
              headers: {
                Authorization: `Bearer ${recentToken}`,
              },
            }
          )

          if (recentResponse.ok) {
            const recentData: RecentlyPlayedResponse =
              await recentResponse.json()
            if (recentData.items.length > 0) {
              const lastPlayed = recentData.items[0].track
              setTrackData({
                name: lastPlayed.name,
                artist: lastPlayed.artists[0].name,
                album: lastPlayed.album.name,
                albumImageUrl: lastPlayed.album.images[0]?.url,
                isPlaying: false,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error fetching Spotify data:', error)
        setTrackData(null)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)

    return () => clearInterval(interval)
  }, [])

  if (!trackData) {
    return (
      <div className="bg-black border-2 border-green-500 p-6 max-w-[300px] font-mono">
        <div className="mb-2 text-green-500 text-sm">
          [ NO SIGNAL ]
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black border-2 border-green-500 p-6 max-w-[300px] font-mono">
      <div className="mb-4 text-green-500 text-sm">
        [{trackData.isPlaying ? 'NOW PLAYING' : 'LAST PLAYED'}]
      </div>
      <div className="space-y-2">
        {trackData.albumImageUrl && (
          <img
            src={trackData.albumImageUrl}
            alt={`${trackData.album} cover`}
            className="w-16 h-16 border border-green-500 brightness-50 contrast-125"
          />
        )}
        <div className="space-y-1">
          <p className="text-green-500 font-bold tracking-tight overflow-hidden">
            {'>>'} {trackData.name}
          </p>
          <p className="text-green-400 text-sm overflow-hidden">
            {trackData.artist}
          </p>
          <div className="mt-2 h-2 bg-green-900/30">
            <div 
              className={`h-full bg-green-500 ${
                trackData.isPlaying 
                  ? 'animate-[progress_3s_ease-in-out_infinite]' 
                  : 'w-full'
              }`}
            ></div>
          </div>
          <div className="text-green-500 text-xs mt-1">
            {trackData.isPlaying ? '>>>' : '|||'}
          </div>
        </div>
      </div>
    </div>
  )
}
