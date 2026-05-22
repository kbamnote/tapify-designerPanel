import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { useToast } from '../components/ToastProvider';
import Dropzone from '../components/Dropzone';
import BASE from '../api';

/* ── Helpers ─────────────────────────────────────────────────────────── */
const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const defaultForm = () => ({
  name: '',
  slug: '',
  icon: '🎨',
  bg_color: '#153e3f',
  text_color: '#ffffff',
  sort_order: 0,
  is_active: true,
  image_url: '',
});

/* ── Color Input ─────────────────────────────────────────────────────── */
const ColorInput = ({ label, id, value, onChange }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="color-input-wrap">
      <input
        type="color"
        id={id}
        className="color-swatch-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ backgroundColor: value }}
      />
      <input
        type="text"
        className="color-hex-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={7}
        placeholder="#000000"
      />
    </div>
  </div>
);

/* ── Category Modal ──────────────────────────────────────────────────── */
const CategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState(category ? { ...category } : defaultForm());
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'name' && !category) next.slug = slugify(val);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await api('/api/admin/designs/categories.php', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active ? 1 : 0,
          image_url: form.image_url || '',
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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{category ? '✏️ Edit Category' : '➕ New Category'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category Image (Square)</label>
              <Dropzone
                imageUrl={form.image_url}
                onUpload={url => set('image_url', url)}
                onRemove={() => set('image_url', '')}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">Name *</label>
                <input id="cat-name" type="text" className="form-input" value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="e.g. Diwali" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-slug">Slug</label>
                <input id="cat-slug" type="text" className="form-input" value={form.slug}
                  onChange={e => set('slug', e.target.value)} placeholder="e.g. diwali" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cat-icon">Icon (Emoji)</label>
                <input id="cat-icon" type="text" className="form-input" value={form.icon}
                  onChange={e => set('icon', e.target.value)} placeholder="🎨" maxLength={4}
                  style={{ fontSize: 22 }} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-sort">Sort Order</label>
                <input id="cat-sort" type="number" className="form-input" value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)} min={0} />
              </div>
            </div>

            <div className="form-row">
              <ColorInput label="Background Color" id="cat-bg" value={form.bg_color}
                onChange={v => set('bg_color', v)} />
              <ColorInput label="Text Color" id="cat-text" value={form.text_color}
                onChange={v => set('text_color', v)} />
            </div>

            <div className="form-group">
              <div className="toggle-wrap">
                <label className="toggle">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => set('is_active', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span className="toggle-label">Active (visible in app)</span>
              </div>
            </div>

            {/* Live preview */}
            <div style={{ marginTop: 8 }}>
              <div className="form-label">Live Preview</div>
              <div className="category-preview" style={{ background: form.bg_color, borderColor: 'transparent' }}>
                <span className="category-preview-icon">{form.icon || '🎨'}</span>
                <span className="category-preview-name" style={{ color: form.text_color }}>
                  {form.name || 'Category Name'}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" id="cat-save-btn" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner spinner-sm" /> Saving…</> : '💾 Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────────────────── */
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | category object
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/api/admin/designs/categories.php');
      setCategories(Array.isArray(data.data?.categories) ? data.data.categories : []);
    } catch (err) {
      toast.error('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
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

  const handleSave = () => {
    setModal(null);
    fetchCategories();
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

      <div className="table-wrap">
        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
            <span className="spinner-text">Loading categories…</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <div className="empty-state-title">No categories yet</div>
            <div className="empty-state-desc">Create your first category to get started.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image/Icon</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Colors</th>
                <th>Sort</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    {cat.image_url ? (
                      <img src={cat.image_url.startsWith('http') ? cat.image_url : BASE + cat.image_url} alt={cat.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cat.name}</span>
                  </td>
                  <td>
                    <span className="font-mono text-muted" style={{ fontSize: 12 }}>{cat.slug}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="color-swatch" style={{ background: cat.bg_color }} title={`BG: ${cat.bg_color}`} />
                      <span className="color-swatch" style={{ background: cat.text_color }} title={`Text: ${cat.text_color}`} />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.bg_color}</span>
                    </div>
                  </td>
                  <td>{cat.sort_order ?? 0}</td>
                  <td>
                    <span className={`badge ${cat.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {cat.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(cat)}>
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(cat)}
                        disabled={deleting === cat.id}
                      >
                        {deleting === cat.id ? '…' : '🗑️ Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
