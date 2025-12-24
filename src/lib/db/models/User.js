import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider;
    },
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'apple', null],
    default: null,
  },
  oauthId: {
    type: String,
    sparse: true,
  },
  preferredPlatform: {
    type: String,
    enum: ['spotify', 'appleMusic', 'tidal'],
    default: 'spotify',
  },
  createdParties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
  }],
  joinedParties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
  }],
  emailVerified: {
    type: Boolean,
    default: false,
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

// Indexes - only define once
userSchema.index({ oauthProvider: 1, oauthId: 1 });

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);
