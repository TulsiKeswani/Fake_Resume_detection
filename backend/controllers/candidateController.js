const mongoose = require('mongoose');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

/**
 * @desc    Get Candidate Dashboard Overview, Applied Jobs & Feedback
 * @route   GET /api/candidate/dashboard
 * @access  Private (Candidate only)
 */
const getCandidateDashboardData = async (req, res) => {
  try {
    let candidate = req.user;
    let availableJobs = [];

    if (mongoose.connection.readyState === 1) {
      candidate = await Candidate.findById(req.user._id).select('-password');
      availableJobs = await Job.find({ isPublishedOnPortal: true, status: 'Active' }).sort({ createdAt: -1 });
    }

    const appliedJobs = [
      {
        id: 'app_101',
        jobTitle: 'Senior Full Stack Engineer',
        companyName: 'TechCorp AI Solutions',
        location: 'Remote / San Francisco',
        appliedDate: new Date().toLocaleDateString(),
        status: 'Interview Completed',
        aiOverallScore: 92,
        feedback: 'Excellent response in Technical AST problem solving & Git history depth. High confidence level.',
        aspectBreakdown: {
          technical: 94,
          communication: 90,
          problemSolving: 95,
          fluency: 88,
          professionalism: 92,
        },
      },
    ];

    return res.json({
      success: true,
      profile: candidate,
      appliedJobs,
      availableJobs,
    });
  } catch (error) {
    console.error('Candidate Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate dashboard metrics.',
    });
  }
};

module.exports = {
  getCandidateDashboardData,
};
