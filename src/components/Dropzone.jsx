import React, { useState, useRef } from 'react';
import { uploadImage } from '../api';
import { useToast } from './ToastProvider';
import BASE from '../api';

const Dropzone = ({ imageUrl, onUpload, onRemove }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const data = await uploadImage(file);
      onUpload(data.url || data.image_url || data.data?.url || '');
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  if (imageUrl) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="image-preview-wrap" style={{ display: 'block' }}>
          <img
            src={imageUrl.startsWith('http') ? imageUrl : BASE + imageUrl}
            alt="Preview"
            className="image-preview"
          />
          <button type="button" className="image-preview-remove" onClick={onRemove} title="Remove image">×</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dropzone ${dragging ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {uploading ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: 10 }}>
          <div className="spinner" />
          <span className="dropzone-text">Uploading…</span>
        </div>
      ) : (
        <>
          <div className="dropzone-icon">🖼️</div>
          <div className="dropzone-text">
            <strong>Click to browse</strong> or drag &amp; drop an image
          </div>
          <div className="dropzone-hint">PNG, JPG, WEBP — max 10MB</div>
        </>
      )}
    </div>
  );
};

export default Dropzone;
