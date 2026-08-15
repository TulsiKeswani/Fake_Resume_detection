import { useState } from 'react';
import { Sparkles, Loader2, X, Check } from 'lucide-react';
import { api } from '../../services/api';

export default function AIJDGeneratorModal({ roleName, onInsertDescription, onClose }) {
  const [role, setRole] = useState(roleName || '');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!role.trim()) {
      setError('Please specify the job role/title.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.generateJD({ role, skills: skillsArray, experienceLevel });
      if (res.success) {
        setGeneratedText(res.description);
      } else {
        setError(res.error || 'Failed to generate Job Description');
      }
    } catch (err) {
      setError('Error connecting to AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedText) {
      onInsertDescription(generatedText);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles className="icon-gold" size={22} />
            <h3>AI Job Description Generator</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Role / Position Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Required Skills (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. React, TypeScript, Node.js, GraphQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                <option value="Entry-Level">Entry-Level (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior-Level">Senior-Level (5+ yrs)</option>
                <option value="Lead / Principal">Lead / Principal</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} /> Generating AI JD...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Professional JD
              </>
            )}
          </button>

          {generatedText && (
            <div className="generated-preview-box">
              <div className="preview-header">
                <span>Generated Job Description Preview</span>
              </div>
              <textarea
                rows={10}
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {generatedText && (
            <button className="btn btn-success" onClick={handleApply}>
              <Check size={18} /> Apply to Job Description
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
