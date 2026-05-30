import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api';
import { useToast } from '../components/ToastProvider';
import BASE from '../api';

const ContentCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Add Category Modal
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState(null);
  const [creating, setCreating] = useState(false);

  // Edit Category Modal
  const [editCat, setEditCat] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  // Delete Category Confirm
  const [deleteCatTarget, setDeleteCatTarget] = useState(null);
  const [deletingCat, setDeletingCat] = useState(false);

  // Selected Category State
  const [selectedCat, setSelectedCat] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Add Content Modal
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentType, setContentType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [contentImage, setContentImage] = useState(null);
  const [addingContent, setAddingContent] = useState(false);

  // Edit Content Modal
  const [editContent, setEditContent] = useState(null);
  const [editContentType, setEditContentType] = useState('text');
  const [editTextContent, setEditTextContent] = useState('');
  const [editContentImage, setEditContentImage] = useState(null);
  const [savingContent, setSavingContent] = useState(false);

  // Delete Content Confirm
  const [deleteContentTarget, setDeleteContentTarget] = useState(null);
  const [deletingContent, setDeletingContent] = useState(false);

  const fileInputRef = useRef(null);
  const editCatFileRef = useRef(null);
  const contentFileRef = useRef(null);
  const editContentFileRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/categories/list.php`);
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data.categories || []);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName || !catImage) return toast.error('Please provide a name and an image.');
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', catName);
      formData.append('image', catImage);
      const res = await fetch(`${BASE}/api/categories/create.php`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Category created!');
        setShowAddCat(false);
        setCatName('');
        setCatImage(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to create category');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setCreating(false);
    }
  };

  const openEditCat = (e, cat) => {
    e.stopPropagation();
    setEditCat(cat);
    setEditCatName(cat.name);
    setEditCatImage(null);
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editCatName) return toast.error('Category name is required.');
    setSavingCat(true);
    try {
      const formData = new FormData();
      formData.append('id', editCat.id);
      formData.append('name', editCatName);
      if (editCatImage) formData.append('image', editCatImage);
      const res = await fetch(`${BASE}/api/categories/edit.php`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Category updated!');
        setEditCat(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to update category');
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async () => {
    setDeletingCat(true);
    try {
      const formData = new FormData();
      formData.append('id', deleteCatTarget.id);
      const res = await fetch(`${BASE}/api/categories/delete.php`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Category deleted!');
        setDeleteCatTarget(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeletingCat(false);
    }
  };

  const loadContent = async (catId) => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${BASE}/api/categories/content/list.php?category_id=${catId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContentList(data.data.content || []);
      }
    } catch (err) {
      toast.error('Failed to load content');
    } finally {
      setLoadingContent(false);
    }
  };

  const openCategory = (cat) => {
    setSelectedCat(cat);
    loadContent(cat.id);
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (contentType === 'text' && !textContent) return toast.error('Text is required');
    if (contentType === 'image' && !contentImage) return toast.error('Image is required');
    if (contentType === 'mixed' && (!textContent || !contentImage)) return toast.error('Text and Image are required');
    setAddingContent(true);
    try {
      const formData = new FormData();
      formData.append('category_id', selectedCat.id);
      formData.append('type', contentType);
      if (textContent) formData.append('text_content', textContent);
      if (contentImage) formData.append('image', contentImage);
      const res = await fetch(`${BASE}/api/categories/content/add.php`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Content added!');
        setShowAddContent(false);
        setTextContent('');
        setContentImage(null);
        loadContent(selectedCat.id);
      } else {
        toast.error(data.message || 'Failed to add content');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setAddingContent(false);
    }
  };

  const openEditContent = (item) => {
    setEditContent(item);
    setEditContentType(item.type);
    setEditTextContent(item.text_content || '');
    setEditContentImage(null);
  };

  const handleEditContent = async (e) => {
    e.preventDefault();
    if (editContentType === 'text' && !editTextContent) return toast.error('Text is required');
    if (editContentType === 'image' && !editContentImage && !editContent.image_url) return toast.error('Image is required');
    if (editContentType === 'mixed' && !editTextContent) return toast.error('Text is required');
    setSavingContent(true);
    try {
      const formData = new FormData();
      formData.append('id', editContent.id);
      formData.append('type', editContentType);
      if (editTextContent) formData.append('text_content', editTextContent);
      if (editContentImage) formData.append('image', editContentImage);
      const res = await fetch(`${BASE}/api/categories/content/edit.php`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Content updated!');
        setEditContent(null);
        loadContent(selectedCat.id);
      } else {
        toast.error(data.message || 'Failed to update content');
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteContent = async () => {
    setDeletingContent(true);
    try {
      const formData = new FormData();
      formData.append('id', deleteContentTarget.id);
      const res = await fetch(`${BASE}/api/categories/content/delete.php`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Content deleted!');
        setDeleteContentTarget(null);
        loadContent(selectedCat.id);
      } else {
        toast.error(data.message || 'Failed to delete content');
      }
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeletingContent(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">🗂️ Content Categories</div>
          <div className="page-subtitle">Manage categories for Quotes, Status, Motivation, etc.</div>
        </div>
        {!selectedCat && (
          <button className="btn btn-primary" onClick={() => setShowAddCat(true)}>
            ＋ Add Category
          </button>
        )}
      </div>

      {/* ── Main View ── */}
      {selectedCat ? (
        <div>
          <button className="btn btn-ghost mb-4" onClick={() => setSelectedCat(null)}>← Back to Categories</button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selectedCat.name} Content</h2>
            <button className="btn btn-primary" onClick={() => setShowAddContent(true)}>＋ Add Content</button>
          </div>

          {loadingContent ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : contentList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No content yet</div>
              <div className="empty-state-desc">Add some text or images to this category.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {contentList.map(item => (
                <div key={item.id} style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', position: 'relative' }}>
                  {item.type !== 'text' && item.image_url && (
                    <img src={`${BASE}${item.image_url}`} style={{ width: '100%', borderRadius: 8, marginBottom: 12, maxHeight: 200, objectFit: 'cover' }} alt="Content" />
                  )}
                  {item.type !== 'image' && item.text_content && (
                    <p style={{ margin: 0, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{item.text_content}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>TYPE: {item.type.toUpperCase()}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEditContent(item)}
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => setDeleteContentTarget(item)}
                        style={{ fontSize: 12, padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span className="spinner-text">Loading…</span></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">No categories yet</div>
          <div className="empty-state-desc">Click "+ Add Category" to create your first one.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '8px 0' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => openCategory(cat)}
              style={{
                width: 200,
                background: 'var(--surface)',
                borderRadius: 16,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img
                src={`${BASE}${cat.image_url}`}
                alt={cat.name}
                style={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
              <div style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 16 }}>
                {cat.name}
              </div>
              <div
                style={{ display: 'flex', gap: 6, padding: '0 12px 12px', justifyContent: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => openEditCat(e, cat)}
                  style={{ fontSize: 12, flex: 1 }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm"
                  onClick={(e) => { e.stopPropagation(); setDeleteCatTarget(cat); }}
                  style={{ fontSize: 12, flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {showAddCat && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddCat(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">➕ New Content Category</span>
              <button className="modal-close" onClick={() => setShowAddCat(false)}>×</button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  {catImage ? (
                    <img src={URL.createObjectURL(catImage)} alt="Preview" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{ width: 150, height: 150, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', cursor: 'pointer', marginBottom: 10 }}
                    >
                      📷 Select Image
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => setCatImage(e.target.files[0])} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Choose File</button>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category Name</label>
                  <input type="text" className="form-input" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Quotes" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddCat(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Saving...' : '💾 Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Category Modal ── */}
      {editCat && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditCat(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Category</span>
              <button className="modal-close" onClick={() => setEditCat(null)}>×</button>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  {editCatImage ? (
                    <img src={URL.createObjectURL(editCatImage)} alt="Preview" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />
                  ) : (
                    <img src={`${BASE}${editCat.image_url}`} alt="Current" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />
                  )}
                  <input type="file" ref={editCatFileRef} accept="image/*" style={{ display: 'none' }} onChange={e => setEditCatImage(e.target.files[0])} />
                  <br />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => editCatFileRef.current?.click()}>Change Image</button>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category Name</label>
                  <input type="text" className="form-input" value={editCatName} onChange={e => setEditCatName(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditCat(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingCat}>
                  {savingCat ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Category Confirm ── */}
      {deleteCatTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteCatTarget(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">🗑️ Delete Category</span>
              <button className="modal-close" onClick={() => setDeleteCatTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text)' }}>
                Are you sure you want to delete <strong>{deleteCatTarget.name}</strong>? This will also delete all content inside it.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteCatTarget(null)}>Cancel</button>
              <button
                className="btn"
                onClick={handleDeleteCategory}
                disabled={deletingCat}
                style={{ background: '#dc2626', color: '#fff', border: 'none' }}
              >
                {deletingCat ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Content Modal ── */}
      {showAddContent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddContent(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">➕ Add Content to {selectedCat?.name}</span>
              <button className="modal-close" onClick={() => setShowAddContent(false)}>×</button>
            </div>
            <form onSubmit={handleAddContent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Content Type</label>
                  <select className="form-input" value={contentType} onChange={e => setContentType(e.target.value)}>
                    <option value="text">Text Only</option>
                    <option value="image">Image Only</option>
                    <option value="mixed">Text + Image</option>
                  </select>
                </div>
                {(contentType === 'image' || contentType === 'mixed') && (
                  <div style={{ textAlign: 'center' }}>
                    {contentImage ? (
                      <img src={URL.createObjectURL(contentImage)} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 10, background: '#f3f4f6' }} />
                    ) : (
                      <div
                        onClick={() => contentFileRef.current?.click()}
                        style={{ width: '100%', height: 150, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 10, background: '#fafafa' }}
                      >
                        📷 Select Content Image
                      </div>
                    )}
                    <input type="file" ref={contentFileRef} accept="image/*" style={{ display: 'none' }} onChange={e => setContentImage(e.target.files[0])} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => contentFileRef.current?.click()}>Choose Image File</button>
                  </div>
                )}
                {(contentType === 'text' || contentType === 'mixed') && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Text Content</label>
                    <textarea
                      className="form-input"
                      rows="4"
                      value={textContent}
                      onChange={e => setTextContent(e.target.value)}
                      placeholder="Enter the quote or message..."
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddContent(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingContent}>
                  {addingContent ? 'Uploading...' : '📤 Upload Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Content Modal ── */}
      {editContent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditContent(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Content</span>
              <button className="modal-close" onClick={() => setEditContent(null)}>×</button>
            </div>
            <form onSubmit={handleEditContent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Content Type</label>
                  <select className="form-input" value={editContentType} onChange={e => setEditContentType(e.target.value)}>
                    <option value="text">Text Only</option>
                    <option value="image">Image Only</option>
                    <option value="mixed">Text + Image</option>
                  </select>
                </div>
                {(editContentType === 'image' || editContentType === 'mixed') && (
                  <div style={{ textAlign: 'center' }}>
                    {editContentImage ? (
                      <img src={URL.createObjectURL(editContentImage)} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 10, background: '#f3f4f6' }} />
                    ) : editContent.image_url ? (
                      <img src={`${BASE}${editContent.image_url}`} alt="Current" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 10, background: '#f3f4f6' }} />
                    ) : (
                      <div
                        onClick={() => editContentFileRef.current?.click()}
                        style={{ width: '100%', height: 150, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 10, background: '#fafafa' }}
                      >
                        📷 Select Content Image
                      </div>
                    )}
                    <input type="file" ref={editContentFileRef} accept="image/*" style={{ display: 'none' }} onChange={e => setEditContentImage(e.target.files[0])} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => editContentFileRef.current?.click()}>Change Image</button>
                  </div>
                )}
                {(editContentType === 'text' || editContentType === 'mixed') && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Text Content</label>
                    <textarea
                      className="form-input"
                      rows="4"
                      value={editTextContent}
                      onChange={e => setEditTextContent(e.target.value)}
                      placeholder="Enter the quote or message..."
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditContent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingContent}>
                  {savingContent ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Content Confirm ── */}
      {deleteContentTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteContentTarget(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">🗑️ Delete Content</span>
              <button className="modal-close" onClick={() => setDeleteContentTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text)' }}>
                Are you sure you want to delete this content item? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteContentTarget(null)}>Cancel</button>
              <button
                className="btn"
                onClick={handleDeleteContent}
                disabled={deletingContent}
                style={{ background: '#dc2626', color: '#fff', border: 'none' }}
              >
                {deletingContent ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCategoriesPage;
