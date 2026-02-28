import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function FeedbackForm() {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [adminReplyText, setAdminReplyText] = useState({});
    const [showAdminReplyForm, setShowAdminReplyForm] = useState({});
    const [reactedIds, setReactedIds] = useState([]);
    const [ownedIds, setOwnedIds] = useState([]);

    const isAdmin = !!localStorage.getItem('token');

    useEffect(() => {
        const savedReacted = JSON.parse(localStorage.getItem('feedback_reacted') || '[]');
        const savedOwned = JSON.parse(localStorage.getItem('feedback_owned') || '[]');
        setReactedIds(savedReacted);
        setOwnedIds(savedOwned);
        fetchFeedbacks();
    }, []);

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

    const trackOwned = (id) => {
        const newOwned = [...ownedIds, id];
        setOwnedIds(newOwned);
        localStorage.setItem('feedback_owned', JSON.stringify(newOwned));
    };

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
                const data = await response.json();
                trackOwned(data.id);
                setName(''); setContact(''); setMessage('');
                fetchFeedbacks();
            }
        } catch (error) { console.error(error); } finally { setSending(false); }
    };

    const handleUserReply = async (parentId) => {
        if (!replyMessage.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'User', contact: 'N/A', message: replyMessage, parentId })
            });
            if (response.ok) {
                const data = await response.json();
                trackOwned(data.id);
                setReplyMessage(''); setReplyingTo(null);
                fetchFeedbacks();
            }
        } catch (error) { console.error(error); }
    };

    const handleUpdate = async (id) => {
        if (!editingText.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: editingText })
            });
            if (response.ok) { setEditingId(null); setEditingText(''); fetchFeedbacks(); }
        } catch (error) { console.error(error); }
    };

    const handleReact = async (id, type) => {
        const key = `${id}_${type}`;
        if (reactedIds.includes(key)) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/react/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            if (response.ok) {
                const updated = [...reactedIds, key];
                setReactedIds(updated);
                localStorage.setItem('feedback_reacted', JSON.stringify(updated));
                fetchFeedbacks();
            }
        } catch (error) { console.error(error); }
    };

    const handleAdminReply = async (id) => {
        if (!adminReplyText[id]) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/feedbacks/reply/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ adminReply: adminReplyText[id] })
            });
            if (response.ok) {
                setAdminReplyText({ ...adminReplyText, [id]: '' });
                setShowAdminReplyForm({ ...showAdminReplyForm, [id]: false });
                fetchFeedbacks();
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            fetchFeedbacks();
        } catch (error) { console.error(error); }
    };

    const renderFeedbackItem = (fb, isReply = false) => {
        const children = feedbacks.filter(child => child.parentId === fb.id);
        const isOwner = ownedIds.includes(fb.id);

        return (
            <div key={fb.id} style={{
                padding: '1.5rem',
                borderRadius: '24px',
                background: isReply ? '#f9f9fb' : '#ffffff',
                marginBottom: '1rem',
                marginLeft: isReply ? '2rem' : '0',
                border: '1px solid #eee',
                boxShadow: isReply ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #007aff, #00c6ff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {fb.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1d1d1f' }}>{fb.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#86868b', marginLeft: '10px' }}>
                                {new Date(fb.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {editingId === fb.id ? (
                    <div>
                        <textarea className="search-input" value={editingText} onChange={(e) => setEditingText(e.target.value)} style={{ padding: '1rem', height: '80px' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button onClick={() => handleUpdate(fb.id)} className="buy-btn" style={{ flex: 1, margin: 0, padding: '0.5rem' }}>Save</button>
                            <button onClick={() => setEditingId(null)} className="buy-btn" style={{ flex: 1, margin: 0, padding: '0.5rem', background: '#f2f2f7', color: '#1d1d1f' }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#424245', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{fb.message}</p>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid #f2f2f7', alignItems: 'center' }}>
                    <button onClick={() => handleReact(fb.id, 'like')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', gap: '4px' }}>
                        👍 {fb.likes || 0}
                    </button>
                    <button onClick={() => handleReact(fb.id, 'love')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', gap: '4px' }}>
                        ❤️ {fb.loves || 0}
                    </button>
                    <button onClick={() => setReplyingTo(replyingTo === fb.id ? null : fb.id)} style={{ background: 'none', border: 'none', color: '#007aff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Reply</button>

                    {isOwner && (
                        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                            <button onClick={() => { setEditingId(fb.id); setEditingText(fb.message); }} style={{ color: '#86868b', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDelete(fb.id)} style={{ color: '#ef4444', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </div>
                    )}
                    {isAdmin && (
                        <button onClick={() => setShowAdminReplyForm({ ...showAdminReplyForm, [fb.id]: true })} style={{ color: '#007aff', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Admin Reply</button>
                    )}
                </div>

                {replyingTo === fb.id && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input type="text" className="search-input" placeholder="Your reply..." style={{ height: '40px', background: '#f5f5f7' }} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
                        <button onClick={() => handleUserReply(fb.id)} className="buy-btn" style={{ margin: 0, padding: '0 1.2rem', height: '40px' }}>Send</button>
                    </div>
                )}

                {fb.adminReply && (
                    <div style={{ marginTop: '1.2rem', padding: '1rem', background: '#eef6ff', borderRadius: '16px', borderLeft: '4px solid #007aff' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#007aff', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Admin Official Reply 💎</div>
                        <p style={{ fontSize: '0.9rem', color: '#1d1d1f', lineHeight: '1.5' }}>{fb.adminReply}</p>
                    </div>
                )}

                {showAdminReplyForm[fb.id] && (
                    <div style={{ marginTop: '1rem' }}>
                        <textarea className="search-input" placeholder="Official Message..." style={{ height: '60px' }} value={adminReplyText[fb.id] || ''} onChange={(e) => setAdminReplyText({ ...adminReplyText, [fb.id]: e.target.value })} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button onClick={() => handleAdminReply(fb.id)} className="buy-btn" style={{ flex: 1, margin: 0, padding: '0.5rem' }}>Post Reply</button>
                            <button onClick={() => setShowAdminReplyForm({ ...showAdminReplyForm, [fb.id]: false })} className="buy-btn" style={{ flex: 1, margin: 0, padding: '0.5rem', background: '#f2f2f7', color: '#1d1d1f' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {children.length > 0 && <div style={{ marginTop: '1rem' }}>{children.map(child => renderFeedbackItem(child, true))}</div>}
            </div>
        );
    };

    const mainFeedbacks = feedbacks.filter(fb => !fb.parentId);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ padding: '3rem', background: '#fff', borderRadius: '32px', border: '1px solid #eee', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center', fontWeight: 800, fontSize: '1.6rem', color: '#1d1d1f' }}>💬 សហគមន៍ Khmer Download</h2>
                <form onSubmit={handleSubmitMain} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" className="search-input" placeholder="ឈ្មោះរបស់អ្នក" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="text" className="search-input" placeholder="Telegram / Email" value={contact} onChange={(e) => setContact(e.target.value)} />
                    <textarea className="search-input" placeholder="តើអ្នកចង់ឱ្យពួកយើងបន្ថែមកម្មវិធីអ្វីខ្លះ?" style={{ gridColumn: 'span 2', height: '120px', padding: '1rem', resize: 'none' }} value={message} onChange={(e) => setMessage(e.target.value)} required />
                    <button type="submit" className="buy-btn" style={{ gridColumn: 'span 2', margin: 0, height: '54px' }} disabled={sending}>
                        {sending ? 'Processing...' : '🚀 បោះពុម្ពមតិយោបល់'}
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1d1d1f' }}>Recent Discussions ({mainFeedbacks.length})</h3>
                {loading ? <div style={{ textAlign: 'center' }}><div className="loader"></div></div> : (
                    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1rem' }}>
                        {mainFeedbacks.map(fb => renderFeedbackItem(fb))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedbackForm;
