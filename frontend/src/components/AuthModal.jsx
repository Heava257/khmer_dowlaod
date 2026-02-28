import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function AuthModal({ onClose, onLoginSuccess }) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(2);
            } else {
                setError(data.message || 'Error sending OTP');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLoginSuccess(data.user);
                onClose();
            } else {
                setError(data.message || 'Invalid code');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade-in" style={{ padding: '2.5rem' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}
                >
                    &times;
                </button>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        {step === 1 ? 'Sign In / Sign Up' : 'Verify Your Email'}
                    </h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        {step === 1
                            ? 'Enter your Gmail to receive a verification code.'
                            : `We've sent a 6-digit code to ${email}`}
                    </p>
                </div>

                {error && <div style={{ color: '#ef4444', background: '#fee2e2', padding: '0.8rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="email"
                                className="search-input"
                                placeholder="name@gmail.com"
                                style={{ height: '50px', fontSize: '1rem', textAlign: 'center' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="buy-btn" disabled={loading} style={{ margin: 0 }}>
                            {loading ? 'Sending...' : 'Get Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <input
                            type="text"
                            maxLength="6"
                            className="otp-input"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            autoFocus
                        />
                        <button className="buy-btn" disabled={loading} style={{ margin: 0 }}>
                            {loading ? 'Verifying...' : 'Sign In Now'}
                        </button>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#666' }}>
                            Didn't receive code? <span onClick={() => setStep(1)} style={{ color: '#007aff', cursor: 'pointer', fontWeight: 'bold' }}>Try again</span>
                        </p>
                    </form>
                )}

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', fontSize: '0.8rem', color: '#999' }}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
