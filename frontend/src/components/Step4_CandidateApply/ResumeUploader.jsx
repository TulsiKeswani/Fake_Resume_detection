import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';

export default function ResumeUploader({ selectedFile, onFileSelect, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      onFileSelect(file);
    } else {
      alert('Invalid file format. Please upload a PDF or DOCX file.');
    }
  };

  return (
    <div className="resume-uploader-container">
      <label className="uploader-label">
        Candidate Resume Upload <span className="required-star">* Mandatory</span>
      </label>
      
      {!selectedFile ? (
        <div
          className={`dropzone glass-panel ${isDragging ? 'dragging' : ''} ${error ? 'error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />
          <div className="dropzone-icon-wrap">
            <Upload size={28} />
          </div>
          <h4>Click or Drag & Drop your Resume here</h4>
          <p>Supports PDF, DOCX (Max size 10MB)</p>
          <span className="badge badge-info">AI Auto-Parsing Enabled</span>
        </div>
      ) : (
        <div className="file-selected-card glass-panel">
          <div className="file-info">
            <FileText size={24} className="icon-gold" />
            <div>
              <strong>{selectedFile.name}</strong>
              <p>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI verification</p>
            </div>
          </div>
          <div className="file-actions">
            <span className="badge badge-success"><CheckCircle2 size={14} /> Selected</span>
            <button
              type="button"
              className="btn-icon danger"
              onClick={() => onFileSelect(null)}
              title="Remove File"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {error && <div className="field-error-msg">{error}</div>}
    </div>
  );
}
