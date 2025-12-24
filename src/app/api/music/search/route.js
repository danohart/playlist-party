import { NextResponse } from 'next/server';
import { searchTracks } from '@/lib/api/spotify';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    const results = await searchTracks(query, limit);

    return NextResponse.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error('Music search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching for music' },
      { status: 500 }
    );
  }
}
