import { Plus, Trash2, ShieldAlert, FileText, Link, Code } from 'lucide-react';

export default function FormBuilder({ questions, onQuestionsChange }) {

  const addQuestion = () => {
    const newQ = {
      id: 'q_' + Date.now(),
      questionText: '',
      type: 'text',
      options: ['Option 1'],
      isRequired: true
    };
    onQuestionsChange([...questions, newQ]);
  };

  const updateQuestion = (id, field, value) => {
    onQuestionsChange(
      questions.map(q => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (id) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
  };

  const addOption = (qId) => {
    onQuestionsChange(
      questions.map(q => {
        if (q.id === qId) {
          return { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] };
        }
        return q;
      })
    );
  };

  const updateOption = (qId, idx, val) => {
    onQuestionsChange(
      questions.map(q => {
        if (q.id === qId) {
          const opts = [...(q.options || [])];
          opts[idx] = val;
          return { ...q, options: opts };
        }
        return q;
      })
    );
  };

  const removeOption = (qId, idx) => {
    onQuestionsChange(
      questions.map(q => {
        if (q.id === qId) {
          const opts = (q.options || []).filter((_, i) => i !== idx);
          return { ...q, options: opts };
        }
        return q;
      })
    );
  };

  return (
    <div className="form-builder-section">
      <div className="section-title-badge">
        <FileText size={18} />
        <span>Step 3: Dynamic Application Form Builder (Google Forms style)</span>
      </div>
      <p className="subtitle">
        Define custom questions and fields candidates must fill out when applying for this job.
      </p>

      {/* Default System Mandatory Fields Banner */}
      <div className="mandatory-notice-box glass-panel">
        <ShieldAlert className="icon-gold" size={20} />
        <div className="notice-content">
          <h4>System Mandatory Requirements (Enforced)</h4>
          <ul>
            <li><FileText size={14} /> <strong>Resume Upload (.PDF / .DOCX)</strong> — Strictly Mandatory for AI Parsing.</li>
            <li><Code size={14} /> <strong>GitHub / LeetCode / Official Skill/Work Link</strong> — Candidates MUST provide developer/project links for verification.</li>
          </ul>
        </div>
      </div>

      {/* Dynamic Questions List */}
      <div className="questions-list">
        {questions.map((q, index) => (
          <div key={q.id} className="question-card glass-panel">
            <div className="question-header">
              <span className="question-number">Question #{index + 1}</span>
              <div className="question-actions">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={q.isRequired}
                    onChange={(e) => updateQuestion(q.id, 'isRequired', e.target.checked)}
                  />
                  <span>Mandatory</span>
                </label>
                <button
                  type="button"
                  className="btn-icon danger"
                  onClick={() => removeQuestion(q.id)}
                  title="Delete Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Question Title / Prompt</label>
                <input
                  type="text"
                  placeholder="e.g. What is your notice period?"
                  value={q.questionText}
                  onChange={(e) => updateQuestion(q.id, 'questionText', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Input Type</label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                >
                  <option value="text">Short Answer (Text)</option>
                  <option value="textarea">Paragraph (Long Text)</option>
                  <option value="radio">Multiple Choice (Radio)</option>
                  <option value="checkbox">Checkboxes</option>
                  <option value="dropdown">Dropdown Select</option>
                  <option value="file">File Attachment</option>
                </select>
              </div>
            </div>

            {/* Options list for choice questions */}
            {['radio', 'checkbox', 'dropdown'].includes(q.type) && (
              <div className="options-builder">
                <label>Options List</label>
                {q.options?.map((opt, oIdx) => (
                  <div key={oIdx} className="option-row">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-icon small danger"
                      onClick={() => removeOption(q.id, oIdx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary small"
                  onClick={() => addOption(q.id)}
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary" onClick={addQuestion}>
        <Plus size={18} /> Add Custom Question
      </button>
    </div>
  );
}
