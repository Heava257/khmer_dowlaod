import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function FeedbackForm({ onSuccess }) {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

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
                if (onSuccess) onSuccess();
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

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', background: 'var(--sidebar-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)' }} className="animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>ផ្តល់មតិយោបល់ / រាយការណ៍បញ្ហា</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ឈ្មោះរបស់អ្នក</label>
                    <input
                        type="text"
                        className="search-bar"
                        style={{ width: '100%', borderRadius: '12px' }}
                        placeholder="ឧ. សុខ មករា"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Telegram / ផ្ញើសារមកកាន់</label>
                    <input
                        type="text"
                        className="search-bar"
                        style={{ width: '100%', borderRadius: '12px' }}
                        placeholder="@username ឬ Email"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ព័ត៌មានលម្អិត</label>
                    <textarea
                        className="search-bar"
                        style={{ width: '100%', height: '150px', borderRadius: '12px', resize: 'none' }}
                        placeholder="រៀបរាប់ពីបញ្ហា ឬមតិយោបល់របស់អ្នកមកកាន់ពួកយើង..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit" className="btn-primary" disabled={sending} style={{ padding: '1rem', width: '100%', marginTop: '0.5rem' }}>
                    {sending ? '⏳ កំពុងផ្ញើ...' : '🚀 ផ្ញើមតិយោបល់'}
                </button>
            </form>
        </div>
    );
}

export default FeedbackForm;
