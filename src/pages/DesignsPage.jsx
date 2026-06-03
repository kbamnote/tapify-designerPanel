import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api, uploadImage } from '../api';
import { useToast } from '../components/ToastProvider';
import BASE from '../api';
import Dropzone from '../components/Dropzone';

/* ── Default form ─────────────────────────────────────────────────────── */
const defaultForm = () => ({
  title: '',
  description: '',
  category_id: '',
  content_category_id: '',
  tags: '',
  sort_order: 0,
  is_active: true,
  image_url: '',
});


/* ── Design Modal ─────────────────────────────────────────────────────── */
const DesignModal = ({ design, categories, contentCategories, onClose, onSave }) => {
  const initialContentCat = design ? contentCategories.find(c => String(c.id) === String(design.content_category_id)) : null;
  const initParent = initialContentCat?.parent_id != null ? String(initialContentCat.parent_id) : (initialContentCat ? String(initialContentCat.id) : '');
  const initSub = initialContentCat?.parent_id != null ? String(initialContentCat.id) : '';

  const [form, setForm] = useState(design ? { ...design, tags: Array.isArray(design.tags) ? design.tags.join(', ') : design.tags || '' } : defaultForm());
  const [parentContentCatId, setParentContentCatId] = useState(initParent);
  const [subContentCatId, setSubContentCatId] = useState(initSub);
  
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const allParents = contentCategories.filter(c => c.parent_id == null);
  const getSubs = (parentId) => contentCategories.filter(c => String(c.parent_id) === String(parentId));

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active ? 1 : 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        category_id: form.category_id || null,
        content_category_id: subContentCatId || parentContentCatId || null,
      };
      await api('/api/admin/designs/manage.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success(design ? 'Design updated!' : 'Design created!');
      onSave();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">{design ? '✏️ Edit Design' : '➕ New Design'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Design Image</label>
              <Dropzone
                imageUrl={form.image_url}
                onUpload={url => set('image_url', url)}
                onRemove={() => set('image_url', '')}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="des-title">Title *</label>
                <input id="des-title" type="text" className="form-input" value={form.title}
                  onChange={e => set('title', e.target.value)} placeholder="e.g. Happy Diwali Card" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="des-category">Design Category</label>
                <select id="des-category" className="form-select" value={form.category_id}
                  onChange={e => set('category_id', e.target.value)}>
                  <option value="">— No Category —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="des-content-category">Content Category</label>
              <select id="des-content-category" className="form-select" value={parentContentCatId}
                onChange={e => {
                  setParentContentCatId(e.target.value);
                  setSubContentCatId('');
                }}>
                <option value="">— None —</option>
                {allParents.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="form-hint">When set, this design also appears under that content category tab in the app (e.g. Important Dates)</span>
            </div>

            {parentContentCatId && getSubs(parentContentCatId).length > 0 && (
              <div className="form-group">
                <label className="form-label" htmlFor="des-content-subcategory">Content Sub Category</label>
                <select id="des-content-subcategory" className="form-select" value={subContentCatId}
                  onChange={e => setSubContentCatId(e.target.value)}>
                  <option value="">— Entire Category —</option>
                  {getSubs(parentContentCatId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span className="form-hint">Select a sub-category if you only want it to appear there.</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="des-desc">Description</label>
              <textarea id="des-desc" className="form-textarea" value={form.description}
                onChange={e => set('description', e.target.value)} placeholder="Brief description of this design…" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="des-tags">Tags</label>
                <input id="des-tags" type="text" className="form-input" value={form.tags}
                  onChange={e => set('tags', e.target.value)} placeholder="diwali, festival, card" />
                <span className="form-hint">Comma-separated tags</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="des-sort">Sort Order</label>
                <input id="des-sort" type="number" className="form-input" value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)} min={0} />
              </div>
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
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" id="des-save-btn" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner spinner-sm" /> Saving…</> : '💾 Save Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Design Card ──────────────────────────────────────────────────────── */
const DesignCard = ({ design, categories, onEdit, onDelete }) => {
  const cat = categories.find(c => String(c.id) === String(design.category_id));
  const imgSrc = design.image_url
    ? (design.image_url.startsWith('http') ? design.image_url : BASE + design.image_url)
    : null;

  return (
    <div className="design-card">
      {imgSrc ? (
        <img src={imgSrc} alt={design.title} className="design-card-img" />
      ) : (
        <div className="design-card-img-placeholder">🖼️</div>
      )}
      <div className="design-card-body">
        <div className="design-card-title" title={design.title}>{design.title}</div>
        <div className="design-card-meta">
          {cat && (
            <span className="badge badge-accent" style={{ fontSize: 10 }}>
              {cat.icon} {cat.name}
            </span>
          )}
          <span className={`badge ${design.is_active ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: 10 }}>
            {design.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="design-card-actions">
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onEdit(design)}>
            ✏️ Edit
          </button>
          <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => onDelete(design)}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────────── */
const DesignsPage = () => {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contentCategories, setContentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dData, cData, ccRes] = await Promise.all([
        api('/api/admin/designs/manage.php'),
        api('/api/admin/designs/categories.php'),
        fetch(BASE + '/api/categories/list.php?all=1'),
      ]);
      setDesigns(Array.isArray(dData.data?.designs) ? dData.data.designs : []);
      setCategories(Array.isArray(cData.data?.categories) ? cData.data.categories : []);
      const ccJson = await ccRes.json();
      setContentCategories(Array.isArray(ccJson.data?.categories) ? ccJson.data.categories : []);
    } catch (err) {
      toast.error('Failed to load: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (design) => {
    if (!window.confirm(`Delete design "${design.title}"?`)) return;
    setDeleting(design.id);
    try {
      await api(`/api/admin/designs/manage.php?id=${design.id}`, { method: 'DELETE' });
      toast.success('Design deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = () => { setModal(null); fetchAll(); };

  const filtered = designs.filter(d => {
    const matchesSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCat || String(d.category_id) === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">🎨 Designs</div>
          <div className="page-subtitle">
            {designs.length} design{designs.length !== 1 ? 's' : ''} total
          </div>
        </div>
        <button id="add-design-btn" className="btn btn-primary" onClick={() => setModal('add')}>
          ＋ Add Design
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="design-search"
            type="text"
            className="search-input"
            placeholder="Search designs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          id="design-cat-filter"
          className="form-select"
          style={{ width: 'auto', minWidth: 180 }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={String(c.id)}>{c.icon} {c.name}</option>
          ))}
        </select>
        {(search || filterCat) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterCat(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <span className="spinner-text">Loading designs…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎨</div>
          <div className="empty-state-title">{designs.length === 0 ? 'No designs yet' : 'No results found'}</div>
          <div className="empty-state-desc">
            {designs.length === 0
              ? 'Click "+ Add Design" to create your first design.'
              : 'Try adjusting your search or filter.'}
          </div>
        </div>
      ) : (
        <div className="design-grid">
          {filtered.map(d => (
            <DesignCard
              key={d.id}
              design={d}
              categories={categories}
              onEdit={des => setModal(des)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <DesignModal
          design={modal === 'add' ? null : modal}
          categories={categories}
          contentCategories={contentCategories}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default DesignsPage;
