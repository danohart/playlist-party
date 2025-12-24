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

    // Extract platform links
    const platforms = data.linksByPlatform || {};

    return {
      songlinkUrl: data.pageUrl,
      availableOn: {
        spotify: !!platforms.spotify,
        appleMusic: !!platforms.appleMusic,
        tidal: !!platforms.tidal,
      },
      links: {
        spotify: platforms.spotify?.url || null,
        appleMusic: platforms.appleMusic?.url || null,
        tidal: platforms.tidal?.url || null,
      },
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
    };
  }
}
