import { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Code, FileText, AlertTriangle, CheckCircle2, RefreshCw, Star, GitCommit, Sparkles, User, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function AIVerificationDashboard({ applicationId, onBackToApply }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [applicationId]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      if (applicationId) {
        const res = await api.getVerificationReport(applicationId);
        if (res.success && res.verification) {
          setData({ application: res.application, verification: res.verification });
          setLoading(false);
          return;
        }
      }

      // Fallback interactive demonstration verification data
      setTimeout(() => {
        setData({
          application: {
            id: applicationId || 'app_demo123',
            candidateName: 'Rahul Sharma',
            candidateEmail: 'rahul.sharma@example.com',
            githubUrl: 'https://github.com/torvalds',
            leetcodeUrl: 'https://leetcode.com/tourist',
            portfolioUrl: 'https://rahulsharma.dev',
            resumeOriginalName: 'Rahul_Sharma_Resume.pdf',
            createdAt: new Date().toISOString()
          },
          verification: {
            parsedResume: {
              detectedSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Git', 'REST API'],
              estimatedExperienceYears: 4,
              extractedEmail: 'rahul.sharma@example.com',
              extractedPhone: '+91 98765 43210'
            },
            aiDetection: {
              aiConfidenceScore: 28, // 28% AI confidence (meaning high human authenticity)
              breakdown: {
                aiPhrasesFound: 1,
                sentenceUniformity: 'Natural Human Variance',
                perplexityLevel: 'High Perplexity (Human Style)'
              }
            },
            devProfiles: {
              githubData: {
                username: 'rahul-sharma-dev',
                valid: true,
                reposCount: 18,
                starsCount: 42,
                totalCommits: 340,
                primaryLanguages: ['JavaScript', 'TypeScript', 'Python', 'HTML/CSS'],
                complexityScore: 82
              },
              leetcodeData: {
                username: 'rahul_lc',
                valid: true,
                solvedCount: 185,
                easy: 70,
                medium: 95,
                hard: 20,
                rating: 1680
              },
              officialLinkData: {
                url: 'https://rahulsharma.dev',
                valid: true
              }
            },
            overallScore: 88
          }
        });
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Failed to fetch AI verification data.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container glass-panel">
        <Cpu className="spinner icon-gold" size={36} />
        <h3>Step 5: AI Engine Processing Candidate Data...</h3>
        <p>Parsing resume text, checking AI detection score, and analyzing GitHub/LeetCode developer footprints.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel alert alert-error">
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchReport}>Retry</button>
      </div>
    );
  }

  const { application, verification } = data;
  const { parsedResume, aiDetection, devProfiles, overallScore } = verification;

  return (
    <div className="ai-dashboard-container">
      {/* Top Header Card */}
      <div className="report-header-card glass-panel">
        <div className="header-left">
          <div className="badge badge-gold"><Cpu size={14} /> Step 5: AI Resume & Skill Verification Report</div>
          <h2>{application.candidateName}</h2>
          <p className="subtext">
            Applied via {application.resumeOriginalName} • ID: <code>{application.id}</code>
          </p>
        </div>

        <div className="score-ring-wrap">
          <div className="score-ring">
            <svg viewBox="0 0 100 100">
              <circle className="circle-bg" cx="50" cy="50" r="42" />
              <circle
                className="circle-progress"
                cx="50"
                cy="50"
                r="42"
                style={{ strokeDasharray: `${(overallScore * 2.64)}, 264` }}
              />
            </svg>
            <div className="score-display">
              <span className="number">{overallScore}</span>
              <span className="label">Verification Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout of AI Verification Panels */}
      <div className="verification-grid">

        {/* Panel 1: AI Generated Resume Detection Score */}
        <div className="verif-card glass-panel">
          <div className="card-title-row">
            <Sparkles className="icon-gold" size={20} />
            <h3>AI-Generated Resume Detection</h3>
          </div>
          
          <div className="gauge-container">
            <div className="gauge-bar-track">
              <div
                className="gauge-bar-fill"
                style={{
                  width: `${aiDetection.aiConfidenceScore}%`,
                  backgroundColor: aiDetection.aiConfidenceScore > 60 ? '#ef4444' : '#10b981'
                }}
              />
            </div>
            <div className="gauge-labels">
              <span>Human Written (0%)</span>
              <strong className={aiDetection.aiConfidenceScore > 60 ? 'text-danger' : 'text-success'}>
                {aiDetection.aiConfidenceScore}% AI Likelihood
              </strong>
              <span>AI Generated (100%)</span>
            </div>
          </div>

          <div className="breakdown-list">
            <div className="breakdown-item">
              <span>Sentence Uniformity:</span>
              <strong>{aiDetection.breakdown?.sentenceUniformity}</strong>
            </div>
            <div className="breakdown-item">
              <span>Perplexity Style:</span>
              <strong>{aiDetection.breakdown?.perplexityLevel}</strong>
            </div>
            <div className="breakdown-item">
              <span>AI Buzzwords Found:</span>
              <strong>{aiDetection.breakdown?.aiPhrasesFound}</strong>
            </div>
          </div>
        </div>

        {/* Panel 2: Resume Parser Insights */}
        <div className="verif-card glass-panel">
          <div className="card-title-row">
            <FileText className="icon-blue" size={20} />
            <h3>Parsed Resume Entities</h3>
          </div>

          <div className="entity-row">
            <span>Estimated Experience:</span>
            <div className="badge badge-info">{parsedResume.estimatedExperienceYears}+ Years</div>
          </div>

          <div className="entity-row">
            <span>Extracted Email:</span>
            <code>{parsedResume.extractedEmail || application.candidateEmail}</code>
          </div>

          <div className="skills-tags-section">
            <label>Detected Core Skills:</label>
            <div className="skills-chips">
              {parsedResume.detectedSkills?.map((skill, idx) => (
                <span key={idx} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: GitHub Footprint & Code Complexity */}
        <div className="verif-card glass-panel">
          <div className="card-title-row">
            <GithubIcon size={20} />
            <h3>GitHub Footprint & Code Complexity</h3>
          </div>

          {devProfiles.githubData?.valid ? (
            <div className="dev-stats-body">
              <div className="dev-metrics-grid">
                <div className="metric-box">
                  <span className="metric-val">{devProfiles.githubData.reposCount}</span>
                  <span className="metric-lbl">Public Repos</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val"><GitCommit size={14} /> {devProfiles.githubData.totalCommits}</span>
                  <span className="metric-lbl">Est. Commits</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val"><Star size={14} /> {devProfiles.githubData.starsCount}</span>
                  <span className="metric-lbl">Stars</span>
                </div>
              </div>

              <div className="complexity-bar-box">
                <div className="label-row">
                  <span>Abstract Syntax Tree & Code Complexity:</span>
                  <strong>{devProfiles.githubData.complexityScore}/100</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${devProfiles.githubData.complexityScore}%` }}></div>
                </div>
              </div>

              <div className="languages-row">
                <span>Top Languages:</span>
                <div className="chip-list">
                  {devProfiles.githubData.primaryLanguages?.map((lang, i) => (
                    <span key={i} className="chip-sm">{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <AlertTriangle size={16} /> No GitHub link submitted or user not found.
            </div>
          )}
        </div>

        {/* Panel 4: LeetCode & Official Work Links */}
        <div className="verif-card glass-panel">
          <div className="card-title-row">
            <Code className="icon-gold" size={20} />
            <h3>LeetCode & Work Profile Verification</h3>
          </div>

          {devProfiles.leetcodeData?.valid ? (
            <div className="leetcode-stats-box">
              <div className="lc-top-row">
                <div>
                  <h4>{devProfiles.leetcodeData.solvedCount} Problems Solved</h4>
                  <span className="hint-text">LeetCode Rating: {devProfiles.leetcodeData.rating}</span>
                </div>
                <span className="badge badge-success"><CheckCircle2 size={14} /> Verified</span>
              </div>

              <div className="difficulty-pills">
                <span className="pill easy">Easy: {devProfiles.leetcodeData.easy}</span>
                <span className="pill medium">Medium: {devProfiles.leetcodeData.medium}</span>
                <span className="pill hard">Hard: {devProfiles.leetcodeData.hard}</span>
              </div>
            </div>
          ) : (
            <p className="hint-text">LeetCode profile not provided.</p>
          )}

          {devProfiles.officialLinkData?.valid && (
            <div className="portfolio-verif-box">
              <div className="portfolio-header">
                <ExternalLink size={16} /> Official Work / Project Link:
              </div>
              <a href={devProfiles.officialLinkData.url} target="_blank" rel="noreferrer" className="link-text">
                {devProfiles.officialLinkData.url}
              </a>
              <span className="badge badge-success"><CheckCircle2 size={14} /> Link Validated</span>
            </div>
          )}
        </div>

      </div>

      <div className="dashboard-footer-actions">
        <button className="btn btn-secondary" onClick={fetchReport}>
          <RefreshCw size={16} /> Re-run AI Analysis
        </button>
        {onBackToApply && (
          <button className="btn btn-primary" onClick={onBackToApply}>
            Submit Another Application
          </button>
        )}
      </div>
    </div>
  );
}
