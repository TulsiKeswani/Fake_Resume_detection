const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Step 3 APIs
  generateJD: async (data) => {
    const res = await fetch(`${API_BASE_URL}/jobs/generate-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  createJob: async (jobData) => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return res.json();
  },

  getAllJobs: async () => {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    return res.json();
  },

  // Step 4 APIs
  getPublicJob: async (shareId) => {
    const res = await fetch(`${API_BASE_URL}/jobs/public/${shareId}`);
    return res.json();
  },

  submitApplication: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/applications/submit`, {
      method: 'POST',
      body: formData // FormData containing resume file + text fields
    });
    return res.json();
  },

  // Step 5 APIs
  getVerificationReport: async (applicationId) => {
    const res = await fetch(`${API_BASE_URL}/ai/verification/${applicationId}`);
    return res.json();
  },

  verifyDeveloperProfile: async (links) => {
    const res = await fetch(`${API_BASE_URL}/ai/verify-developer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links)
    });
    return res.json();
  }
};
