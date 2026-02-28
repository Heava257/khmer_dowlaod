import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function AdminFeedbackList() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setFeedbacks(data);
        } catch (error) {
            console.error('Fetch Feedback Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            fetchFeedbacks();
        } catch (error) {
            console.error('Update Status Error:', error);
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchFeedbacks();
        } catch (error) {
            console.error('Delete Feedback Error:', error);
        }
    };

    return (
        <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--sidebar-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '2rem', color: 'var(--accent-color)' }}>📋 Admin Feedback Management</h3>

            {loading ? (
                <p>Loading feedbacks...</p>
            ) : feedbacks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No feedbacks yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {feedbacks.map(f => (
                        <div key={f.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{f.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)' }}>{f.contact}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        background: f.status === 'pending' ? 'rgba(241,196,15,0.1)' : 'rgba(46,204,113,0.1)',
                                        color: f.status === 'pending' ? '#f1c40f' : '#2ecc71',
                                        border: f.status === 'pending' ? '1px solid #f1c40f' : '1px solid #2ecc71'
                                    }}>
                                        {f.status.toUpperCase()}
                                    </span>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {new Date(f.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{f.message}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {f.status === 'pending' && (
                                    <button onClick={() => updateStatus(f.id, 'resolved')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#2ecc71' }}>Mark Resolved</button>
                                )}
                                <button onClick={() => deleteFeedback(f.id)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(255,123,114,0.1)', color: '#ff7b72', border: '1px solid #ff7b72', boxShadow: 'none' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminFeedbackList;
