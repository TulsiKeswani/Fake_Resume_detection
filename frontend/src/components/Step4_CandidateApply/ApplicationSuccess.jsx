import { CheckCircle, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ApplicationSuccess({ applicationId, onNavigateToReport }) {
  return (
    <div className="application-success-card glass-panel">
      <div className="success-badge-icon">
        <CheckCircle size={56} className="icon-success" />
      </div>

      <h2>Application Submitted Successfully!</h2>
      <p className="subtitle">
        Your application has been received and registered under Application ID: <code>{applicationId}</code>.
      </p>

      <div className="ai-processing-notice glass-panel">
        <Cpu className="icon-gold" size={24} />
        <div>
          <h4>Step 5: Background AI Verification Engine Initiated</h4>
          <p>
            Our AI engine is currently parsing your resume, inspecting code complexity on your developer profile (GitHub/LeetCode), checking authenticity confidence, and calculating your initial evaluation metrics.
          </p>
        </div>
      </div>

      <div className="action-row">
        <button
          className="btn btn-gold btn-lg"
          onClick={() => onNavigateToReport(applicationId)}
        >
          <ShieldCheck size={18} /> View AI Verification Report (Step 5) <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
