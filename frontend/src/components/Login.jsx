import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            maxWidth: '420px',
            margin: '100px auto',
            padding: '3.5rem',
            background: '#ffffff',
            borderRadius: '32px',
            border: '1px solid #eee',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
        }}>
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.8px', color: '#1d1d1f' }}>Admin Gateway</h2>
                <p style={{ color: '#86868b', marginTop: '0.5rem', fontSize: '0.9rem' }}>Secure management for administrators</p>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '14px', marginBottom: '2rem', fontSize: '0.85rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem' }}>Username</label>
                    <input
                        type="text"
                        className="search-input"
                        style={{ background: '#f9f9fb', height: '50px', fontSize: '1rem' }}
                        placeholder="Admin ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
                    <input
                        type="password"
                        className="search-input"
                        style={{ background: '#f9f9fb', height: '50px', fontSize: '1rem' }}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="buy-btn" style={{ margin: 0, marginTop: '1rem' }} disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In To Panel'}
                </button>
            </form>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee', fontSize: '0.75rem', color: '#86868b' }}>
                Restricted area. All access attempts are recorded.
            </div>
        </div>
    );
}

export default Login;
