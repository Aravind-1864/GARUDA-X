import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, FileText, CheckCircle } from 'lucide-react';
import './ScreenshotUploader.css';

const ScreenshotUploader = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    onFileSelect(f);

    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="uploader-wrapper">
      {!file ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag-active' : ''}`}>
          <input {...getInputProps()} />
          <div className="dropzone-icon">
            <Upload size={28} />
          </div>
          <div className="dropzone-text">
            {isDragActive ? (
              <p className="drop-active-text">Release to upload!</p>
            ) : (
              <>
                <p className="drop-main-text">Drag & drop your screenshot here</p>
                <p className="drop-sub-text">or <span>browse files</span> — PNG, JPG, PDF supported</p>
              </>
            )}
          </div>
          <div className="dropzone-ocr-tag">
            <span>🔍 OCR-Powered Extraction</span>
          </div>
        </div>
      ) : (
        <div className="file-preview">
          <div className="file-preview-header">
            <div className="file-info">
              {preview ? <Image size={18} color="var(--accent-blue)" /> : <FileText size={18} color="var(--accent-blue)" />}
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="file-ready-badge">
                <CheckCircle size={12} />
                Ready
              </span>
              <button className="remove-file-btn" onClick={removeFile}>
                <X size={16} />
              </button>
            </div>
          </div>
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Upload preview" />
              <div className="ocr-overlay">
                <span>OCR will extract text from this image</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenshotUploader;
