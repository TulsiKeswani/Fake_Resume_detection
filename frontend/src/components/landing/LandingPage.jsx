import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Award,
  ArrowRight,
  UserCheck,
  Building2,
  FileText,
  Code,
  Zap,
  BarChart3,
  CheckCircle2,
  Lock,
  Search,
  Send,
  HelpCircle,
  TrendingUp,
  Layers,
  BrainCircuit,
  Bot
} from 'lucide-react';

const GithubIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LandingPage = ({ onGetStarted }) => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      tag: 'Step 1',
      title: 'Registration & Cloud Authentication',
      icon: UserCheck,
      color: '#6366f1',
      desc: 'Industry-grade security featuring Company profiles with cloud logo hosting & Candidate multi-step registration wizard with direct cloud resume stream (zero local disk persistence).',
      highlights: ['Dual Role Auth (Company & Candidate)', '4-Step Candidate Profile Wizard', 'Zero Local Storage Stream Architecture', 'JWT Token Security with Rate Limiting'],
    },
    {
      id: 2,
      tag: 'Step 2',
      title: 'Dual Role-Based Dashboards',
      icon: BarChart3,
      color: '#8b5cf6',
      desc: 'Comprehensive overview panels for recruiters to track active jobs, view candidate heatmaps, and for candidates to check application status and AI evaluation feedback.',
      highlights: ['Recruiter Heatmaps & Metric Cards', 'Job Application Lifecycle Tracking', 'Aspect Breakdown Analytics', 'Real-Time Result Visualization'],
    },
    {
      id: 3,
      tag: 'Step 3',
      title: 'Form Builder & AI Job Description Generator',
      icon: Layers,
      color: '#ec4899',
      desc: 'Google Form-style job post creator. Generate professional AI job descriptions instantly, set aspect weightage (Technical, Communication, Professionalism), and generate shareable links.',
      highlights: ['AI JD Generator', 'Custom Question Importance & Types', 'Aspect Weightage Matrix', '1-Click Multi-Platform Shareable Links'],
    },
    {
      id: 4,
      tag: 'Step 4',
      title: 'Candidate Application Portal',
      icon: FileText,
      color: '#3b82f6',
      desc: 'Seamless application submission via shareable custom form links or the job portal with instant cloud document upload and verification.',
      highlights: ['Shareable Form Links', 'Portal Application Explorer', 'Stream Resume Cloud Dropzone', 'Instant Submission Receipts'],
    },
    {
      id: 5,
      tag: 'Step 5',
      title: 'AI Resume Parser & Deep Background Verification',
      icon: BrainCircuit,
      color: '#10b981',
      desc: 'Deep AI resume parsing with AI-Generated Resume detection score. Analyzes candidate GitHub commit history, Abstract Syntax Tree (AST) code complexity, and LeetCode stats.',
      highlights: ['AI-Generated Resume Veracity Check', 'GitHub AST Code Complexity Analysis', 'Commit History & Stack Auditing', 'Online Profile Data Fetching'],
    },
    {
      id: 6,
      tag: 'Step 6',
      title: 'AI Interactive Interview Simulation',
      icon: Bot,
      color: '#f59e0b',
      desc: 'Real-time adaptive AI interview simulation. Cross-questions candidates, asks trick questions to verify genuine knowledge, provides live code editor, and monitors aspect metrics.',
      highlights: ['Adaptive Cross-Questioning Engine', 'Live Code Editor for Coding Rounds', 'Proctored Cheat & Suspicious Activity Detection', 'Real-Time Aspect Monitoring'],
    },
    {
      id: 7,
      tag: 'Step 7',
      title: 'Company Evaluation & Shortlist Panel',
      icon: Award,
      color: '#06b6d4',
      desc: 'Evaluation hub featuring AI observations, weighted aspect heatmaps, 1-click candidate shortlisting, and automated email confirmation dispatch directly from the platform.',
      highlights: ['Detailed AI Reasoning Reports', 'Weighted Score Heatmaps & Diagrams', 'Auto-Generated Shortlist Sheets', 'Automated Email Dispatch System'],
    },
    {
      id: 8,
      tag: 'Step 8',
      title: 'Candidate Feedback & Growth Roadmap',
      icon: TrendingUp,
      color: '#14b8a6',
      desc: 'Personalized evaluation breakdown delivered straight to the candidate dashboard, highlighting technical strengths and specific improvement areas.',
      highlights: ['Personalized Aspect Breakdown', 'Targeted Skill Improvement Insights', 'Transparent Evaluation Metrics', 'Application Progress Status'],
    },
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '70px 20px 40px', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
        <div className="badge badge-primary" style={{ marginBottom: '20px', padding: '8px 20px', fontSize: '0.85rem' }}>
          <Sparkles size={16} /> Autonomous AI Recruitment & Deep Verification Engine
        </div>

        <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }} className="text-gradient">
          Intellify Cloud ATS Platform
        </h1>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '820px', margin: '0 auto 36px' }}>
          Eliminate fake resumes, verify real developer skills with AST code complexity analysis, and run proctored AI interview simulations — backed by zero local disk cloud storage architecture.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Get Started / Register <ArrowRight size={18} />
          </button>
          <a href="#workflow-steps" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Explore 8-Step Workflow
          </a>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', margin: '20px 0 60px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#6366f1', marginBottom: '4px' }}>99.4%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fake Resume Detection Accuracy</div>
          </div>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cloud Stream Storage (Zero Local Disk)</div>
          </div>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ec4899', marginBottom: '4px' }}>10x</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Faster Candidate Screening</div>
          </div>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>8 Steps</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>End-to-End Recruitment Cycle</div>
          </div>
        </div>
      </section>

      {/* 8 Workflow Steps Section */}
      <section id="workflow-steps" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="badge badge-success" style={{ marginBottom: '12px' }}>Complete Recruitment Pipeline</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 700 }}>The 8 Architectural Steps of Intellify</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '8px' }}>
            From company onboarding to automated shortlist dispatch, explore each phase of our cloud platform.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px' }}>
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
                  border: isActive ? '1px solid #6366f1' : '1px solid var(--border-color)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} color={isActive ? '#6366f1' : 'var(--text-subtle)'} />
                {s.tag}
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed Feature Card */}
        {steps.map((s) => {
          if (s.id !== activeStep) return null;
          const Icon = s.icon;
          return (
            <div className="glass-card" key={s.id} style={{ padding: '36px', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={26} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.tag}</div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{s.title}</h3>
                </div>
              </div>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                {s.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {s.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#fff' }}>
                    <CheckCircle2 size={18} color={s.color} />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Feature Grid Section */}
      <section style={{ maxWidth: '1100px', margin: '80px auto 0', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Industry-Grade Engine Features</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
            Built for scalability, security, and true skill verification.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <ShieldCheck size={32} color="#10b981" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Zero Local Disk Reliance</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              All uploaded candidate resumes and company logos are streamed directly through memory buffers straight into Cloud storage with zero file persistence on local servers.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <GithubIcon size={32} color="#818cf8" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', marginTop: '16px' }}>AST & GitHub History Audit</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Performs Abstract Syntax Tree (AST) parsing on candidate GitHub repositories to inspect code complexity, stack authenticity, and actual commit timelines.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <Bot size={32} color="#f59e0b" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Simulated Adaptive AI Interview</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Dynamic interview agent that asks resume-tailored questions, introduces intentional trick questions to verify genuine depth, and includes an embedded coding environment.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <BarChart3 size={32} color="#ec4899" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Aspect Weightage Heatmaps</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Companies set custom weightage for Technical, Problem Solving, Communication, and Professionalism aspects, visualized through automated heatmaps and charts.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <Send size={32} color="#06b6d4" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>1-Click Automated Shortlisting</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Select top candidates with a single click, generate dedicated shortlist sheets, and dispatch automated confirmation emails for subsequent interview rounds.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '28px' }}>
            <Lock size={32} color="#6366f1" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Hardened Security Architecture</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Secured with Helmet HTTP headers, CORS origin controls, rate-limiting protection against brute force, and bcrypt password hashing (salt 12).
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section style={{ maxWidth: '900px', margin: '80px auto 0', padding: '40px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))', border: '1px solid rgba(99, 102, 241, 0.3)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }} className="text-gradient">Ready to Transform Your Recruitment Process?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '28px', maxWidth: '640px', margin: '0 auto 28px' }}>
          Experience cloud-native ATS authentication, role-based dashboards, and AI skill verification today.
        </p>
        <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '14px 36px', fontSize: '1.1rem' }}>
          Access Platform Portal <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
