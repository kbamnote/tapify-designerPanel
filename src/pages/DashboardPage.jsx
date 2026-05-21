import React, { useEffect, useState } from 'react';
import { api } from '../api';

const DashboardPage = ({ userEmail }) => {
  const [catCount, setCatCount] = useState(null);
  const [designCount, setDesignCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [catData, designData] = await Promise.all([
          api('/api/admin/designs/categories.php'),
          api('/api/admin/designs/manage.php'),
        ]);
        setCatCount(Array.isArray(catData.data) ? catData.data.length : 0);
        setDesignCount(Array.isArray(designData.data) ? designData.data.length : 0);
      } catch {
        setCatCount('—');
        setDesignCount('—');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Categories',
      value: loading ? '…' : catCount,
      icon: '🗂️',
      iconClass: 'green',
      desc: 'Design categories',
    },
    {
      label: 'Total Designs',
      value: loading ? '…' : designCount,
      icon: '🎨',
      iconClass: 'blue',
      desc: 'Published designs',
    },
    {
      label: 'Platform',
      value: 'Tapify',
      icon: '📱',
      iconClass: 'purple',
      desc: 'Mobile app',
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Hero */}
      <div className="dashboard-hero">
        <span className="dashboard-hero-emoji">🎨</span>
        <div className="dashboard-hero-title">Welcome back, Designer!</div>
        <div className="dashboard-hero-desc">
          Manage your festival &amp; business design categories and designs that appear in the Tapify mobile app.
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
            <div className="stat-body">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 180,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'default',
          }}>
            <span style={{ fontSize: 24 }}>🗂️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Categories</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Manage design categories</div>
            </div>
          </div>
          <div style={{
            flex: 1, minWidth: 180,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'default',
          }}>
            <span style={{ fontSize: 24 }}>🎨</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Designs</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Add or edit designs</div>
            </div>
          </div>
          <div style={{
            flex: 1, minWidth: 180,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'default',
          }}>
            <span style={{ fontSize: 24 }}>📱</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Tapify App</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Changes reflect instantly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
