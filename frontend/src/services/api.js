<<<<<<< HEAD
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('intellify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages clearly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'An error occurred during API request.';
    return Promise.reject(new Error(message));
  }
);

export default api;
=======
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
>>>>>>> 4183de12085eb881482a7a5db359ada69754fc1e
