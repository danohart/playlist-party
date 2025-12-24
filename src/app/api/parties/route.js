import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import connectDB from '@/lib/db/mongodb';
import Party from '@/lib/db/models/Party';
import { generatePartyCode } from '@/lib/utils/generateCode';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      theme,
      description,
      deadline,
      settings,
    } = data;

    // Validation
    if (!name || !deadline) {
      return NextResponse.json(
        { error: 'Party name and deadline are required' },
        { status: 400 }
      );
    }

    if (new Date(deadline) <= new Date()) {
      return NextResponse.json(
        { error: 'Deadline must be in the future' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique party code
    let code;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      code = generatePartyCode();
      const existing = await Party.findOne({ code });
      codeExists = !!existing;
      attempts++;
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Failed to generate unique party code. Please try again.' },
        { status: 500 }
      );
    }

    // Get user's timezone from request (or default to UTC)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // Create party
    const party = await Party.create({
      name,
      theme: theme || '',
      description: description || '',
      code,
      creator: session.user.id,
      deadline: new Date(deadline),
      creatorTimezone: timezone,
      settings: {
        maxSongsPerUser: settings?.maxSongsPerUser || 3,
        minSongsToReveal: settings?.minSongsToReveal || 3,
        allowAnonymous: settings?.allowAnonymous !== false,
        allowLateSubmissions: settings?.allowLateSubmissions || false,
        showSubmitters: settings?.showSubmitters || false,
        votingEnabled: settings?.votingEnabled !== false,
        votingSystem: settings?.votingSystem || 'upvote',
        commentsEnabled: settings?.commentsEnabled !== false,
        isPublic: settings?.isPublic !== false,
      },
      participants: [{
        userId: session.user.id,
        userType: 'User',
        joinedAt: new Date(),
      }],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          partyId: party._id.toString(),
          code: party.code,
          name: party.name,
          shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${party.code}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create party error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the party' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user's parties (created or joined)
    const parties = await Party.find({
      $or: [
        { creator: session.user.id },
        { 'participants.userId': session.user.id },
      ],
    })
      .sort({ createdAt: -1 })
      .select('name code theme deadline status totalSubmissions createdAt creator')
      .lean();

    return NextResponse.json({
      success: true,
      data: { parties },
    });
  } catch (error) {
    console.error('Get parties error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching parties' },
      { status: 500 }
    );
  }
}
