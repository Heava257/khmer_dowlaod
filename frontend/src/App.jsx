import React, { useState, useEffect } from 'react';
import './index.css';
import Login from './components/Login';
import PaymentPage from './components/PaymentPage';
import UploadForm from './components/UploadForm';
import FeedbackForm from './components/FeedbackForm';
import AdminFeedbackList from './components/AdminFeedbackList';
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
  const [selectedItemForPayment, setSelectedItemForPayment] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      setPrograms(data.length > 0 ? data : [
        { id: 1, title: 'Adobe Photoshop', category: 'Programs', description: 'Professional image editing software.', icon: '🎨', isPaid: true, price: 10.99 },
        { id: 2, title: '4K Video Downloader', category: 'Programs', description: 'Download high-quality videos.', icon: '📥', isPaid: false },
        { id: 3, title: 'Grand Theft Auto V', category: 'Games', description: 'Action-adventure open world game.', icon: '🎮', isPaid: true, price: 29.99 },
      ]);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/videos`);
      const data = await response.json();
      setVideos(data.length > 0 ? data : [
        { id: 1, title: 'How to install Photoshop', description: 'Detailed guide for Adobe Photoshop installation.' },
        { id: 2, title: 'Best PC Settings for GTA V', description: 'Optimize your game performance with these settings.' },
      ]);
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
      const response = await fetch(`${API_BASE_URL}/api/${type}s/delete/${id}`, {
        method: 'POST',
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

  const handleBuyNow = (item) => {
    setSelectedItemForPayment(item);
    setCurrentView('payment');
  };

  const handleDownloadNow = (item) => {
    if (item.externalDownloadUrl) {
      window.open(item.externalDownloadUrl, '_blank');
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

  return (
    <div className="app-container">
      <button
        className="mobile-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✖️' : '☰'}
      </button>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo" onClick={() => { setCurrentView('home'); setActiveCategory('All'); }} style={{ cursor: 'pointer' }}>
          💎 KHMER DOWNLOAD
        </div>
        <ul className="nav-links">
          <li className={`nav-item ${currentView === 'home' && activeCategory === 'All' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            🏠 Home
          </li>

          {user && (
            <li className={`nav-item ${currentView === 'upload' ? 'active' : ''}`} onClick={() => { setCurrentView('upload'); setEditingItem(null); setIsSidebarOpen(false); }}>
              📤 Upload (Admin)
            </li>
          )}

          <li className={`nav-item ${activeCategory === 'Programs' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('Programs'); setIsSidebarOpen(false); }}>
            📦 Programs
          </li>
          <li className={`nav-item ${activeCategory === 'Games' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('Games'); setIsSidebarOpen(false); }}>
            🎮 Games
          </li>
          <li className={`nav-item ${currentView === 'tutorials' ? 'active' : ''}`} onClick={() => { setCurrentView('tutorials'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            🎥 Tutorials
          </li>
          <li className={`nav-item ${currentView === 'feedback' ? 'active' : ''}`} onClick={() => { setCurrentView('feedback'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            💬 Feedback
          </li>
          <li className={`nav-item ${currentView === 'contact' ? 'active' : ''}`} onClick={() => { setCurrentView('contact'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            📞 Contact Us
          </li>
        </ul>

        {user && (
          <div style={{ marginTop: 'auto', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Administrator</p>
            <p style={{ fontWeight: 'bold', marginBottom: '1.2rem', color: 'var(--accent-color)' }}>{user.username}</p>
            <button
              onClick={handleLogout}
              className="btn-primary"
              style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,123,114,0.1)', color: '#ff7b72', border: '1px solid rgba(255,123,114,0.2)', boxShadow: 'none' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search for software, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="user-profile">
            {!user ? (
              <button className="btn-primary" onClick={() => setCurrentView('login')}>Sign In</button>
            ) : (
              <span style={{ color: 'var(--accent-color)', fontWeight: '800', letterSpacing: '1px', background: 'rgba(0,163,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(0,163,255,0.2)' }}>ADMIN SECURE</span>
            )}
          </div>
        </header>

        {currentView === 'login' && <Login onLoginSuccess={(u) => { setUser(u); setCurrentView('home'); }} />}

        {currentView === 'payment' && selectedItemForPayment && (
          <PaymentPage
            item={selectedItemForPayment}
            onCancel={() => setCurrentView('home')}
            onPaymentSuccess={() => {
              alert('Payment Successful! Your download will start now.');
              setCurrentView('home');
              handleDownloadNow(selectedItemForPayment);
            }}
          />
        )}

        {currentView === 'home' && (
          <>
            <section className="featured-banner animate-fade-in">
              <div className="banner-content">
                <span style={{ color: '#58a6ff', fontWeight: 'bold', letterSpacing: '1px' }}>KHMER DOWNLOAD EXCLUSIVE</span>
                <h2>Premium Solutions</h2>
                <p>Welcome to Cambodia's leading platform for professional software and premium video tutorials.</p>
                <button className="btn-primary" onClick={() => setActiveCategory('Programs')}>Explore Software</button>
              </div>
              <div className="banner-image" style={{ marginLeft: 'auto', fontSize: '8rem' }}>
                💎
              </div>
            </section>

            <section className="apps-section">
              <h3 className="grid-title">🔥 {activeCategory === 'All' ? 'Popular Apps' : activeCategory}</h3>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="loader"></div>
                </div>
              ) : (
                <div className="programs-grid">
                  {filteredPrograms.map(app => (
                    <div key={app.id} className="program-card animate-fade-in" onClick={() => !user && (app.isPaid ? handleBuyNow(app) : handleDownloadNow(app))}>
                      <div className="price-tag">
                        {app.isPaid ? `$${app.price}` : 'FREE'}
                      </div>

                      <div className="program-icon">
                        {app.iconUrl ? (
                          <img src={app.iconUrl.startsWith('http') ? app.iconUrl : `${API_BASE_URL}${app.iconUrl}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} />
                        ) : (app.icon || '📦')}
                      </div>
                      <div className="program-name">{app.title}</div>
                      <div className="program-meta">{app.category}</div>

                      {user && (
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', width: '100%' }}>
                          <button onClick={(e) => { e.stopPropagation(); startEdit(app); }} style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--accent-color)', background: 'transparent', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteItem('program', app.id); }} style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: '1px solid #ff7b72', background: 'transparent', color: '#ff7b72', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                        </div>
                      )}

                      <button
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1.2rem', filter: app.isPaid ? 'none' : 'hue-rotate(140deg)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (app.isPaid) {
                            handleBuyNow(app);
                          } else {
                            handleDownloadNow(app);
                          }
                        }}
                      >
                        {app.isPaid ? '💎 Premium Get' : '🚀 Download'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {currentView === 'upload' && user && (
          <UploadForm
            editItem={editingItem}
            onCancel={() => { setEditingItem(null); setCurrentView('home'); }}
            onUploadSuccess={() => { setEditingItem(null); setCurrentView('home'); fetchPrograms(); fetchVideos(); }}
          />
        )}

        {currentView === 'tutorials' && (
          <section className="apps-section animate-fade-in">
            <h3 className="grid-title">🎥 All Video Tutorials</h3>
            <div className="programs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {videos.map(v => (
                <div key={v.id} className="program-card" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                  <div className="price-tag" style={{ background: '#ff0000' }}>
                    YOUTUBE
                  </div>
                  <div className="program-icon" style={{ height: '160px', width: '100%', borderRadius: '18px' }}>
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl.startsWith('http') ? v.thumbnailUrl : `${API_BASE_URL}${v.thumbnailUrl}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '4rem' }}>🎬</span>
                    )}
                  </div>
                  <div className="program-name" style={{ color: 'var(--accent-color)' }}>{v.title}</div>
                  <div className="program-meta" style={{ marginBottom: '1rem' }}>Official Guide</div>

                  {user && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
                      <button onClick={() => startEdit(v)} style={{ flex: 1, padding: '0.4rem', borderRadius: '10px', border: '1px solid var(--accent-color)', background: 'transparent', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                      <button onClick={() => deleteItem('video', v.id)} style={{ flex: 1, padding: '0.4rem', borderRadius: '10px', border: '1px solid #ff7b72', background: 'transparent', color: '#ff7b72', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    style={{ width: '100%', background: '#ff0000', filter: 'none' }}
                    onClick={() => {
                      if (v.externalVideoUrl) {
                        window.open(v.externalVideoUrl, '_blank');
                      } else if (v.videoUrl) {
                        window.open(`${API_BASE_URL}${v.videoUrl}`, '_blank');
                      }
                    }}
                  >
                    📺 Watch on YouTube
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentView === 'feedback' && (
          <section className="apps-section animate-fade-in" style={{ padding: '2rem 0' }}>
            <FeedbackForm />
          </section>
        )}

        {currentView === 'contact' && (
          <section className="apps-section animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 className="grid-title">📞 Get in Touch</h3>
            <div style={{ background: '#161b22', padding: '3rem', borderRadius: '24px', border: '1px solid #30363d' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#f1c40f', fontSize: '1.5rem', marginBottom: '0.5rem' }}>PONG CHIVA</h4>
                <p style={{ color: '#8b949e' }}>Official Tech Solutions Provider</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                <div>
                  <p style={{ fontWeight: 'bold', color: '#fff', margin: 0 }}>Telegram:</p>
                  <a href="https://t.me/pongchiva" target="_blank" rel="noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>@pongchiva</a>
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', color: '#fff', margin: 0 }}>Email Support:</p>
                  <p style={{ color: '#8b949e', margin: 0 }}>khmerdownload007@gmail.com</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer style={{ marginTop: '5rem', padding: '2rem', borderTop: '1px solid #30363d', textAlign: 'center', color: '#8b949e', fontSize: '0.85rem' }}>
          <p>&copy; 2026 Khmer Download. Registered Tech Services by PONG CHIVA.</p>
          <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <span onClick={() => alert('Terms and Conditions coming soon.')} style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span onClick={() => alert('Privacy Policy coming soon.')} style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span onClick={() => setCurrentView('contact')} style={{ cursor: 'pointer' }}>Support</span>
          </div>
        </footer>
      </main>
    </div >
  );
}

export default App;
