import React from 'react';

const Sidebar = ({ currentPage, setPage, userEmail, onLogout }) => {
  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'categories', icon: '🗂️', label: 'Categories' },
    { id: 'designs', icon: '🎨', label: 'Designs' },
  ];

  const initial = userEmail ? userEmail[0].toUpperCase() : 'D';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎨</div>
        <div className="sidebar-logo-text">
          <strong>Tapify</strong>
          <span>Designer Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {nav.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
            style={{ background: 'none', width: '100%', textAlign: 'left' }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userEmail || 'Designer'}</div>
            <div className="sidebar-user-role">Admin</div>
          </div>
        </div>
        <button className="btn btn-ghost w-full btn-sm" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
