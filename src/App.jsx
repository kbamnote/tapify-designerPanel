import React, { useState } from 'react';
import { ToastProvider } from './components/ToastProvider';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import ContentCategoriesPage from './pages/ContentCategoriesPage';
import DesignsPage from './pages/DesignsPage';

/* ── Page titles ────────────────────────────────────────────────────── */
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  categories: 'Design Categories',
  'content-categories': 'Content Categories',
  designs: 'Designs',
};

/* ── Layout ─────────────────────────────────────────────────────────── */
const Layout = ({ page, setPage, userEmail, onLogout }) => {
  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <DashboardPage userEmail={userEmail} />;
      case 'categories': return <CategoriesPage />;
      case 'content-categories': return <ContentCategoriesPage />;
      case 'designs':    return <DesignsPage />;
      default:           return <DashboardPage userEmail={userEmail} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={page}
        setPage={setPage}
        userEmail={userEmail}
        onLogout={onLogout}
      />
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-title">
            <span>Tapify</span> Designer Panel
            <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>
              / {PAGE_TITLES[page] || page}
            </span>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{userEmail}</span>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

/* ── App Root ────────────────────────────────────────────────────────── */
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      // Attempt server-side logout (ignore errors)
      await fetch('https://tapify-backend-production.up.railway.app/api/logout.php', {
        method: 'POST',
        credentials: 'include',
      });
    } catch { /* ignore */ }
    setIsLoggedIn(false);
    setUserEmail('');
    setCurrentPage('dashboard');
  };

  return (
    <ToastProvider>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Layout
          page={currentPage}
          setPage={setCurrentPage}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      )}
    </ToastProvider>
  );
};

export default App;
