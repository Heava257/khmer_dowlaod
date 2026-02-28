import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function FeedbackForm() {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({}); // { feedbackId: 'message' }
    const [showReplyForm, setShowReplyForm] = useState({});

    const isAdmin = !!localStorage.getItem('token');

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, { headers });
            const data = await response.json();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact, message })
            });

            if (response.ok) {
                alert('មតិយោបល់របស់អ្នកត្រូវបានផ្ញើ! អរគុណសម្រាប់ការគាំទ្រ។');
                setName('');
                setContact('');
                setMessage('');
                fetchFeedbacks();
            } else {
                alert('មានបញ្ហាក្នុងការផ្ញើ។ សូមព្យាយាមម្តងទៀត។');
            }
        } catch (error) {
            console.error('Feedback Error:', error);
            alert('Error connecting to server.');
        } finally {
            setSending(false);
        }
    };

    const handleAdminReply = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/reply/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminReply: replyText[id] })
            });

            if (response.ok) {
                alert('បាន Reply រួចរាល់!');
                setReplyText({ ...replyText, [id]: '' });
                setShowReplyForm({ ...showReplyForm, [id]: false });
                fetchFeedbacks();
            }
        } catch (error) {
            console.error('Reply Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('តើអ្នកពិតជាចង់លុបមតិយោបល់នេះមែនទេ?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchFeedbacks();
            }
        } catch (error) {
            console.error('Delete Error:', error);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }} className="animate-fade-in">
            {/* Feedback Submission Section */}
            <div style={{ padding: '2.5rem', background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)', borderRadius: '32px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-xl)' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800', fontSize: '1.8rem' }}>📌 ផ្ដល់មតិយោបល់ ឬ សួររកកម្មវិធីថ្មីៗ</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ឈ្មោះរបស់អ្នក</label>
                        <input
                            type="text"
                            className="search-bar"
                            style={{ width: '100%', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.5)' }}
                            placeholder="ឧ. សុខ មករា"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Telegram / Email (មិនបង្ហាញជាសាធារណៈ)</label>
                        <input
                            type="text"
                            className="search-bar"
                            style={{ width: '100%', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.5)' }}
                            placeholder="@username ឬ Email"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>មតិយោបល់របស់អ្នក</label>
                        <textarea
                            className="search-bar"
                            style={{ width: '100%', height: '120px', borderRadius: '14px', resize: 'none', background: 'rgba(15, 23, 42, 0.5)' }}
                            placeholder="តើអ្នកចង់ឱ្យពួកយើងបន្ថែមអ្វីខ្លះ? ឬមានបញ្ហាក្នុងការប្រើប្រាស់ផ្នែកណា?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" className="btn-primary" disabled={sending} style={{ padding: '1rem', width: '100%', borderRadius: '14px', fontSize: '1rem', fontWeight: 'bold' }}>
                            {sending ? '⏳ កំពុងផ្ញើ...' : '🚀 ផ្ញើមតិយោបល់'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Community Wall Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '4px', height: '24px', background: 'var(--accent-color)', borderRadius: '4px' }}></div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>មតិយោបល់ពីសហគមន៍ ({feedbacks.length})</h3>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loader"></div></div>
                ) : feedbacks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--sidebar-bg)', borderRadius: '24px' }}>មិនទាន់មានមតិយោបល់នៅឡើយទេ...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {feedbacks.map((fb) => (
                            <div key={fb.id} style={{ padding: '1.5rem', background: 'var(--sidebar-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)', transition: 'transform 0.2s' }} className="feedback-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            {fb.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>{fb.name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(fb.createdAt).toLocaleDateString('km-KH')}</span>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setShowReplyForm({ ...showReplyForm, [fb.id]: !showReplyForm[fb.id] })} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'var(--accent-color)', border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Reply</button>
                                            <button onClick={() => handleDelete(fb.id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#ef4444', border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                                        </div>
                                    )}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: fb.adminReply ? '1rem' : '0' }}>{fb.message}</p>

                                {isAdmin && fb.contact && fb.contact !== 'N/A' && (
                                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '1rem' }}>Contact: {fb.contact}</div>
                                )}

                                {fb.adminReply && (
                                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3b82f6', borderRadius: '0 12px 12px 0', marginTop: '1rem', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#3b82f6' }}>ADMIN REPLY 💎</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(fb.replyDate).toLocaleDateString('km-KH')}</span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: '#e5e7eb' }}>{fb.adminReply}</p>
                                    </div>
                                )}

                                {showReplyForm[fb.id] && (
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                        <textarea
                                            className="search-bar"
                                            style={{ width: '100%', height: '80px', borderRadius: '12px', marginBottom: '0.5rem', fontSize: '0.9rem' }}
                                            placeholder="Write admin reply..."
                                            value={replyText[fb.id] || ''}
                                            onChange={(e) => setReplyText({ ...replyText, [fb.id]: e.target.value })}
                                        ></textarea>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={() => setShowReplyForm({ ...showReplyForm, [fb.id]: false })} className="btn-primary" style={{ background: '#374151', padding: '0.5rem 1rem' }}>Cancel</button>
                                            <button onClick={() => handleAdminReply(fb.id)} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Send Reply</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedbackForm;
