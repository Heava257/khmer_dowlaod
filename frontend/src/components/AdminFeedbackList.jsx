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
            setFeedbacks(Array.isArray(data) ? data : []);
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
        if (!window.confirm('Are you sure?')) return;
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
        <div style={{ padding: '2rem', background: '#fff', borderRadius: '24px', border: '1px solid #eee' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>📋 User Feedback Management</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}><div className="loader"></div></div>
            ) : feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: '#86868b' }}>No feedbacks available yet.</div>
            ) : (
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                    {feedbacks.map(f => (
                        <div key={f.id} style={{ padding: '2rem', background: '#f9f9fb', borderRadius: '20px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{f.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#007aff', fontWeight: 600 }}>{f.contact}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        background: f.status === 'pending' ? '#fffbeb' : '#f0fdf4',
                                        color: f.status === 'pending' ? '#b45309' : '#15803d',
                                        fontWeight: 'bold',
                                        border: '1px solid currentColor'
                                    }}>
                                        {f.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <p style={{ color: '#424245', lineHeight: '1.6', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>{f.message}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {f.status === 'pending' && (
                                    <button onClick={() => updateStatus(f.id, 'resolved')} className="buy-btn" style={{ flex: 1, margin: 0, padding: '0.6rem', fontSize: '0.85rem' }}>Resolved</button>
                                )}
                                <button onClick={() => deleteFeedback(f.id)} className="buy-btn" style={{ flex: 1, margin: 0, padding: '0.6rem', fontSize: '0.85rem', background: '#fef2f2', color: '#ef4444' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminFeedbackList;
