import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },
  theme: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  creatorTimezone: {
    type: String,
    default: 'UTC',
  },
  settings: {
    maxSongsPerUser: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    minSongsToReveal: {
      type: Number,
      default: 3,
      min: 1,
    },
    allowAnonymous: {
      type: Boolean,
      default: true,
    },
    allowLateSubmissions: {
      type: Boolean,
      default: false,
    },
    showSubmitters: {
      type: Boolean,
      default: false,
    },
    votingEnabled: {
      type: Boolean,
      default: true,
    },
    votingSystem: {
      type: String,
      enum: ['upvote', 'upvote-downvote'],
      default: 'upvote',
    },
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  status: {
    type: String,
    enum: ['collecting', 'revealed', 'archived'],
    default: 'collecting',
  },
  revealedAt: {
    type: Date,
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.userType',
    },
    userType: {
      type: String,
      enum: ['User', 'AnonymousUser'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalSubmissions: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

partySchema.index({ code: 1 });
partySchema.index({ creator: 1 });
partySchema.index({ status: 1, deadline: 1 });

partySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Party || mongoose.model('Party', partySchema);
