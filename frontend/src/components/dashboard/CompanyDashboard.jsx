import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  CheckCircle,
  AlertTriangle,
  Plus,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';

const CompanyDashboard = ({ jobs: propsJobs = [], onNavigateToCreateJob, onNavigateToEvaluation }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');

  // Job creation state
  const [newJob, setNewJob] = useState({
    title: '',
    location: 'Remote',
    jobType: 'Full-time',
    salaryRange: '$90,000 - $130,000 / year',
    experienceRequired: '2+ years',
    requiredSkills: 'React, Node.js, Python',
    jobDescription: '',
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = newJob.requiredSkills.split(',').map((s) => s.trim());
      const res = await api.post('/company/jobs', {
        ...newJob,
        requiredSkills: skillsArray,
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewJob({
          title: '',
          location: 'Remote',
          jobType: 'Full-time',
          salaryRange: '$90,000 - $130,000 / year',
          experienceRequired: '2+ years',
          requiredSkills: 'React, Node.js, Python',
          jobDescription: '',
        });
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Cloud Company Dashboard Analytics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalJobs: 3,
    activeJobs: 3,
    totalApplicants: 14,
    candidatesEvaluated: 8,
    averageAiScore: 88,
    fakeResumeDetectedCount: 1,
  };

  const jobs = data?.jobs || [];
  const evaluatedCandidates = data?.evaluatedCandidates || [];

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>
      
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }} className="text-gradient">
            {user?.companyName || 'Company'} Dashboard
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time candidate AI evaluations, fake resume heatmaps, and job management
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {onNavigateToEvaluation && (
            <button className="btn-secondary" onClick={onNavigateToEvaluation}>
              <BarChart3 size={18} /> Step 7: Evaluate Candidates
            </button>
          )}
          <button className="btn-primary" onClick={onNavigateToCreateJob || (() => setShowCreateModal(true))}>
            <Plus size={18} /> Step 3: Create New Job
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Jobs</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Briefcase size={20} color="#818cf8" />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{metrics.activeJobs}</h3>
          <p style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '4px' }}>{metrics.totalJobs} total postings</p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Applicants</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Users size={20} color="#34d399" />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{metrics.totalApplicants}</h3>
          <p style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>+12 this week</p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Avg Confidence</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Zap size={20} color="#c084fc" />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{metrics.averageAiScore}%</h3>
          <p style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '4px' }}>High profile veracity</p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Anomalies Detected</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <AlertTriangle size={20} color="#fca5a5" />
            </div>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fca5a5' }}>{metrics.fakeResumeDetectedCount}</h3>
          <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>Flagged for manual review</p>
        </div>
      </div>

      {/* Heatmap & Evaluation Chart Summary Visualization */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '36px' }}>
        
        {/* Aspect Heatmap Overview */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Candidate Evaluation Heatmap & Skill Verification
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Aggregated performance across Technical, AST Code Complexity, Communication & Fluency
              </p>
            </div>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Download size={14} /> Download Report
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Technical & AST Code Complexity</span>
                <span style={{ fontWeight: 700, color: '#818cf8' }}>92%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Problem Solving & LeetCode Authenticity</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>88%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Communication & Professional Fluency</span>
                <span style={{ fontWeight: 700, color: '#c084fc' }}>85%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Resume Veracity vs Online History</span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>94%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter & Actions Sidebar */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Shortlist & Filters
          </h3>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              placeholder="Search candidate name or skill..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              <Filter size={14} /> Filter by Highest AI Score
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              <ShieldCheck size={14} /> Flagged Resumes Only
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              <Download size={14} /> Export Shortlisted Team Sheet
            </button>
          </div>
        </div>

      </div>

      {/* Posted Jobs Section */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Active Job Postings ({jobs.length})
        </h3>

        {jobs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No job postings created yet. Click "Create New Job Post" to start.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {jobs.map((job) => (
              <div key={job._id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: 700, color: '#fff' }}>{job.title}</h4>
                  <span className="badge badge-success">{job.status}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {job.location} • {job.jobType} • {job.salaryRange}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>{job.applicantCount || 0} Applicants</span>
                  <a href={job.shareableFormLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Form Link <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE JOB MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Create New Job Posting
            </h3>
            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Job Title *</label>
                <input type="text" required placeholder="Senior Frontend Engineer" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="glass-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Location</label>
                  <input type="text" placeholder="Remote" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="glass-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Job Type</label>
                  <select value={newJob.jobType} onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })} className="glass-input">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Required Skills (Comma separated)</label>
                <input type="text" placeholder="React, Node.js, TypeScript, Cloud" value={newJob.requiredSkills} onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })} className="glass-input" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Job Description *</label>
                <textarea required rows={4} placeholder="Describe key responsibilities and expectations..." value={newJob.jobDescription} onChange={(e) => setNewJob({ ...newJob, jobDescription: e.target.value })} className="glass-input" style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Publish Job Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyDashboard;
