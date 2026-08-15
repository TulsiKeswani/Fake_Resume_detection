const crypto = require('crypto');

// In-memory data store for jobs, applications, and verification results
const jobs = new Map();
const applications = new Map();
const verifications = new Map();

// Helper to generate IDs
const generateId = () => crypto.randomBytes(8).toString('hex');
const generateShareId = () => 'job_' + crypto.randomBytes(6).toString('hex');

const jobService = {
  createJob: (jobData) => {
    const id = generateId();
    const shareId = generateShareId();
    const newJob = {
      id,
      shareId,
      title: jobData.title || 'Untitled Position',
      department: jobData.department || 'General',
      location: jobData.location || 'Remote',
      jobType: jobData.jobType || 'Full-time',
      experienceLevel: jobData.experienceLevel || 'Mid-Level',
      description: jobData.description || '',
      isPublishedPortal: jobData.isPublishedPortal ?? true,
      status: jobData.status || 'active',
      aspectWeights: jobData.aspectWeights || {
        technical: 30,
        communication: 20,
        bodyLanguage: 15,
        englishFluency: 15,
        professionalism: 20
      },
      customQuestions: jobData.customQuestions || [],
      createdAt: new Date().toISOString()
    };
    jobs.set(id, newJob);
    return newJob;
  },

  getJobById: (id) => {
    return jobs.get(id) || null;
  },

  getJobByShareId: (shareId) => {
    for (const job of jobs.values()) {
      if (job.shareId === shareId || job.id === shareId) {
        return job;
      }
    }
    return null;
  },

  getAllJobs: () => {
    return Array.from(jobs.values());
  },

  createApplication: (appData) => {
    const id = generateId();
    const newApp = {
      id,
      jobId: appData.jobId,
      candidateName: appData.candidateName,
      candidateEmail: appData.candidateEmail,
      candidatePhone: appData.candidatePhone || '',
      githubUrl: appData.githubUrl || '',
      leetcodeUrl: appData.leetcodeUrl || '',
      portfolioUrl: appData.portfolioUrl || '',
      resumeUrl: appData.resumeUrl || '',
      resumeOriginalName: appData.resumeOriginalName || '',
      formAnswers: appData.formAnswers || {},
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    applications.set(id, newApp);
    return newApp;
  },

  getApplicationById: (id) => {
    return applications.get(id) || null;
  },

  getApplicationsByJobId: (jobId) => {
    const list = [];
    for (const app of applications.values()) {
      if (app.jobId === jobId) {
        list.push(app);
      }
    }
    return list;
  },

  saveVerification: (applicationId, verificationData) => {
    const data = {
      applicationId,
      ...verificationData,
      updatedAt: new Date().toISOString()
    };
    verifications.set(applicationId, data);
    
    // Update application status
    const app = applications.get(applicationId);
    if (app) {
      app.status = 'verified';
    }
    return data;
  },

  getVerificationByApplicationId: (applicationId) => {
    return verifications.get(applicationId) || null;
  }
};

module.exports = jobService;
