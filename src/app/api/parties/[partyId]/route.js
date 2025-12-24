import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import connectDB from '@/lib/db/mongodb';
import Party from '@/lib/db/models/Party';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const party = await Party.findById(params.partyId)
      .populate('creator', 'name email')
      .lean();

    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }

    // Check if user has access (for private parties)
    const session = await getServerSession(authOptions);
    
    if (!party.settings.isPublic) {
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const isParticipant = party.participants.some(
        p => p.userId.toString() === session.user.id
      );

      if (!isParticipant && party.creator._id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Determine user's role
    let userRole = 'viewer';
    if (session) {
      if (party.creator._id.toString() === session.user.id) {
        userRole = 'creator';
      } else {
        const isParticipant = party.participants.some(
          p => p.userId.toString() === session.user.id
        );
        if (isParticipant) {
          userRole = 'participant';
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        party,
        userRole,
      },
    });
  } catch (error) {
    console.error('Get party error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the party' },
      { status: 500 }
    );
  }
}
