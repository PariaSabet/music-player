interface TokenData {
    accessToken: string | null
    expirationTime: number | null
  }
  
  const currentlyPlayingTokenData: TokenData = {
    accessToken: null,
    expirationTime: null,
  }
  
  const recentlyPlayedTokenData: TokenData = {
    accessToken: null,
    expirationTime: null,
  }
  
  async function getAccessToken(type: 'current' | 'recent') {
    const tokenData =
      type === 'current' ? currentlyPlayingTokenData : recentlyPlayedTokenData
    const refreshToken =
      type === 'current'
        ? import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN
        : import.meta.env.VITE_SPOTIFY_RECENT_REFRESH_TOKEN
  
    if (
      tokenData.accessToken &&
      tokenData.expirationTime &&
      Date.now() < tokenData.expirationTime
    ) {
      return tokenData.accessToken
    }
  
    const basic = btoa(
      `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
    )
  
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      })
  
      const data = await response.json()
  
      if (type === 'current') {
        currentlyPlayingTokenData.accessToken = data.access_token
        currentlyPlayingTokenData.expirationTime =
          Date.now() + data.expires_in * 1000
        return currentlyPlayingTokenData.accessToken
      } else {
        recentlyPlayedTokenData.accessToken = data.access_token
        recentlyPlayedTokenData.expirationTime =
          Date.now() + data.expires_in * 1000
        return recentlyPlayedTokenData.accessToken
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }
  
  export { getAccessToken }
  