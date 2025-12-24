import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import connectDB from '@/lib/db/mongodb';
import Party from '@/lib/db/models/Party';
import Submission from '@/lib/db/models/Submission';
import User from '@/lib/db/models/User';
import AnonymousUser from '@/lib/db/models/AnonymousUser';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { songData, userToken } = await request.json();

    if (!session && !userToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!songData) {
      return NextResponse.json(
        { error: 'Song data is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const party = await Party.findById(params.partyId);

    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }

    // Check if deadline has passed (unless late submissions allowed)
    if (new Date() > new Date(party.deadline) && !party.settings.allowLateSubmissions) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    // Determine user info
    let userId, userType, displayName;

    if (session) {
      userId = session.user.id;
      userType = 'User';
      const user = await User.findById(userId);
      displayName = user.name;
    } else {
      const anonUser = await AnonymousUser.findOne({ token: userToken });
      if (!anonUser) {
        return NextResponse.json(
          { error: 'Invalid user token' },
          { status: 401 }
        );
      }
      userId = anonUser._id;
      userType = 'AnonymousUser';
      displayName = anonUser.displayName;
    }

    // Check submission limit
    const userSubmissionCount = await Submission.countDocuments({
      partyId: params.partyId,
      'submittedBy.userId': userId,
      deletedAt: null,
    });

    if (userSubmissionCount >= party.settings.maxSongsPerUser) {
      return NextResponse.json(
        { error: `You've reached the maximum of ${party.settings.maxSongsPerUser} song${party.settings.maxSongsPerUser !== 1 ? 's' : ''}` },
        { status: 400 }
      );
    }

    // Check for duplicate song
    const existingSong = await Submission.findOne({
      partyId: params.partyId,
      'songData.spotifyId': songData.spotifyId,
      deletedAt: null,
    });

    if (existingSong) {
      return NextResponse.json(
        { error: 'This song has already been submitted to this party' },
        { status: 409 }
      );
    }

    // Create submission
    const submission = await Submission.create({
      partyId: params.partyId,
      submittedBy: {
        userId,
        userType,
        displayName,
      },
      songData,
    });

    // Update party submission count
    await Party.findByIdAndUpdate(params.partyId, {
      $inc: { totalSubmissions: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId: submission._id.toString(),
          userSubmissionCount: userSubmissionCount + 1,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit song error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This song has already been submitted' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred while submitting the song' },
      { status: 500 }
    );
  }
}
