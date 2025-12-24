import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/lib/db/models/Submission';
import Party from '@/lib/db/models/Party';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'time_desc';

    await connectDB();

    // Check if party exists
    const party = await Party.findById(params.partyId);
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'votes_desc':
        sortCriteria = { upvotes: -1, submittedAt: -1 };
        break;
      case 'votes_asc':
        sortCriteria = { upvotes: 1, submittedAt: -1 };
        break;
      case 'time_asc':
        sortCriteria = { submittedAt: 1 };
        break;
      case 'time_desc':
      default:
        sortCriteria = { submittedAt: -1 };
        break;
    }

    const submissions = await Submission.find({
      partyId: params.partyId,
      deletedAt: null,
    })
      .sort(sortCriteria)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        total: submissions.length,
      },
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching submissions' },
      { status: 500 }
    );
  }
}
