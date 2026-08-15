import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building, Clock, Send, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import ResumeUploader from './ResumeUploader';
import DynamicFormRenderer from './DynamicFormRenderer';
import ApplicationSuccess from './ApplicationSuccess';
import { api } from '../../services/api';

export default function PublicJobApply({ shareId = 'job_demo', onNavigateToReport }) {
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState(null);
  const [serverError, setServerError] = useState('');

  // Form states
  const [resumeFile, setResumeFile] = useState(null);
  const [candidateData, setCandidateData] = useState({
    candidateName: 'Rahul Sharma',
    candidateEmail: 'rahul.sharma@example.com',
    candidatePhone: '+91 98765 43210',
    githubUrl: 'https://github.com/torvalds',
    leetcodeUrl: 'https://leetcode.com/tourist',
    portfolioUrl: 'https://rahulsharma.dev'
  });
  const [formAnswers, setFormAnswers] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchJobDetails();
  }, [shareId]);

  const fetchJobDetails = async () => {
    setLoadingJob(true);
    try {
      const res = await api.getPublicJob(shareId);
      if (res.success && res.job) {
        setJob(res.job);
      } else {
        // Fallback demo job
        setJob({
          id: 'job_demo',
          shareId: 'job_demo',
          title: 'Senior Full Stack Engineer',
          department: 'Engineering & Product',
          location: 'Remote / Hybrid',
          jobType: 'Full-time',
          description: `We are looking for an experienced Senior Full Stack Engineer to lead web application development. Key skills include React, Node.js, TypeScript, REST APIs, and Git.`,
          customQuestions: [
            { id: 'q_notice', questionText: 'Notice Period (in days)', type: 'text', isRequired: true },
            { id: 'q_exp', questionText: 'Years of React/Node.js Experience', type: 'dropdown', options: ['0-1 Years', '2-4 Years', '5+ Years'], isRequired: true }
          ]
        });
      }
    } catch (err) {
      console.warn('Backend fetch failed, loading fallback job:', err);
    } finally {
      setLoadingJob(false);
    }
  };

  const handleCandidateDataChange = (field, val) => {
    setCandidateData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFormAnswerChange = (qId, val) => {
    setFormAnswers(prev => ({ ...prev, [qId]: val }));
    if (errors[qId]) setErrors(prev => ({ ...prev, [qId]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!candidateData.candidateName.trim()) {
      newErrors.candidateName = 'Full Name is required.';
    }
    if (!candidateData.candidateEmail.trim()) {
      newErrors.candidateEmail = 'Email is required.';
    }
    if (!resumeFile) {
      newErrors.resume = 'Resume upload is mandatory.';
    }

    // Enforce mandatory developer/work link check
    const hasGithub = candidateData.githubUrl && candidateData.githubUrl.trim();
    const hasLeetcode = candidateData.leetcodeUrl && candidateData.leetcodeUrl.trim();
    const hasPortfolio = candidateData.portfolioUrl && candidateData.portfolioUrl.trim();

    if (!hasGithub && !hasLeetcode && !hasPortfolio) {
      newErrors.devLinks = 'Please provide at least one developer profile or official project link (GitHub, LeetCode, or Portfolio/Work Link).';
    }

    // Validate mandatory custom questions
    job?.customQuestions?.forEach(q => {
      if (q.isRequired) {
        const val = formAnswers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.id] = 'This field is required.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setServerError('Please fix the errors above before submitting.');
      return;
    }
    setServerError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('candidateName', candidateData.candidateName);
      formData.append('candidateEmail', candidateData.candidateEmail);
      formData.append('candidatePhone', candidateData.candidatePhone || '');
      formData.append('githubUrl', candidateData.githubUrl || '');
      formData.append('leetcodeUrl', candidateData.leetcodeUrl || '');
      formData.append('portfolioUrl', candidateData.portfolioUrl || '');
      formData.append('resume', resumeFile);
      formData.append('formAnswers', JSON.stringify(formAnswers));

      const res = await api.submitApplication(formData);
      if (res.success) {
        setSubmittedAppId(res.applicationId);
      } else {
        setServerError(res.error || 'Failed to submit application.');
      }
    } catch (err) {
      setServerError('Server error during application submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="loading-container glass-panel">
        <Loader2 className="spinner" size={32} />
        <p>Loading Job Application Form...</p>
      </div>
    );
  }

  if (submittedAppId) {
    return (
      <ApplicationSuccess
        applicationId={submittedAppId}
        onNavigateToReport={onNavigateToReport}
      />
    );
  }

  return (
    <div className="public-apply-container">
      {/* Job Banner */}
      <div className="job-banner-card glass-panel">
        <div className="job-header-row">
          <div>
            <span className="badge badge-gold">Step 4 Candidate Apply Portal</span>
            <h2>{job.title}</h2>
            <div className="job-meta-chips">
              <span><Building size={14} /> {job.department}</span>
              <span><MapPin size={14} /> {job.location}</span>
              <span><Clock size={14} /> {job.jobType}</span>
            </div>
          </div>
        </div>

        <div className="job-description-box">
          <h4>Role Overview</h4>
          <p>{job.description}</p>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="apply-form-card glass-panel">
        <h3>Submit Your Job Application</h3>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        {/* Dynamic Questions & Candidate Info */}
        <DynamicFormRenderer
          candidateData={candidateData}
          onCandidateDataChange={handleCandidateDataChange}
          customQuestions={job.customQuestions}
          formAnswers={formAnswers}
          onFormAnswerChange={handleFormAnswerChange}
          errors={errors}
        />

        {/* Resume Uploader */}
        <ResumeUploader
          selectedFile={resumeFile}
          onFileSelect={(file) => {
            setResumeFile(file);
            if (errors.resume) setErrors(prev => ({ ...prev, resume: null }));
          }}
          error={errors.resume}
        />

        <div className="form-submit-row">
          <button type="submit" className="btn btn-success btn-lg" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="spinner" size={20} /> Submitting Application...</>
            ) : (
              <><Send size={18} /> Submit Candidate Application</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
