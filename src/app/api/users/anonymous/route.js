import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import connectDB from '@/lib/db/mongodb';
import AnonymousUser from '@/lib/db/models/AnonymousUser';
import Party from '@/lib/db/models/Party';

export async function POST(request) {
  try {
    const { partyId, displayName } = await request.json();

    if (!partyId || !displayName) {
      return NextResponse.json(
        { error: 'Party ID and display name are required' },
        { status: 400 }
      );
    }

    if (displayName.length < 2 || displayName.length > 30) {
      return NextResponse.json(
        { error: 'Display name must be between 2 and 30 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if party exists
    const party = await Party.findById(partyId);
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }

    // Check if anonymous users are allowed
    if (!party.settings.allowAnonymous) {
      return NextResponse.json(
        { error: 'This party requires an account to join' },
        { status: 403 }
      );
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');

    // Get IP address from request
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Create anonymous user
    const anonymousUser = await AnonymousUser.create({
      token,
      displayName,
      partyId,
      ipAddress,
      userAgent,
    });

    // Add to party participants
    await Party.findByIdAndUpdate(partyId, {
      $push: {
        participants: {
          userId: anonymousUser._id,
          userType: 'AnonymousUser',
          joinedAt: new Date(),
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          userId: anonymousUser._id.toString(),
          displayName: anonymousUser.displayName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create anonymous user error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This display name is already taken in this party' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while creating anonymous user' },
      { status: 500 }
    );
  }
}
