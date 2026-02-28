import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function FeedbackForm() {
    // Form fields for main post or reply
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    // Lists and view state
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null); // ID of feedback being replied to
    const [replyMessage, setReplyMessage] = useState('');

    // Admin state
    const [adminReplyText, setAdminReplyText] = useState({});
    const [showAdminReplyForm, setShowAdminReplyForm] = useState({});

    const isAdmin = !!localStorage.getItem('token');

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, { headers });
            const data = await response.json();
            // Invert the order so latest main post is at top, but replies underneath.
            // Since backend is oldest-first for chains, we'll sort carefully.
            setFeedbacks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch Feedbacks Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Handle initial feedback post (Main post)
    const handleSubmitMain = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact, message, parentId: null })
            });

            if (response.ok) {
                alert('មតិយោបល់របស់អ្នកត្រូវបានផ្ញើ!');
                setName('');
                setContact('');
                setMessage('');
                fetchFeedbacks();
            }
        } catch (error) {
            console.error('Feedback Error:', error);
        } finally {
            setSending(false);
        }
    };

    // Handle user-to-user reply
    const handleUserReply = async (parentId) => {
        if (!replyMessage.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Community User', // Or prompt for name? For simplicity, we can just use "User"
                    contact: 'N/A',
                    message: replyMessage,
                    parentId: parentId
                })
            });

            if (response.ok) {
                setReplyMessage('');
                setReplyingTo(null);
                fetchFeedbacks();
            }
        } catch (error) {
            console.error('Reply Error:', error);
        }
    };

    // React to a feedback
    const handleReact = async (id, type) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/react/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            if (response.ok) fetchFeedbacks();
        } catch (error) {
            console.error('Reaction Error:', error);
        }
    };

    const handleAdminReply = async (id) => {
        if (!adminReplyText[id]) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/reply/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminReply: adminReplyText[id] })
            });

            if (response.ok) {
                setAdminReplyText({ ...adminReplyText, [id]: '' });
                setShowAdminReplyForm({ ...showAdminReplyForm, [id]: false });
                fetchFeedbacks();
            }
        } catch (error) {
            console.error('Admin Reply Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchFeedbacks();
        } catch (error) {
            console.error('Delete Error:', error);
        }
    };

    const renderFeedbackItem = (fb, isReply = false) => {
        // Find if this post has replies
        const children = feedbacks.filter(child => child.parentId === fb.id);

        return (
            <div
                key={fb.id}
                className="feedback-card"
                style={{
                    padding: '1.2rem',
                    borderRadius: '20px',
                    background: isReply ? 'rgba(255,255,255,0.02)' : 'var(--sidebar-bg)',
                    marginBottom: '1rem',
                    marginLeft: isReply ? '2rem' : '0',
                    borderLeft: isReply ? '3px solid var(--accent-color)' : '1px solid var(--glass-border)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <div className="user-avatar-gradient" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {fb.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{fb.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                                {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                <p style={{ color: '#e5e7eb', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{fb.message}</p>

                {/* Reactions & Actions Row */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                    <button
                        onClick={() => handleReact(fb.id, 'like')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        👍 <span style={{ color: fb.likes > 0 ? 'var(--accent-color)' : 'inherit' }}>{fb.likes || 0}</span>
                    </button>
                    <button
                        onClick={() => handleReact(fb.id, 'love')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        ❤️ <span style={{ color: fb.loves > 0 ? '#ff4f4f' : 'inherit' }}>{fb.loves || 0}</span>
                    </button>
                    <button
                        onClick={() => setReplyingTo(replyingTo === fb.id ? null : fb.id)}
                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                        Reply
                    </button>
                    {isAdmin && (
                        <>
                            <button onClick={() => setShowAdminReplyForm({ ...showAdminReplyForm, [fb.id]: true })} style={{ background: 'transparent', border: 'none', color: '#f1c40f', cursor: 'pointer', fontSize: '0.85rem' }}>Admin Reply</button>
                            <button onClick={() => handleDelete(fb.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>Del</button>
                        </>
                    )}
                </div>

                {/* User Reply Input */}
                {replyingTo === fb.id && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="មតិយោបល់របស់អ្នក..."
                            style={{ flex: 1, height: '40px', borderRadius: '10px', fontSize: '0.9rem' }}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <button onClick={() => handleUserReply(fb.id)} className="btn-primary" style={{ padding: '0 1rem', height: '40px', fontSize: '0.8rem' }}>Send</button>
                    </div>
                )}

                {/* Admin Official Reply */}
                {fb.adminReply && (
                    <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0, 163, 255, 0.05)', borderRadius: '12px', borderLeft: '3px solid var(--accent-color)' }}>
                        <span className="admin-reply-badge" style={{ marginBottom: '0.5rem' }}>ADMIN OFFICIAL REPLY 💎</span>
                        <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>{fb.adminReply}</p>
                    </div>
                )}

                {/* Admin Reply Form */}
                {showAdminReplyForm[fb.id] && (
                    <div style={{ marginTop: '1rem' }}>
                        <textarea
                            className="search-bar"
                            placeholder="Admin Official Message..."
                            style={{ width: '100%', height: '60px', borderRadius: '10px' }}
                            value={adminReplyText[fb.id] || ''}
                            onChange={(e) => setAdminReplyText({ ...adminReplyText, [fb.id]: e.target.value })}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button onClick={() => handleAdminReply(fb.id)} className="btn-primary" style={{ padding: '0.4rem 1rem' }}>Submit Admin Reply</button>
                            <button onClick={() => setShowAdminReplyForm({ ...showAdminReplyForm, [fb.id]: false })} className="btn-primary" style={{ background: '#374151' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Render Nested Replies */}
                {children.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        {children.map(child => renderFeedbackItem(child, true))}
                    </div>
                )}
            </div>
        );
    };

    const mainFeedbacks = feedbacks.filter(fb => !fb.parentId);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '2rem', textAlign: 'center', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>📌 ផ្ដល់មតិយោបល់ ឬ សួររកកម្មវិធីថ្មីៗ</h3>
                <form onSubmit={handleSubmitMain} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="ឈ្មោះរបស់អ្នក"
                            style={{ width: '100%' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Telegram / Email"
                            style={{ width: '100%' }}
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <textarea
                            className="search-bar"
                            placeholder="តើអ្នកចង់ឱ្យពួកយើងបន្ថែមអ្វីខ្លះ?"
                            style={{ width: '100%', height: '100px', resize: 'none' }}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" className="btn-primary" disabled={sending} style={{ width: '100%' }}>
                            {sending ? '⏳ ផ្ញើមតិយោបល់...' : '🚀 ផ្ញើមតិយោបល់'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>🔥 មតិយោបល់ពីសហគមន៍ ({mainFeedbacks.length})</h3>
                {loading ? (
                    <div style={{ textAlign: 'center' }}><div className="loader"></div></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1.5rem' }}>
                        {mainFeedbacks.map(fb => renderFeedbackItem(fb))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedbackForm;
