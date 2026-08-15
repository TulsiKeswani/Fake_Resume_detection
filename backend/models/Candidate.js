const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CandidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },

    // Step 2: Professional Profile
    title: {
      type: String,
      default: 'Software Developer',
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    primarySkills: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },

    // Step 2 sub: Education
    degree: {
      type: String,
      default: 'Bachelor of Technology',
    },
    university: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: String,
      default: '',
    },

    // Step 3: Online Profile Links for AI Verification
    githubUrl: {
      type: String,
      default: '',
    },
    linkedInUrl: {
      type: String,
      default: '',
    },
    leetCodeUrl: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },

    // Step 4: Cloud Resume Storage (Zero local disk reliance)
    resumeUrl: {
      type: String,
      default: '',
    },
    resumePublicId: {
      type: String,
      default: '',
    },
    resumeFileName: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      default: 'candidate',
      immutable: true,
    },

    // Analytics score calculated during ATS & AI assessment
    overallAiScore: {
      type: Number,
      default: 0,
    },
    aiConfidenceScore: {
      type: Number,
      default: 85,
    },
    isAiGeneratedResume: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Password hashing pre-hook (Async syntax)
CandidateSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
CandidateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Candidate', CandidateSchema);
