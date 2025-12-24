import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import connectDB from '@/lib/db/mongodb';
import Vote from '@/lib/db/models/Vote';
import Submission from '@/lib/db/models/Submission';
import Party from '@/lib/db/models/Party';
import AnonymousUser from '@/lib/db/models/AnonymousUser';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { votes, userToken } = await request.json();

    if (!session && !userToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!votes || typeof votes !== 'object') {
      return NextResponse.json(
        { error: 'Invalid votes data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get party settings
    const party = await Party.findById(params.partyId);
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }

    if (!party.settings.votingEnabled) {
      return NextResponse.json(
        { error: 'Voting is not enabled for this party' },
        { status: 403 }
      );
    }

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

    // Calculate total votes used
    let totalUpvotes = 0;
    let totalDownvotes = 0;

    Object.values(votes).forEach(voteData => {
      totalUpvotes += parseInt(voteData.upvote) || 0;
      totalDownvotes += parseInt(voteData.downvote) || 0;
    });

    // Get max votes allowed
    const totalSubmissions = await Submission.countDocuments({
      partyId: params.partyId,
      deletedAt: null,
    });

    const maxUpvotes = Math.ceil(totalSubmissions / 2);
    const maxDownvotes = party.settings.votingSystem === 'upvote-downvote' 
      ? Math.ceil(totalSubmissions / 3)
      : 0;

    if (totalUpvotes > maxUpvotes) {
      return NextResponse.json(
        { error: `You can only cast ${maxUpvotes} upvote${maxUpvotes !== 1 ? 's' : ''} total` },
        { status: 400 }
      );
    }

    if (totalDownvotes > maxDownvotes) {
      return NextResponse.json(
        { error: `You can only cast ${maxDownvotes} downvote${maxDownvotes !== 1 ? 's' : ''} total` },
        { status: 400 }
      );
    }

    // Delete all existing votes for this user in this party
    await Vote.deleteMany({
      partyId: params.partyId,
      'votedBy.userId': userId,
      'votedBy.userType': userType,
    });

    // Create new votes
    const newVotes = [];
    Object.entries(votes).forEach(([submissionId, voteData]) => {
      const upvoteCount = parseInt(voteData.upvote) || 0;
      const downvoteCount = parseInt(voteData.downvote) || 0;
      
      if (upvoteCount > 0) {
        newVotes.push({
          partyId: params.partyId,
          submissionId,
          votedBy: { userId, userType },
          voteType: 'upvote',
          voteCount: upvoteCount,
        });
      }
      if (downvoteCount > 0) {
        newVotes.push({
          partyId: params.partyId,
          submissionId,
          votedBy: { userId, userType },
          voteType: 'downvote',
          voteCount: downvoteCount,
        });
      }
    });

    if (newVotes.length > 0) {
      await Vote.insertMany(newVotes);
    }

    // Recalculate all vote counts for all submissions in this party
    const allVotes = await Vote.find({ partyId: params.partyId });
    const voteCounts = {};
    
    allVotes.forEach(vote => {
      const subId = vote.submissionId.toString();
      if (!voteCounts[subId]) {
        voteCounts[subId] = { upvotes: 0, downvotes: 0 };
      }
      const count = parseInt(vote.voteCount) || 0;
      if (vote.voteType === 'upvote') {
        voteCounts[subId].upvotes += count;
      } else {
        voteCounts[subId].downvotes += count;
      }
    });

    // Update all submissions with proper default values
    const submissions = await Submission.find({
      partyId: params.partyId,
      deletedAt: null,
    });

    await Promise.all(
      submissions.map(sub => {
        const counts = voteCounts[sub._id.toString()];
        const upvotes = counts?.upvotes || 0;
        const downvotes = counts?.downvotes || 0;
        
        return Submission.findByIdAndUpdate(sub._id, {
          upvotes: upvotes,
          downvotes: downvotes,
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        votesSubmitted: newVotes.length,
        totalUpvotes,
        totalDownvotes,
        maxUpvotes,
        maxDownvotes,
      },
    });
  } catch (error) {
    console.error('Submit votes error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting votes' },
      { status: 500 }
    );
  }
}
