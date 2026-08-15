import { Code, Link, User, Mail, Phone, AlertCircle } from 'lucide-react';

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export default function DynamicFormRenderer({
  candidateData,
  onCandidateDataChange,
  customQuestions = [],
  formAnswers,
  onFormAnswerChange,
  errors = {}
}) {
  const hasDevLink = Boolean(
    (candidateData.githubUrl && candidateData.githubUrl.trim()) ||
    (candidateData.leetcodeUrl && candidateData.leetcodeUrl.trim()) ||
    (candidateData.portfolioUrl && candidateData.portfolioUrl.trim())
  );

  return (
    <div className="dynamic-form-renderer">
      {/* Section 1: Candidate Personal Info */}
      <div className="form-section-block">
        <h4>Candidate Basic Information</h4>
        <div className="form-grid-2">
          <div className="form-group">
            <label><User size={15} /> Full Name <span className="required-star">*</span></label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={candidateData.candidateName}
              onChange={(e) => onCandidateDataChange('candidateName', e.target.value)}
              className={errors.candidateName ? 'input-error' : ''}
            />
            {errors.candidateName && <span className="field-error-msg">{errors.candidateName}</span>}
          </div>

          <div className="form-group">
            <label><Mail size={15} /> Email Address <span className="required-star">*</span></label>
            <input
              type="email"
              placeholder="rahul@example.com"
              value={candidateData.candidateEmail}
              onChange={(e) => onCandidateDataChange('candidateEmail', e.target.value)}
              className={errors.candidateEmail ? 'input-error' : ''}
            />
            {errors.candidateEmail && <span className="field-error-msg">{errors.candidateEmail}</span>}
          </div>
        </div>

        <div className="form-group">
          <label><Phone size={15} /> Phone Number</label>
          <input
            type="text"
            placeholder="+91 98765 43210"
            value={candidateData.candidatePhone}
            onChange={(e) => onCandidateDataChange('candidatePhone', e.target.value)}
          />
        </div>
      </div>

      {/* Section 2: MANDATORY Developer / Work Verification Links */}
      <div className="form-section-block highlight-section glass-panel">
        <div className="section-header-title">
          <h4>Skill & Developer Verification Links</h4>
          <span className={`badge ${hasDevLink ? 'badge-success' : 'badge-warning'}`}>
            Mandatory Requirement
          </span>
        </div>
        <p className="subtitle-sm">
          Please provide at least one developer profile or official project link below so our AI can verify your real-world skills, commit history, and code complexity.
        </p>

        <div className="form-group">
          <label><GithubIcon size={15} /> GitHub Profile Link</label>
          <input
            type="url"
            placeholder="https://github.com/your-username"
            value={candidateData.githubUrl}
            onChange={(e) => onCandidateDataChange('githubUrl', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><Code size={15} /> LeetCode Profile Link</label>
          <input
            type="url"
            placeholder="https://leetcode.com/your-username"
            value={candidateData.leetcodeUrl}
            onChange={(e) => onCandidateDataChange('leetcodeUrl', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><Link size={15} /> Official Project / Work / Portfolio Link</label>
          <input
            type="url"
            placeholder="https://myportfolio.com or https://project-demo.com"
            value={candidateData.portfolioUrl}
            onChange={(e) => onCandidateDataChange('portfolioUrl', e.target.value)}
          />
          <small className="hint-text">
            * If you don't use GitHub/LeetCode, provide any official link showing your work or skills.
          </small>
        </div>

        {errors.devLinks && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {errors.devLinks}
          </div>
        )}
      </div>

      {/* Section 3: Company Dynamic Custom Questions */}
      {customQuestions.length > 0 && (
        <div className="form-section-block">
          <h4>Company Specific Questions</h4>
          {customQuestions.map((q) => (
            <div key={q.id} className="form-group">
              <label>
                {q.questionText} {q.isRequired && <span className="required-star">*</span>}
              </label>

              {q.type === 'text' && (
                <input
                  type="text"
                  value={formAnswers[q.id] || ''}
                  onChange={(e) => onFormAnswerChange(q.id, e.target.value)}
                  className={errors[q.id] ? 'input-error' : ''}
                />
              )}

              {q.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={formAnswers[q.id] || ''}
                  onChange={(e) => onFormAnswerChange(q.id, e.target.value)}
                  className={errors[q.id] ? 'input-error' : ''}
                />
              )}

              {q.type === 'dropdown' && (
                <select
                  value={formAnswers[q.id] || ''}
                  onChange={(e) => onFormAnswerChange(q.id, e.target.value)}
                  className={errors[q.id] ? 'input-error' : ''}
                >
                  <option value="">-- Select Option --</option>
                  {q.options?.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === 'radio' && (
                <div className="radio-group">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="radio-item">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={formAnswers[q.id] === opt}
                        onChange={(e) => onFormAnswerChange(q.id, e.target.value)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'checkbox' && (
                <div className="checkbox-group">
                  {q.options?.map((opt, i) => {
                    const currentArr = Array.isArray(formAnswers[q.id]) ? formAnswers[q.id] : [];
                    const isChecked = currentArr.includes(opt);
                    return (
                      <label key={i} className="checkbox-item">
                        <input
                          type="checkbox"
                          value={opt}
                          checked={isChecked}
                          onChange={(e) => {
                            const newArr = e.target.checked
                              ? [...currentArr, opt]
                              : currentArr.filter(item => item !== opt);
                            onFormAnswerChange(q.id, newArr);
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {errors[q.id] && <span className="field-error-msg">{errors[q.id]}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
