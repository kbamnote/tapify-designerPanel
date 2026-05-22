import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api';
import { useToast } from '../components/ToastProvider';
import BASE from '../api';

const ContentCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Modals state
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // Selected Category State
  const [selectedCat, setSelectedCat] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Add Content State
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentType, setContentType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [contentImage, setContentImage] = useState(null);
  const [addingContent, setAddingContent] = useState(false);

  const fileInputRef = useRef(null);
  const contentFileRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: Using the raw fetch since we are hitting the newly created endpoints 
      // (which may not use the exact same JSON format as the admin api() wrapper)
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
    if (!catName || !catImage) {
      return toast.error('Please provide a name and an image.');
    }
    
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', catName);
      formData.append('image', catImage);

      const res = await fetch(`${BASE}/api/categories/create.php`, {
        method: 'POST',
        body: formData,
      });
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

      const res = await fetch(`${BASE}/api/categories/content/add.php`, {
        method: 'POST',
        body: formData,
      });
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

      {/* ── Main View (Grid vs Selected) ── */}
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
                <div key={item.id} style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  {item.type !== 'text' && item.image_url && (
                    <img src={`${BASE}${item.image_url}`} style={{ width: '100%', borderRadius: 8, marginBottom: 12, maxHeight: 200, objectFit: 'cover' }} alt="Content" />
                  )}
                  {item.type !== 'image' && item.text_content && (
                    <p style={{ margin: 0, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{item.text_content}</p>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, textAlign: 'right' }}>
                    TYPE: {item.type.toUpperCase()}
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
                cursor: 'pointer'
              }}
            >
              <img 
                src={`${BASE}${cat.image_url}`} 
                alt={cat.name} 
                style={{ width: '100%', height: 200, objectFit: 'cover' }} 
              />
              <div style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: 16 }}>
                {cat.name}
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
    </div>
  );
};

export default ContentCategoriesPage;
