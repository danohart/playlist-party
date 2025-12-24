import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import connectDB from '@/lib/db/mongodb';
import Party from '@/lib/db/models/Party';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Party code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const party = await Party.findOne({ 
      code: code.toUpperCase().trim() 
    });

    if (!party) {
      return NextResponse.json(
        { error: 'Party not found. Please check the code and try again.' },
        { status: 404 }
      );
    }

    // Check if party is public or user has access
    const session = await getServerSession(authOptions);

    if (!party.settings.isPublic && !session) {
      return NextResponse.json(
        { error: 'This party is private. Please sign in to join.' },
        { status: 403 }
      );
    }

    // If authenticated, add to participants
    if (session) {
      const isAlreadyParticipant = party.participants.some(
        p => p.userId.toString() === session.user.id && p.userType === 'User'
      );

      if (!isAlreadyParticipant) {
        await Party.findByIdAndUpdate(party._id, {
          $push: {
            participants: {
              userId: session.user.id,
              userType: 'User',
              joinedAt: new Date(),
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        partyId: party._id.toString(),
        code: party.code,
        name: party.name,
        theme: party.theme,
        allowAnonymous: party.settings.allowAnonymous,
        requiresAuth: !party.settings.isPublic,
      },
    });
  } catch (error) {
    console.error('Join party error:', error);
    return NextResponse.json(
      { error: 'An error occurred while joining the party' },
      { status: 500 }
    );
  }
}
