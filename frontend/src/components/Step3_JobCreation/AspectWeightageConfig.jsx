import { Sliders, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AspectWeightageConfig({ weights, onWeightsChange }) {
  
  const handleChange = (aspect, value) => {
    const num = Math.max(0, Math.min(100, Number(value)));
    onWeightsChange({
      ...weights,
      [aspect]: num
    });
  };

  const total = Object.values(weights).reduce((sum, val) => sum + Number(val), 0);
  const isValid = total === 100;

  const aspectMetadata = [
    { key: 'technical', label: 'Technical & Domain Knowledge', desc: 'Code syntax, architecture, problem-solving', color: '#6366f1' },
    { key: 'communication', label: 'Communication Skills', desc: 'Clarity of explanation, structure of answers', color: '#3b82f6' },
    { key: 'bodyLanguage', label: 'Body Language & Confidence', desc: 'Eye contact, facial expressions, posture', color: '#ec4899' },
    { key: 'englishFluency', label: 'English Fluency & Vocabulary', desc: 'Grammar, vocabulary richness, pronunciation', color: '#10b981' },
    { key: 'professionalism', label: 'Professionalism & Culture Fit', desc: 'Attitude, workplace decorum, career alignment', color: '#f59e0b' }
  ];

  return (
    <div className="aspect-config-section">
      <div className="section-title-badge">
        <Sliders size={18} />
        <span>Step 3: Define AI Candidate Evaluation Aspect Weightages</span>
      </div>
      <p className="subtitle">
        Specify the importance (%) of each evaluation criteria. The total sum must equal <strong>100%</strong>.
      </p>

      {/* Weight Total Bar */}
      <div className={`weight-summary-card glass-panel ${isValid ? 'valid' : 'invalid'}`}>
        <div className="summary-info">
          <span>Total Assigned Weightage</span>
          <h2 className="total-display">{total}% / 100%</h2>
        </div>
        <div className="status-indicator">
          {isValid ? (
            <div className="badge badge-success">
              <CheckCircle2 size={16} /> Valid (100% Total)
            </div>
          ) : (
            <div className="badge badge-error">
              <AlertCircle size={16} /> Needs adjustment ({total < 100 ? `${100 - total}% remaining` : `${total - 100}% excess`})
            </div>
          )}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="aspect-sliders-grid">
        {aspectMetadata.map(aspect => (
          <div key={aspect.key} className="aspect-card glass-panel">
            <div className="aspect-header">
              <div>
                <h4 style={{ color: aspect.color }}>{aspect.label}</h4>
                <p>{aspect.desc}</p>
              </div>
              <div className="weight-badge" style={{ borderColor: aspect.color, color: aspect.color }}>
                {weights[aspect.key]}%
              </div>
            </div>

            <div className="slider-control">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={weights[aspect.key]}
                onChange={(e) => handleChange(aspect.key, e.target.value)}
                style={{ accentColor: aspect.color }}
              />
              <div className="range-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
