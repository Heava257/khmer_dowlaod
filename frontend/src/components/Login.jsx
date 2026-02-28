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
            maxWidth: '450px',
            margin: '80px auto',
            padding: '3.5rem',
            background: 'var(--sidebar-bg)',
            backdropFilter: 'blur(10px)',
            borderRadius: '30px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    fontSize: '3.5rem',
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 0 10px var(--accent-color))'
                }}>🔐</div>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(to right, #fff, var(--accent-color))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>Admin Gateway</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Secure access for system administrators</p>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(255, 123, 114, 0.1)',
                    color: '#ff7b72',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 123, 114, 0.2)',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Username</label>
                    <input
                        type="text"
                        className="search-bar"
                        style={{
                            width: '100%',
                            borderRadius: '14px',
                            padding: '1rem 1.2rem',
                            fontSize: '1rem',
                            background: 'rgba(0,0,0,0.2)'
                        }}
                        placeholder="Enter admin username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
                    <input
                        type="password"
                        className="search-bar"
                        style={{
                            width: '100%',
                            borderRadius: '14px',
                            padding: '1rem 1.2rem',
                            fontSize: '1rem',
                            background: 'rgba(0,0,0,0.2)'
                        }}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    style={{
                        padding: '1.1rem',
                        borderRadius: '14px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginTop: '1rem',
                        boxShadow: '0 10px 20px -5px rgba(0, 163, 255, 0.3)'
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <div className="loader" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                            Authenticating...
                        </div>
                    ) : 'Sign In To Control Panel'}
                </button>
            </form>

            <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    This is a restricted area. All access attempts are logged.<br />
                    Powered by Khmer Download Secure Core.
                </p>
            </div>
        </div>
    );
}

export default Login;
