import { NextResponse } from "next/server";
import { getTrack } from "@/lib/api/spotify";
import { resolveSong } from "@/lib/api/songlink";
import connectDB from "@/lib/db/mongodb";
import SongCache from "@/lib/db/models/SongCache";

export async function POST(request) {
  try {
    const { spotifyId, spotifyUrl } = await request.json();

    if (!spotifyId && !spotifyUrl) {
      return NextResponse.json(
        { error: "Either spotifyId or spotifyUrl is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check cache first
    if (spotifyId) {
      const cached = await SongCache.findOne({
        spotifyId,
        expiresAt: { $gt: new Date() },
      });

      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached.songData,
        });
      }
    }

    // Get track info from Spotify
    const trackId = spotifyId || spotifyUrl.split("/track/")[1]?.split("?")[0];
    const trackData = await getTrack(trackId);

    // Resolve multi-platform links via Songlink
    const platformData = await resolveSong(trackData.spotifyUrl);

    const fullSongData = {
      ...trackData,
      spotifyUrl: platformData.links.spotify,
      appleMusicUrl: platformData.links.appleMusic,
      tidalUrl: platformData.links.tidal,
      songlinkUrl: platformData.songlinkUrl,
      availableOn: platformData.availableOn,
      appleMusicId: platformData.ids.appleMusic,
      tidalId: platformData.ids.tidal,
    };

    // Cache the result
    await SongCache.findOneAndUpdate(
      { spotifyId: trackData.spotifyId },
      {
        spotifyId: trackData.spotifyId,
        songData: fullSongData,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: fullSongData,
    });
  } catch (error) {
    console.error("Song resolution error:", error);
    return NextResponse.json(
      { error: "An error occurred while resolving the song" },
      { status: 500 }
    );
  }
}
