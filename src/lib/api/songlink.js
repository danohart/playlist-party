export async function resolveSong(spotifyUrl) {
  try {
    const response = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Songlink resolution failed');
    }

    const data = await response.json();

    // Extract platform links - Songlink uses specific platform keys
    const platforms = data.linksByPlatform || {};

    // Get the entity data for more info
    const entities = data.entitiesByUniqueId || {};
    
    // Find Spotify entity to get IDs
    const spotifyEntity = Object.values(entities).find(e => e.apiProvider === 'spotify');
    const appleMusicEntity = Object.values(entities).find(e => e.apiProvider === 'itunes');
    const tidalEntity = Object.values(entities).find(e => e.apiProvider === 'tidal');

    return {
      songlinkUrl: data.pageUrl,
      availableOn: {
        spotify: !!platforms.spotify,
        appleMusic: !!platforms.appleMusic,
        tidal: !!platforms.tidal,
      },
      links: {
        spotify: platforms.spotify?.url || spotifyUrl,
        appleMusic: platforms.appleMusic?.url || null,
        tidal: platforms.tidal?.url || null,
      },
      ids: {
        appleMusic: appleMusicEntity?.id || null,
        tidal: tidalEntity?.id || null,
      }
    };
  } catch (error) {
    console.error('Songlink error:', error);
    // Return minimal data if Songlink fails
    return {
      songlinkUrl: spotifyUrl,
      availableOn: {
        spotify: true,
        appleMusic: false,
        tidal: false,
      },
      links: {
        spotify: spotifyUrl,
        appleMusic: null,
        tidal: null,
      },
      ids: {
        appleMusic: null,
        tidal: null,
      }
    };
  }
}
