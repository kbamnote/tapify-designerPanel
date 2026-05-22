import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api, uploadImage } from '../api';
import { useToast } from '../components/ToastProvider';
import BASE from '../api';

/* ── Square Image Cropper ────────────────────────────────────────────── */
const CropModal = ({ imageSrc, onConfirm, onCancel }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef(null);

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const onImageLoad = () => {
    const img = imgRef.current;
    const w = img.offsetWidth;
    const h = img.offsetHeight;
    setDisplaySize({ w, h });
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    const size = Math.round(Math.min(w, h) * 0.82);
    setCrop({ x: Math.round((w - size) / 2), y: Math.round((h - size) / 2), size });
    setReady(true);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    dragStartRef.current = { sx: e.clientX, sy: e.clientY, ox: crop.x, oy: crop.y };
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.sx;
    const dy = e.clientY - dragStartRef.current.sy;
    setCrop(prev => ({
      ...prev,
      x: clamp(dragStartRef.current.ox + dx, 0, displaySize.w - prev.size),
      y: clamp(dragStartRef.current.oy + dy, 0, displaySize.h - prev.size),
    }));
  };

  const onMouseUp = () => { draggingRef.current = false; };

  const handleSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setCrop(prev => ({
      size,
      x: clamp(prev.x, 0, displaySize.w - size),
      y: clamp(prev.y, 0, displaySize.h - size),
    }));
  };

  const handleConfirm = () => {
    const scaleX = naturalSize.w / displaySize.w;
    const scaleY = naturalSize.h / displaySize.h;
    const OUTPUT = 800;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX, crop.y * scaleY,
      crop.size * scaleX, crop.size * scaleY,
      0, 0, OUTPUT, OUTPUT
    );
    canvas.toBlob(blob => onConfirm(blob), 'image/jpeg', 0.92);
  };

  const maxSize = ready ? Math.min(displaySize.w, displaySize.h) : 200;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">✂️ Crop to Square</span>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          <div
            ref={containerRef}
            style={{ position: 'relative', display: 'inline-block', userSelect: 'none', width: '100%', cursor: 'default' }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              style={{ display: 'block', maxWidth: '100%', maxHeight: 380, margin: '0 auto' }}
              draggable={false}
              alt="Crop preview"
            />
            {ready && (
              <>
                {/* 4-panel dark overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: crop.y, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: crop.y + crop.size, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: crop.y, left: 0, width: crop.x, height: crop.size, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: crop.y, left: crop.x + crop.size, right: 0, height: crop.size, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
                {/* Crop box */}
                <div
                  onMouseDown={onMouseDown}
                  style={{
                    position: 'absolute',
                    left: crop.x, top: crop.y,
                    width: crop.size, height: crop.size,
                    border: '2px solid #ffffff',
                    boxSizing: 'border-box',
                    cursor: 'grab',
                  }}
                >
                  {/* Rule-of-thirds grid */}
                  <div style={{ position: 'absolute', top: '33.3%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '66.6%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }} />
                  {/* Corner handles */}
                  {[{ top: -4, left: -4 }, { top: -4, right: -4 }, { bottom: -4, left: -4 }, { bottom: -4, right: -4 }].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', ...s, width: 10, height: 10, background: '#fff', borderRadius: 2, pointerEvents: 'none' }} />
                  ))}
                </div>
              </>
            )}
          </div>

          {ready && (
            <div style={{ marginTop: 20 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Crop Size</span>
                <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{crop.size}px × {crop.size}px</span>
              </label>
              <input
                type="range"
                min={60}
                max={maxSize}
                value={crop.size}
                onChange={handleSizeChange}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
                Drag the white box to reposition • Use the slider to resize
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={!ready}>
            ✂️ Crop & Use
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Category Modal (simplified: Image + Name only) ──────────────────── */
const CategoryModal = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');
  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const inputRef = useRef();
  const toast = useToast();

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setCropSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleCropConfirm = async (blob) => {
    setCropSrc(null);
    setUploading(true);
    try {
      const file = new File([blob], 'category-image.jpg', { type: 'image/jpeg' });
      const data = await uploadImage(file);
      const url = data.url || data.image_url || data.data?.url || '';
      setImageUrl(url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await api('/api/admin/designs/categories.php', {
        method: 'POST',
        body: JSON.stringify({
          ...(category?.id ? { id: category.id } : {}),
          name: name.trim(),
          slug: category?.slug || slug,
          icon: category?.icon || '🎨',
          bg_color: category?.bg_color || '#153e3f',
          text_color: category?.text_color || '#ffffff',
          sort_order: category?.sort_order || 0,
          is_active: 1,
          image_url: imageUrl,
        }),
      });
      toast.success(category ? 'Category updated!' : 'Category created!');
      onSave();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const imgSrc = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : BASE + imageUrl) : null;

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth: 420 }}>
          <div className="modal-header">
            <span className="modal-title">{category ? '✏️ Edit Category' : '➕ New Category'}</span>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ─── Image Upload / Preview ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {imgSrc ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={imgSrc}
                      alt="Category"
                      style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 16, display: 'block', border: '3px solid var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      title="Remove"
                      style={{
                        position: 'absolute', top: -10, right: -10,
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#ef4444', color: '#fff', border: 'none',
                        fontSize: 16, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                      }}
                    >×</button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                    style={{
                      width: 180, height: 180, borderRadius: 16,
                      border: '2px dashed var(--border)',
                      background: 'var(--surface2)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: uploading ? 'default' : 'pointer',
                      gap: 8, transition: 'border-color 0.2s',
                    }}
                  >
                    {uploading ? (
                      <><div className="spinner" /><span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Uploading…</span></>
                    ) : (
                      <>
                        <span style={{ fontSize: 36 }}>🖼️</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Click to upload</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Square image</span>
                      </>
                    )}
                  </div>
                )}

                {imgSrc && !uploading && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => inputRef.current?.click()}
                  >
                    🔄 Change Image
                  </button>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { handleFileSelect(e.target.files[0]); e.target.value = ''; }}
                />
              </div>

              {/* ─── Name Field ─── */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Diwali, Eid, Christmas…"
                  required
                  style={{ fontSize: 16 }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                {saving ? <><div className="spinner spinner-sm" /> Saving…</> : '💾 Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Crop modal renders on top */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  );
};

/* ── Main Page ───────────────────────────────────────────────────────── */
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/api/admin/designs/categories.php');
      setCategories(Array.isArray(data.data?.categories) ? data.data.categories : []);
    } catch (err) {
      toast.error('Failed to load: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setDeleting(cat.id);
    try {
      await api(`/api/admin/designs/categories.php?id=${cat.id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">🗂️ Categories</div>
          <div className="page-subtitle">Manage design categories visible in the Tapify app</div>
        </div>
        <button id="add-category-btn" className="btn btn-primary" onClick={() => setModal('add')}>
          ＋ Add Category
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span className="spinner-text">Loading…</span></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">No categories yet</div>
          <div className="empty-state-desc">Click "+ Add Category" to create your first one.</div>
        </div>
      ) : (
        /* ── Category cards grid ── */
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '8px 0' }}>
          {categories.map(cat => {
            const imgSrc = cat.image_url
              ? (cat.image_url.startsWith('http') ? cat.image_url : BASE + cat.image_url)
              : null;
            return (
              <div
                key={cat.id}
                style={{
                  width: 180,
                  background: 'var(--surface)',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Image */}
                <div style={{ width: '100%', aspectRatio: '1', background: cat.bg_color || '#f3f4f6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                  ) : (
                    <span style={{ fontSize: 48 }}>{cat.icon || '🎨'}</span>
                  )}
                  {/* Active badge */}
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    background: cat.is_active ? '#22c55e' : '#ef4444',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 20,
                  }}>
                    {cat.is_active ? 'Active' : 'Off'}
                  </span>
                </div>

                {/* Name + Actions */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{cat.name}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, fontSize: 12 }}
                      onClick={() => setModal(cat)}
                    >✏️ Edit</button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, fontSize: 12 }}
                      onClick={() => handleDelete(cat)}
                      disabled={deleting === cat.id}
                    >{deleting === cat.id ? '…' : '🗑️'}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchCategories(); }}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
