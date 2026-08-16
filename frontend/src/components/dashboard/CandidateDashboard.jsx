import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Briefcase,
  Award,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
  TrendingUp,
  Code
} from 'lucide-react';

const GithubIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const CandidateDashboard = ({ jobs: propsJobs = [], candidates: propsCandidates = [], onNavigateToApply, onNavigateToInterview, onNavigateToReport }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCandidateData = async () => {
    try {
      const res = await api.get('/candidate/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const profile = data?.profile || user;
  const appliedJobs = data?.appliedJobs || [];
  const availableJobs = propsJobs.length > 0 ? propsJobs : (data?.availableJobs || []);

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>
      
      {/* Header Profile Card */}
      <div className="glass-card animate-fade-in" style={{ padding: '28px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.6rem', color: '#fff', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
            {profile?.fullName ? profile.fullName.charAt(0) : 'C'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              Welcome back, {profile?.fullName || 'Candidate'}!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
              {profile?.title || 'Software Developer'} • {profile?.experienceYears || 0} Years Experience
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {profile?.primarySkills && profile.primarySkills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Readiness Card */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Profile Verification Level</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '2px' }}>
            <Zap size={22} color="#34d399" /> {profile?.aiConfidenceScore || 85}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Cloud Resume Verified</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '36px' }}>
        
        {/* Applied Jobs & AI Evaluation Scores */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>
            Applied Jobs & AI Interview Evaluation Results
          </h3>

          {appliedJobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No applied jobs yet. Explore open roles below to apply!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {appliedJobs.map((app) => (
                <div key={app.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{app.jobTitle}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.companyName} • Applied on {app.appliedDate}</p>
                    </div>
                    <span className="badge badge-success">{app.status}</span>
                  </div>

                  {/* AI Evaluation Overview box */}
                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} /> AI Overall Performance Score
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8' }}>{app.aiOverallScore}/100</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '12px', lineHeight: 1.5 }}>
                      "{app.feedback}"
                    </p>

                    {/* Breakdown bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                          <span>Technical & Coding</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{app.aspectBreakdown.technical}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                          <div style={{ width: `${app.aspectBreakdown.technical}%`, height: '100%', background: '#6366f1', borderRadius: '3px' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                          <span>Problem Solving</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{app.aspectBreakdown.problemSolving}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                          <div style={{ width: `${app.aspectBreakdown.problemSolving}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Online Profile Links & Cloud Document status */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Verified Credentials & Links
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <FileText size={18} color="#818cf8" />
              <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 600, color: '#fff' }}>Cloud Resume</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {profile?.resumeUrl ? 'Uploaded to Cloud Storage' : 'No Resume uploaded'}
                </div>
              </div>
              {profile?.resumeUrl && (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="badge badge-primary">
                  View
                </a>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <GithubIcon size={18} color="#94a3b8" />
              <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 600, color: '#fff' }}>GitHub Profile</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {profile?.githubUrl || 'Not linked'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <LinkedinIcon size={18} color="#94a3b8" />
              <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontWeight: 600, color: '#fff' }}>LinkedIn Profile</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {profile?.linkedInUrl || 'Not linked'}
                </div>
              </div>
            </div>
          </div>

          <button className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
            Update Profile & Links
          </button>
        </div>

      </div>

      {/* Available Jobs on Portal */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Explore Open Job Positions
        </h3>

        {availableJobs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No open job postings available right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {availableJobs.map((job) => (
              <div key={job._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{job.title}</h4>
                    <span className="badge badge-primary">{job.jobType}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, marginBottom: '4px' }}>
                    {job.companyName}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    {job.location} • {job.salaryRange}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {job.jobDescription ? job.jobDescription.substring(0, 100) + '...' : 'Great opportunity for skilled engineers.'}
                  </p>
                </div>

                <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => onNavigateToApply && onNavigateToApply(job.shareId || job.id)}>
                  Step 4: Apply Now via Cloud ATS
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CandidateDashboard;
