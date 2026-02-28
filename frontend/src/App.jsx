import React, { useState, useEffect } from 'react';
import './index.css';
import PaymentPage from './components/PaymentPage';
import UploadForm from './components/UploadForm';
import FeedbackForm from './components/FeedbackForm';
import AuthModal from './components/AuthModal';
import ProductDetail from './components/ProductDetail';
import Login from './components/Login';
import { API_BASE_URL } from './config';

function App() {
  const [programs, setPrograms] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPrograms(), fetchVideos()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/programs`);
      const data = await response.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos`);
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('home');
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/${type}s/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Deleted successfully');
        fetchPrograms();
        fetchVideos();
      }
    } catch (error) {
      alert('Delete failed');
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setCurrentView('upload');
  };

  const handleOpenDetail = (item) => {
    setSelectedProduct(item);
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  const handleBuyProcess = (item) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setSelectedProduct(item);
      setCurrentView('payment');
    }
  };

  const handleDownloadNow = (item) => {
    if (item.externalDownloadUrl || item.link) {
      window.open(item.externalDownloadUrl || item.link, '_blank');
    } else if (item.downloadUrl) {
      window.open(`${API_BASE_URL}${item.downloadUrl}`, '_blank');
    } else {
      alert('Download link is missing.');
    }
  };

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-container">
      {/* Mobile Sidebar Toggle */}
      <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✖' : '☰'}
      </button>

      {/* Modern Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo" onClick={() => { setCurrentView('home'); setActiveCategory('All'); }} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1.8rem' }}>💎</span> Khmer Download
        </div>

        <div className="nav-section-title">Discovery</div>
        <ul className="nav-links">
          <li className={`nav-item ${currentView === 'home' && activeCategory === 'All' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            🏠 Home
          </li>
          <li className={`nav-item ${activeCategory === 'Programs' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('Programs'); setIsSidebarOpen(false); }}>
            📦 Programs
          </li>
          <li className={`nav-item ${activeCategory === 'Games' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('Games'); setIsSidebarOpen(false); }}>
            🎮 Games
          </li>
          <li className={`nav-item ${currentView === 'tutorials' ? 'active' : ''}`} onClick={() => { setCurrentView('tutorials'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            🎥 Tutorials
          </li>
        </ul>

        <div className="nav-section-title">Community</div>
        <ul className="nav-links">
          <li className={`nav-item ${currentView === 'feedback' ? 'active' : ''}`} onClick={() => { setCurrentView('feedback'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            💬 Feedback
          </li>
          <li className={`nav-item ${currentView === 'contact' ? 'active' : ''}`} onClick={() => { setCurrentView('contact'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            📞 Contact Us
          </li>
        </ul>

        {isAdmin && (
          <>
            <div className="nav-section-title">Administration</div>
            <ul className="nav-links">
              <li className={`nav-item ${currentView === 'upload' ? 'active' : ''}`} onClick={() => { setCurrentView('upload'); setEditingItem(null); setIsSidebarOpen(false); }}>
                📤 New Program/Update
              </li>
            </ul>
          </>
        )}

        {user && (
          <div style={{ marginTop: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{user.role}</p>
            <p style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1d1d1f' }}>{user.username}</p>
            <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>Sign Out</button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-wrapper">
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#86868b' }}>🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search apps, tutorials, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="user-profile">
            {!user ? (
              <button className="btn-primary" onClick={() => setShowAuthModal(true)}>Sign In</button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 800, color: '#007aff', background: '#eef6ff', padding: '5px 15px', borderRadius: '10px', fontSize: '0.85rem' }}>
                  {user.role === 'admin' ? 'SECURE ADMIN' : 'PREMIUM USER'}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="page-container">
          {currentView === 'home' && (
            <>
              <section className="hero-banner animate-fade-in">
                <div className="hero-content">
                  <h1>Premium Tech Solutions</h1>
                  <p>Explore professional software and high-quality tutorials curated by the Khmer Download community.</p>
                  <button className="buy-btn" onClick={() => setActiveCategory('Programs')} style={{ width: 'auto', padding: '0.8rem 2rem', marginTop: '1.5rem' }}>Browse All Programs</button>
                </div>
              </section>

              <div className="section-header">
                <h2 className="section-title">🔥 {activeCategory === 'All' ? 'Latest Discoveries' : activeCategory}</h2>
                <span style={{ color: '#007aff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>View all</span>
              </div>

              {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}><div className="loader"></div></div>
              ) : (
                <div className="app-grid">
                  {filteredPrograms.map(app => (
                    <div key={app.id} className="app-card animate-fade-in" onClick={() => handleOpenDetail(app)}>
                      <div className="card-price">{app.isPaid ? `$${app.price}` : 'FREE'}</div>
                      <div style={{ padding: '0.5rem', background: '#f2f2f7', borderRadius: '14px', width: 'fit-content', marginBottom: '1rem' }}>
                        {app.iconUrl ? (
                          <img
                            src={app.iconUrl.startsWith('http') ? app.iconUrl : `${API_BASE_URL}${app.iconUrl}`}
                            className="app-card-icon"
                            style={{ margin: 0 }}
                          />
                        ) : (
                          <div className="app-card-icon" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            {app.icon || '📦'}
                          </div>
                        )}
                      </div>
                      <h3 className="app-card-title">{app.title}</h3>
                      <p className="app-card-desc">{app.description}</p>

                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); startEdit(app); }} style={{ flex: 1, padding: '0.4rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteItem('program', app.id); }} style={{ flex: 1, padding: '0.4rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', color: '#ff3b30', fontSize: '0.75rem', cursor: 'pointer' }}>Del</button>
                        </div>
                      )}

                      <div className="app-card-stats">
                        <span>⭐ 4.9</span>
                        <span>•</span>
                        <span>9.5 GB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'detail' && selectedProduct && (
            <ProductDetail
              item={selectedProduct}
              onBack={() => setCurrentView('home')}
              onBuy={() => handleBuyProcess(selectedProduct)}
              isAdmin={isAdmin}
            />
          )}

          {currentView === 'payment' && selectedProduct && (
            <PaymentPage
              item={selectedProduct}
              onCancel={() => setCurrentView('detail')}
              onPaymentSuccess={() => {
                alert('Success! Code: 1234. Usage: Input at Download section.');
                setCurrentView('detail');
                handleDownloadNow(selectedProduct);
              }}
            />
          )}

          {currentView === 'tutorials' && (
            <section className="animate-fade-in">
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>🎥 Premium Tutorials</h2>
              <div className="app-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {videos.map(v => (
                  <div key={v.id} className="app-card" onClick={() => window.open(v.externalVideoUrl || v.videoUrl, '_blank')}>
                    <div style={{ background: '#f2f2f7', borderRadius: '14px', width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: '1rem' }}>
                      {v.thumbnailUrl ? (
                        <img src={v.thumbnailUrl.startsWith('http') ? v.thumbnailUrl : `${API_BASE_URL}${v.thumbnailUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎬</div>
                      )}
                    </div>
                    <h3 className="app-card-title" style={{ color: '#007aff' }}>{v.title}</h3>
                    <p className="app-card-desc">{v.description}</p>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(v); }} style={{ flex: 1, padding: '0.4rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem('video', v.id); }} style={{ flex: 1, padding: '0.4rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', color: '#ff3b30', fontSize: '0.75rem', cursor: 'pointer' }}>Del</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentView === 'feedback' && <FeedbackForm />}

          {currentView === 'contact' && (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📞</div>
              <h2 className="section-title">Support & Contact</h2>
              <p style={{ color: '#6e6e73', maxWidth: '500px', margin: '1.5rem auto 3rem' }}>
                Our team is always ready to help you with software installations or any technical queries.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <a href="https://t.me/pongchiva" target="_blank" className="buy-btn" style={{ width: 'auto', padding: '1rem 3rem', background: '#24A1DE' }}>Telegram Support</a>
              </div>
            </div>
          )}

          {currentView === 'login' && <Login onLoginSuccess={(u) => { setUser(u); setCurrentView('home'); }} />}

          {currentView === 'upload' && isAdmin && (
            <UploadForm
              editItem={editingItem}
              onCancel={() => { setEditingItem(null); setCurrentView('home'); }}
              onUploadSuccess={() => { setEditingItem(null); setCurrentView('home'); fetchPrograms(); fetchVideos(); }}
            />
          )}

          <footer style={{ marginTop: '5rem', padding: '3rem 0', borderTop: '1px solid #eee', color: '#86868b', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>&copy; 2026 Khmer Download. Official Tech by PONG CHIVA.</p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <span>Terms</span>
                <span>Privacy</span>
                <span onClick={() => setCurrentView('contact')} style={{ cursor: 'pointer', color: '#007aff' }}>Contact</span>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(u) => { setUser(u); }}
          onSwitchToAdmin={() => { setShowAuthModal(false); setCurrentView('login'); }}
        />
      )}
    </div>
  );
}

export default App;
