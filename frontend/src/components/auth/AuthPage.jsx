import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  UserCheck,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText
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

const AuthPage = ({ onSuccess }) => {
  const { login, registerCompany, registerCandidate, error, setError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [profileType, setProfileType] = useState('candidate'); // 'candidate' | 'company'

  // Candidate Multi-step registration step: 1, 2, 3, 4
  const [candidateStep, setCandidateStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Company Register Form state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    workEmail: '',
    password: '',
    industry: 'Technology & Software',
    companySize: '11-50',
    website: '',
    location: 'Remote',
    description: '',
    logo: null,
  });

  // Candidate Multi-Step Register Form state
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    title: 'Full Stack Software Engineer',
    experienceYears: 2,
    primarySkills: 'React, Node.js, Python, MongoDB',
    summary: 'Passionate developer interested in building scalable cloud web applications.',
    degree: 'B.Tech in Computer Science',
    university: 'Stanford University / State Tech',
    graduationYear: '2024',
    githubUrl: '',
    linkedInUrl: '',
    leetCodeUrl: '',
    portfolioUrl: '',
    resume: null,
  });

  const [resumeFileName, setResumeFileName] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(loginForm.email, loginForm.password, profileType);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Company Register Submit
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(companyForm).forEach((key) => {
        if (companyForm[key] !== null) {
          formData.append(key, companyForm[key]);
        }
      });

      await registerCompany(formData);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Candidate Multi-Step Register Submit
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(candidateForm).forEach((key) => {
        if (candidateForm[key] !== null) {
          formData.append(key, candidateForm[key]);
        }
      });

      await registerCandidate(formData);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file select
  const handleFileChange = (e, formType) => {
    const file = e.target.files[0];
    if (file) {
      if (formType === 'candidate') {
        setCandidateForm((prev) => ({ ...prev, resume: file }));
        setResumeFileName(file.name);
      } else if (formType === 'company') {
        setCompanyForm((prev) => ({ ...prev, logo: file }));
      }
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
        
        {/* Toggle Login vs Register */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'login' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              background: mode === 'register' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Profile Type Toggle (Company vs Candidate) */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div
            onClick={() => setProfileType('candidate')}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: profileType === 'candidate' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: profileType === 'candidate' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={20} color={profileType === 'candidate' ? '#818cf8' : '#94a3b8'} />
            <span style={{ fontWeight: 600, color: profileType === 'candidate' ? '#fff' : 'var(--text-muted)' }}>
              Candidate Profile
            </span>
          </div>

          <div
            onClick={() => setProfileType('company')}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: profileType === 'company' ? '2px solid var(--accent)' : '1px solid var(--border-color)',
              background: profileType === 'company' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <Building2 size={20} color={profileType === 'company' ? '#c084fc' : '#94a3b8'} />
            <span style={{ fontWeight: 600, color: profileType === 'company' ? '#fff' : 'var(--text-muted)' }}>
              Company Profile
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#fca5a5', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* --- LOGIN MODE --- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                {profileType === 'company' ? 'Work Email Address' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="email"
                  required
                  placeholder={profileType === 'company' ? 'recruiter@techcorp.com' : 'john.doe@example.com'}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '10px' }}>
              {isSubmitting ? 'Authenticating...' : `Sign In to ${profileType === 'company' ? 'Company' : 'Candidate'} Account`}
            </button>
          </form>
        )}

        {/* --- REGISTER MODE: COMPANY --- */}
        {mode === 'register' && profileType === 'company' && (
          <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Company Registration
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Register your organization to post jobs & analyze candidate evaluations using AI.
            </p>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="Acme Innovations Inc."
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                className="glass-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="hr@acme.com"
                  value={companyForm.workEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, workEmail: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={companyForm.password}
                  onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Industry
                </label>
                <select
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  className="glass-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Fintech & Banking">Fintech & Banking</option>
                  <option value="Healthcare & Bio">Healthcare & Bio</option>
                  <option value="E-commerce & Retail">E-commerce & Retail</option>
                  <option value="AI & Robotics">AI & Robotics</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Company Size
                </label>
                <select
                  value={companyForm.companySize}
                  onChange={(e) => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                  className="glass-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Website & Location
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <input
                  type="url"
                  placeholder="https://acme.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="glass-input"
                />
                <input
                  type="text"
                  placeholder="San Francisco, CA (or Remote)"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '12px' }}>
              {isSubmitting ? 'Creating Company Profile...' : 'Complete Company Registration'}
            </button>
          </form>
        )}

        {/* --- REGISTER MODE: CANDIDATE MULTI-STEP WIZARD --- */}
        {mode === 'register' && profileType === 'candidate' && (
          <form onSubmit={handleCandidateSubmit}>
            
            {/* Step Header Indicator */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                  STEP {candidateStep} OF 4
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {candidateStep === 1 && 'Personal Credentials'}
                  {candidateStep === 2 && 'Experience & Skills'}
                  {candidateStep === 3 && 'Coding & Online Profiles'}
                  {candidateStep === 4 && 'Cloud Resume Upload'}
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(candidateStep / 4) * 100}%`,
                    background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* STEP 1: Personal Credentials */}
            {candidateStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={candidateForm.fullName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex.morgan@domain.com"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={candidateForm.password}
                    onChange={(e) => setCandidateForm({ ...candidateForm, password: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location</label>
                    <input
                      type="text"
                      placeholder="Seattle, WA"
                      value={candidateForm.location}
                      onChange={(e) => setCandidateForm({ ...candidateForm, location: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: '12px' }}
                  onClick={() => {
                    if (!candidateForm.fullName || !candidateForm.email || !candidateForm.password) {
                      setError('Please fill in required name, email, and password.');
                      return;
                    }
                    setError(null);
                    setCandidateStep(2);
                  }}
                >
                  Continue to Professional Info <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Professional Profile & Education */}
            {candidateStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target Job Title</label>
                  <input
                    type="text"
                    placeholder="Full Stack Developer / AI Engineer"
                    value={candidateForm.title}
                    onChange={(e) => setCandidateForm({ ...candidateForm, title: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={candidateForm.experienceYears}
                      onChange={(e) => setCandidateForm({ ...candidateForm, experienceYears: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Graduation Year</label>
                    <input
                      type="text"
                      placeholder="2024"
                      value={candidateForm.graduationYear}
                      onChange={(e) => setCandidateForm({ ...candidateForm, graduationYear: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Tech Stack & Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Python, TypeScript, Docker"
                    value={candidateForm.primarySkills}
                    onChange={(e) => setCandidateForm({ ...candidateForm, primarySkills: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Degree</label>
                    <input
                      type="text"
                      placeholder="B.S. Computer Science"
                      value={candidateForm.degree}
                      onChange={(e) => setCandidateForm({ ...candidateForm, degree: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>University</label>
                    <input
                      type="text"
                      placeholder="University of California"
                      value={candidateForm.university}
                      onChange={(e) => setCandidateForm({ ...candidateForm, university: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setCandidateStep(1)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={() => setCandidateStep(3)}>
                    Continue to Online Profiles <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Online Profiles & Links */}
            {candidateStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Our AI verification engine uses your online profile links to analyze real project AST code complexity, commits, and problem counts.
                </p>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>GitHub Profile URL</label>
                  <div style={{ position: 'relative' }}>
                    <GithubIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={candidateForm.githubUrl}
                      onChange={(e) => setCandidateForm({ ...candidateForm, githubUrl: e.target.value })}
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>LinkedIn Profile URL</label>
                  <div style={{ position: 'relative' }}>
                    <LinkedinIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={candidateForm.linkedInUrl}
                      onChange={(e) => setCandidateForm({ ...candidateForm, linkedInUrl: e.target.value })}
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>LeetCode Profile</label>
                    <input
                      type="url"
                      placeholder="https://leetcode.com/user"
                      value={candidateForm.leetCodeUrl}
                      onChange={(e) => setCandidateForm({ ...candidateForm, leetCodeUrl: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Portfolio Website</label>
                    <input
                      type="url"
                      placeholder="https://myportfolio.dev"
                      value={candidateForm.portfolioUrl}
                      onChange={(e) => setCandidateForm({ ...candidateForm, portfolioUrl: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setCandidateStep(2)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={() => setCandidateStep(4)}>
                    Continue to Resume Upload <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Cloud Resume Upload */}
            {candidateStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Cloud Resume Document Upload</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Uploaded directly to Cloud Storage (PDF or DOCX). Zero local storage.
                  </p>
                </div>

                <div
                  style={{
                    border: '2px dashed var(--primary-glow)',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    background: 'rgba(99, 102, 241, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => document.getElementById('resume-file-input').click()}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'candidate')}
                  />
                  <div style={{ background: 'rgba(99, 102, 241, 0.15)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Upload size={28} color="#818cf8" />
                  </div>
                  {resumeFileName ? (
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 600 }}>
                        <FileText size={18} /> {resumeFileName}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Click or Drag PDF/DOCX Resume here</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Max file size: 10MB</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setCandidateStep(3)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                    {isSubmitting ? 'Uploading to Cloud & Registering...' : 'Complete Candidate Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
