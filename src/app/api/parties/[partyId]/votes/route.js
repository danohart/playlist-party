import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import connectDB from '@/lib/db/mongodb';
import Vote from '@/lib/db/models/Vote';
import AnonymousUser from '@/lib/db/models/AnonymousUser';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userToken = searchParams.get('userToken');

    if (!session && !userToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Determine user ID
    let userId, userType;
    if (session) {
      userId = session.user.id;
      userType = 'User';
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
    }

    // Get all votes for this user in this party
    const votes = await Vote.find({
      partyId: params.partyId,
      'votedBy.userId': userId,
      'votedBy.userType': userType,
    }).lean();

    // Transform into map: { submissionId: { upvote: 2, downvote: 1 } }
    const voteMap = {};
    votes.forEach(vote => {
      const subId = vote.submissionId.toString();
      if (!voteMap[subId]) {
        voteMap[subId] = { upvote: 0, downvote: 0 };
      }
      voteMap[subId][vote.voteType] = vote.voteCount;
    });

    return NextResponse.json({
      success: true,
      data: { votes: voteMap },
    });
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching votes' },
      { status: 500 }
    );
  }
}
