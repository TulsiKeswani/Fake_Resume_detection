import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, FileText, Sliders, Share2, Layers } from 'lucide-react';
import AIJDGeneratorModal from './AIJDGeneratorModal';
import FormBuilder from './FormBuilder';
import AspectWeightageConfig from './AspectWeightageConfig';
import PublishAndShare from './PublishAndShare';
import { api } from '../../services/api';

export default function JobCreationWizard({ onJobCreated, onNavigateToApply }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAIModal, setShowAIModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Job state
  const [jobInfo, setJobInfo] = useState({
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote / Bangalore',
    jobType: 'Full-time',
    experienceLevel: 'Mid-Level',
    description: `We are seeking a Senior Full Stack Engineer experienced in React, Node.js, TypeScript, and cloud services. You will design scalable web applications and lead technical initiatives.`
  });

  // Dynamic Custom Questions
  const [customQuestions, setCustomQuestions] = useState([
    {
      id: 'q_notice',
      questionText: 'What is your notice period (in days)?',
      type: 'text',
      isRequired: true
    },
    {
      id: 'q_exp',
      questionText: 'How many years of hands-on React/Node.js experience do you have?',
      type: 'dropdown',
      options: ['0-1 Years', '2-4 Years', '5+ Years'],
      isRequired: true
    }
  ]);

  // Aspect Weights
  const [aspectWeights, setAspectWeights] = useState({
    technical: 30,
    communication: 20,
    bodyLanguage: 15,
    englishFluency: 15,
    professionalism: 20
  });

  const [createdJobResult, setCreatedJobResult] = useState(null);

  const handleCreateJobSubmit = async () => {
    // Validate weight total
    const totalWeights = Object.values(aspectWeights).reduce((a, b) => Number(a) + Number(b), 0);
    if (totalWeights !== 100) {
      setError(`Aspect weightages must sum to 100%. Current total: ${totalWeights}%`);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...jobInfo,
        customQuestions,
        aspectWeights,
        isPublishedPortal: true
      };

      const res = await api.createJob(payload);
      if (res.success) {
        setCreatedJobResult(res.job);
        if (onJobCreated) onJobCreated(res.job);
        setCurrentStep(4); // Move to Share step
      } else {
        setError(res.error || 'Failed to create job.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-container">
      {/* Wizard Header Progress Bar */}
      <div className="wizard-progress-nav glass-panel">
        <div className={`step-pill ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-num">1</div>
          <span>Job Details & AI JD</span>
        </div>
        <div className={`step-pill ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-num">2</div>
          <span>Form Builder</span>
        </div>
        <div className={`step-pill ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-num">3</div>
          <span>Evaluation Weights</span>
        </div>
        <div className={`step-pill ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-num">4</div>
          <span>Publish & Share</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* STEP 1: Job Details & AI JD */}
      {currentStep === 1 && (
        <div className="step-content glass-panel">
          <div className="step-header">
            <h3><Layers className="icon-gold" size={20} /> Step 3: Company Job Details & AI JD</h3>
            <button className="btn btn-ai-sparkle" onClick={() => setShowAIModal(true)}>
              <Sparkles size={16} /> Auto-Generate JD with AI
            </button>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Job Title / Role *</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={jobInfo.title}
                onChange={(e) => setJobInfo({ ...jobInfo, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                placeholder="e.g. Engineering / Product"
                value={jobInfo.department}
                onChange={(e) => setJobInfo({ ...jobInfo, department: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g. Remote / Bangalore"
                value={jobInfo.location}
                onChange={(e) => setJobInfo({ ...jobInfo, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select
                value={jobInfo.jobType}
                onChange={(e) => setJobInfo({ ...jobInfo, jobType: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select
                value={jobInfo.experienceLevel}
                onChange={(e) => setJobInfo({ ...jobInfo, experienceLevel: e.target.value })}
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior-Level">Senior-Level</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-badge">
              <label>Job Description (JD)</label>
              <span className="badge badge-info">AI Assisted</span>
            </div>
            <textarea
              rows={8}
              value={jobInfo.description}
              onChange={(e) => setJobInfo({ ...jobInfo, description: e.target.value })}
            />
          </div>

          <div className="wizard-footer">
            <div></div>
            <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
              Next: Form Builder <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Form Builder */}
      {currentStep === 2 && (
        <div className="step-content glass-panel">
          <FormBuilder
            questions={customQuestions}
            onQuestionsChange={setCustomQuestions}
          />
          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
              Next: Set Evaluation Weights <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Aspect Weightages */}
      {currentStep === 3 && (
        <div className="step-content glass-panel">
          <AspectWeightageConfig
            weights={aspectWeights}
            onWeightsChange={setAspectWeights}
          />
          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={handleCreateJobSubmit}
              disabled={loading}
            >
              {loading ? 'Creating Job...' : <><Check size={18} /> Publish Job & Generate Share Link</>}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Publish & Share */}
      {currentStep === 4 && (
        <PublishAndShare
          createdJob={createdJobResult}
          onNavigateToApply={onNavigateToApply}
        />
      )}

      {/* AI JD Generator Modal */}
      {showAIModal && (
        <AIJDGeneratorModal
          roleName={jobInfo.title}
          onInsertDescription={(jdText) => setJobInfo({ ...jobInfo, description: jdText })}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
}
