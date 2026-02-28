import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function ProductDetail({ item, onBack, onBuy, isAdmin }) {
    const [activeTab, setActiveTab] = useState('description');

    const imageUrl = item.imageUrl?.startsWith('http')
        ? item.imageUrl
        : (item.imageUrl ? `${API_BASE_URL}${item.imageUrl}` : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop');

    const iconUrl = item.iconUrl?.startsWith('http')
        ? item.iconUrl
        : (item.iconUrl ? `${API_BASE_URL}${item.iconUrl}` : null);

    return (
        <div className="animate-fade-in" style={{ padding: '3.5rem' }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6e73', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
                <span onClick={onBack} style={{ cursor: 'pointer', hover: { color: '#007aff' } }}>Home</span>
                <span>/</span>
                <span style={{ color: '#1d1d1f', fontWeight: 'bold' }}>{item.title}</span>
            </div>

            <div className="detail-container">
                <div className="detail-main">
                    {/* Hero Banner Style */}
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#f2f2f7', marginBottom: '3rem', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
                        <img
                            src={imageUrl}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            alt={item.title}
                        />
                    </div>

                    <div className="detail-header">
                        <div className="detail-icon" style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '1px solid #eee' }}>
                            {iconUrl ? (
                                <img src={iconUrl} style={{ width: '100%', height: '100%', borderRadius: '28px' }} />
                            ) : (item.icon || '📦')}
                        </div>
                        <div className="detail-info">
                            <h1>{item.title}</h1>
                            <p>{item.category} • Professional Tool</p>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '1.2rem' }}>
                                <span style={{ padding: '4px 12px', borderRadius: '100px', background: '#f2f2f7', fontSize: '0.75rem', fontWeight: 'bold', color: '#1d1d1f' }}>v2024.1.0</span>
                                <span style={{ padding: '4px 12px', borderRadius: '100px', background: '#f2f2f7', fontSize: '0.75rem', fontWeight: 'bold', color: '#1d1d1f' }}>Windows/Mac</span>
                                <span style={{ padding: '4px 12px', borderRadius: '100px', background: '#34c7591a', fontSize: '0.75rem', fontWeight: 'bold', color: '#34c759' }}>Secure Check</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs View */}
                    <div style={{ borderBottom: '1px solid #eee', display: 'flex', gap: '2.5rem', marginBottom: '2.5rem' }}>
                        {['Description', 'Installation Guide', 'Version History'].map(tab => (
                            <div
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                                style={{
                                    paddingBottom: '1rem',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    color: activeTab === tab.toLowerCase().replace(' ', '-') ? '#007aff' : '#6e6e73',
                                    borderBottom: activeTab === tab.toLowerCase().replace(' ', '-') ? '2px solid #007aff' : 'none'
                                }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    <div style={{ minHeight: '300px', fontSize: '1rem', lineHeight: '1.8', color: '#424245' }}>
                        {activeTab === 'description' && (
                            <div className="animate-fade-in">
                                <p style={{ whiteSpace: 'pre-wrap' }}>{item.description || 'No description available for this item.'}</p>
                                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ background: '#f9f9fb', padding: '1.5rem', borderRadius: '16px' }}>
                                        <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Minimum Specs</h4>
                                        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                                            <li>OS: Windows 10/11 64-bit</li>
                                            <li>RAM: 8GB (16GB Recommended)</li>
                                            <li>GPU: 2GB VRAM Minimum</li>
                                        </ul>
                                    </div>
                                    <div style={{ background: '#f9f9fb', padding: '1.5rem', borderRadius: '16px' }}>
                                        <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Support</h4>
                                        <p style={{ fontSize: '0.9rem' }}>If you face any issues, feel free to contact us via the feedback or Telegram channel.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'installation-guide' && (
                            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f5f5f7', borderRadius: '24px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔒</div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.8rem' }}>Installation Guide Locked</h3>
                                <p style={{ color: '#86868b', maxWidth: '400px', margin: '0 auto 2rem' }}>Please purchase this item to unlock the step-by-step video installation guide.</p>
                                {!isAdmin && <button onClick={onBuy} className="buy-btn" style={{ maxWidth: '250px' }}>Unlock Now</button>}
                            </div>
                        )}

                        {activeTab === 'version-history' && (
                            <div className="animate-fade-in">
                                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>v2024.1.0 (Latest)</span>
                                    <span style={{ color: '#86868b' }}>February 2026</span>
                                </div>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                                    <span style={{ fontWeight: 'bold' }}>v2023.4.0</span>
                                    <span style={{ color: '#86868b' }}>November 2025</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside>
                    <div className="buy-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#6e6e73', fontWeight: 'bold' }}>LICENSE & ACCESS</span>
                            <span style={{ color: '#34c759', fontSize: '0.8rem', fontWeight: 'bold' }}>● LATEST VERSION</span>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#6e6e73' }}>Full Version</span>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0' }}>
                                {item.isPaid ? (
                                    <span style={{ display: 'flex', gap: '5px', alignItems: 'baseline' }}>
                                        <span style={{ fontSize: '1.2rem' }}>$</span>{item.price}
                                    </span>
                                ) : (
                                    <span style={{ color: '#34c759' }}>FREE</span>
                                )}
                            </div>
                        </div>

                        {item.isPaid ? (
                            <button className="buy-btn" onClick={onBuy}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span>{isAdmin ? 'Download Now (Admin)' : 'Buy Now'}</span>
                                    {!isAdmin && <i style={{ fontSize: '1rem' }} className="fas fa-shopping-cart"></i>}
                                </div>
                            </button>
                        ) : (
                            <button className="buy-btn" style={{ background: '#1d1d1f' }} onClick={() => window.open(item.link || item.videoUrl)}>
                                Download Now
                            </button>
                        )}

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', fontSize: '0.9rem', color: '#1d1d1f' }}>
                                <span style={{ width: '24px', textAlign: 'center' }}>⚡</span>
                                <span>Lifetime License</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', fontSize: '0.9rem', color: '#1d1d1f' }}>
                                <span style={{ width: '24px', textAlign: 'center' }}>🎥</span>
                                <span>Installation Video</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#1d1d1f' }}>
                                <span style={{ width: '24px', textAlign: 'center' }}>🛠</span>
                                <span>TeamViewer Support</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '18px', color: '#0369a1' }}>
                        <div style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Have questions?</div>
                        <p style={{ fontSize: '0.85rem' }}>Our support team is active on Telegram 24/7 to help you with the installation.</p>
                        <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #0369a1', background: 'transparent', color: '#0369a1', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            Chat with us
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default ProductDetail;
