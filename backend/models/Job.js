const mongoose = require('mongoose');

const AspectWeightageSchema = new mongoose.Schema({
  technical: { type: Number, default: 35 },
  communication: { type: Number, default: 25 },
  problemSolving: { type: Number, default: 20 },
  fluency: { type: Number, default: 10 },
  professionalism: { type: Number, default: 10 },
});

const JobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    salaryRange: {
      type: String,
      default: '$80,000 - $120,000 / year',
    },
    experienceRequired: {
      type: String,
      default: '1-3 years',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    customQuestions: [
      {
        questionText: String,
        questionType: {
          type: String,
          enum: ['text', 'code', 'multiple_choice'],
          default: 'text',
        },
        isMandatory: {
          type: Boolean,
          default: true,
        },
      },
    ],
    aspectWeightage: {
      type: AspectWeightageSchema,
      default: () => ({}),
    },
    shareableFormLink: {
      type: String,
      default: '',
    },
    isPublishedOnPortal: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
