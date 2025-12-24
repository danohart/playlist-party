let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

  return accessToken;
}

export async function searchTracks(query, limit = 10) {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
    market: 'US',
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Spotify search failed');
  }

  const data = await response.json();

  return data.tracks.items.map(track => ({
    spotifyId: track.id,
    spotifyUri: track.uri,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images[0]?.url || null,
    duration: track.duration_ms,
    releaseDate: track.album.release_date,
    explicit: track.explicit,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify,
  }));
}

export async function getTrack(trackId) {
  const token = await getAccessToken();

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get track from Spotify');
  }

  const track = await response.json();

  return {
    spotifyId: track.id,
    spotifyUri: track.uri,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images[0]?.url || null,
    duration: track.duration_ms,
    releaseDate: track.album.release_date,
    explicit: track.explicit,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify,
  };
}
