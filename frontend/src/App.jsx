import React, { useState, useEffect } from 'react';
import './index.css';
import UploadForm from './components/UploadForm';
import Login from './components/Login';
import PaymentPage from './components/PaymentPage';
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
    if (item.downloadUrl) {
      window.open(`${API_BASE_URL}${item.downloadUrl}`, '_blank');
    } else {
      alert('Internal download link is missing.');
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
        <div className="logo" onClick={() => { setCurrentView('home'); setActiveCategory('All'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="" style={{ height: '35px', width: 'auto' }} />
          <span>KHMER DOWNLOAD</span>
        </div>
        <ul className="nav-links">
          <li className={`nav-item ${currentView === 'home' && activeCategory === 'All' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            <span>🏠</span> Home
          </li>

          {user && (
            <li className={`nav-item ${currentView === 'upload' ? 'active' : ''}`} onClick={() => { setCurrentView('upload'); setEditingItem(null); setIsSidebarOpen(false); }}>
              <span>📤</span> Upload (Admin)
            </li>
          )}

          <li className={`nav-item ${activeCategory === 'Programs' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('Programs'); setIsSidebarOpen(false); }}>
            <span>📦</span> Programs
          </li>
          <li className={`nav-item ${activeCategory === 'Games' ? 'active' : ''}`} onClick={() => { setCurrentView('home'); setActiveCategory('Games'); setIsSidebarOpen(false); }}>
            <span>🎮</span> Games
          </li>
          <li className={`nav-item ${currentView === 'tutorials' ? 'active' : ''}`} onClick={() => { setCurrentView('tutorials'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            <span>🎥</span> Tutorials
          </li>
          <li className={`nav-item ${currentView === 'contact' ? 'active' : ''}`} onClick={() => { setCurrentView('contact'); setActiveCategory('All'); setIsSidebarOpen(false); }}>
            <span>📞</span> Contact Us
          </li>
        </ul>

        {user && (
          <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logged in as:</p>
            <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{user.username}</p>
            <button
              onClick={handleLogout}
              style={{ background: 'transparent', border: '1px solid #ff7b72', color: '#ff7b72', width: '100%', padding: '0.5rem', borderRadius: '5px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <input
            type="text"
            className="search-bar"
            placeholder="Search for programs, games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="user-profile">
            {!user ? (
              <button className="btn-primary" style={{ padding: '0.5rem 1.5rem' }} onClick={() => setCurrentView('login')}>Login</button>
            ) : (
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>ADMIN PANEL</span>
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
                    <div key={app.id} className="program-card" style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: '900',
                        zIndex: 10,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                        background: app.isPaid
                          ? 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)'
                          : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                        color: app.isPaid ? '#000' : '#fff',
                        letterSpacing: '0.5px'
                      }}>
                        {app.isPaid ? `$${app.price}` : 'FREE'}
                      </div>

                      <div className="program-icon">
                        {app.iconUrl ? (
                          <img src={`${API_BASE_URL}${app.iconUrl}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                        ) : (app.icon || '📦')}
                      </div>
                      <div className="program-name">{app.title}</div>
                      <div className="program-meta">{app.category}</div>

                      {user && (
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
                          <button onClick={() => startEdit(app)} style={{ flex: 1, padding: '0.4rem', borderRadius: '5px', border: '1px solid #58a6ff', background: 'transparent', color: '#58a6ff', cursor: 'pointer', fontSize: '0.7rem' }}>Edit</button>
                          <button onClick={() => deleteItem('program', app.id)} style={{ flex: 1, padding: '0.4rem', borderRadius: '5px', border: '1px solid #ff7b72', background: 'transparent', color: '#ff7b72', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                        </div>
                      )}

                      <button
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1rem', background: app.isPaid ? '#f39c12' : '#238636', fontSize: '0.8rem', color: app.isPaid ? '#000' : '#fff', fontWeight: 'bold' }}
                        onClick={() => {
                          if (app.isPaid) {
                            handleBuyNow(app);
                          } else {
                            if (app.downloadUrl) window.open(`${API_BASE_URL}${app.downloadUrl}`, '_blank');
                          }
                        }}
                      >
                        {app.isPaid ? '💰 Buy Now' : '📥 Download Free'}
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
            <div className="programs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {videos.map(v => (
                <div key={v.id} className="program-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <div className="program-name" style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>{v.title}</div>

                  {user && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => startEdit(v)} style={{ flex: 1, padding: '0.4rem', borderRadius: '5px', border: '1px solid #58a6ff', background: 'transparent', color: '#58a6ff', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => deleteItem('video', v.id)} style={{ flex: 1, padding: '0.4rem', borderRadius: '5px', border: '1px solid #ff7b72', background: 'transparent', color: '#ff7b72', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  )}

                  <button
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={() => v.videoUrl && window.open(`${API_BASE_URL}${v.videoUrl}`, '_blank')}
                  >
                    ▶️ Play Now
                  </button>
                </div>
              ))}
            </div>
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
    </div>
  );
}

export default App;
