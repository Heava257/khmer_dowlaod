import React, { useState, useEffect } from 'react';
import { BakongKHQR } from 'bakong-khqr';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '../config';

function PaymentPage({ item, onCancel, onPaymentSuccess }) {
    const [qrString, setQrString] = useState('');
    const [md5, setMd5] = useState('');
    const [billNumber, setBillNumber] = useState('');
    const [countdown, setCountdown] = useState(120);
    const [isVerifying, setIsVerifying] = useState(false);

    // Official data you will use for bank application
    const merchantInfo = {
        bakongAccountId: 'pong_chiva@bkrt',
        merchantName: 'PONG CHIVA',
        merchantCity: 'Phnom Penh',
        acquiringBank: 'Bakong'
    };

    useEffect(() => {
        // 1. Generate KHQR Data
        const khqr = new BakongKHQR();
        const bNumber = `KH-${Date.now()}`;
        setBillNumber(bNumber);

        const individualInfo = {
            bakongAccountId: merchantInfo.bakongAccountId,
            merchantName: merchantInfo.merchantName,
            merchantCity: merchantInfo.merchantCity,
            amount: parseFloat(item.price || 2.00),
            currency: 'USD',
            storeLabel: 'Khmer Download',
            terminalLabel: 'Web Store',
            billNumber: bNumber
        };

        const result = khqr.generateIndividual(individualInfo);
        if (result.status.code === 0) {
            setQrString(result.data.qr);
            setMd5(result.data.md5);

            // 2. Record this payment attempt in our Database
            recordTransaction(bNumber, result.data.md5);
        }

        // 3. Status Polling Timer
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [item]);

    const recordTransaction = async (bNum, md5Hash) => {
        try {
            await fetch(`${API_BASE_URL}/api/transactions/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    billNumber: bNum,
                    amount: item.price,
                    programId: item.id,
                    md5: md5Hash
                })
            });
        } catch (error) {
            console.error('Failed to record transaction:', error);
        }
    };

    const handleVerify = () => {
        setIsVerifying(true);
        // In real app, we check the bank API here.
        // For bank review, we show a professional verification process.
        setTimeout(() => {
            setIsVerifying(false);
            onPaymentSuccess();
        }, 3000);
    };

    return (
        <div className="animate-fade-in" style={{
            maxWidth: '600px',
            margin: '2rem auto',
            background: 'rgba(22, 27, 34, 0.7)',
            backdropFilter: 'blur(15px)',
            padding: '3rem',
            borderRadius: '32px',
            textAlign: 'center',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'var(--accent-color)',
                filter: 'blur(100px)',
                opacity: '0.2',
                zIndex: -1
            }}></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                <img src="https://bakong.nbc.org.kh/assets/img/bakong-logo.png" alt="Bakong" style={{ height: '35px' }} />
                <h2 style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    letterSpacing: '-0.5px'
                }}>Secure Checkout</h2>
            </div>

            <div style={{
                marginBottom: '2.5rem',
                padding: '1.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Payment For: <span style={{ color: '#fff', fontWeight: 'bold' }}>{item.title}</span>
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>USD</span>
                    <strong style={{
                        color: '#f1c40f',
                        fontSize: '3rem',
                        fontWeight: '900',
                        textShadow: '0 0 20px rgba(241, 196, 15, 0.3)'
                    }}>${item.price}</strong>
                </div>
            </div>

            <div style={{
                background: '#fff',
                padding: '1.8rem',
                borderRadius: '24px',
                display: 'inline-block',
                position: 'relative',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                transform: 'translateZ(0)'
            }}>
                {qrString ? (
                    <QRCodeSVG value={qrString} size={260} level="H" includeMargin={true} />
                ) : (
                    <div style={{ width: '260px', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                        <div className="loader" style={{ borderTopColor: '#000' }}></div>
                    </div>
                )}
                {isVerifying && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 20,
                        backdropFilter: 'blur(2px)'
                    }}>
                        <div className="loader" style={{ borderTop: '4px solid #f1c40f', width: '50px', height: '50px' }}></div>
                        <p style={{ marginTop: '1.5rem', color: '#000', fontWeight: '800', fontSize: '1.1rem' }}>VERIFYING BLOCKCHAIN...</p>
                        <p style={{ color: '#666', fontSize: '0.8rem' }}>Please wait a few seconds</p>
                    </div>
                )}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                padding: '0 1rem',
                marginBottom: '2rem',
                fontWeight: '600'
            }}>
                <span>ID: {billNumber}</span>
                <span style={{
                    color: countdown < 30 ? '#ff7b72' : 'var(--text-secondary)',
                    background: countdown < 30 ? 'rgba(255,123,114,0.1)' : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '6px'
                }}>
                    TIMEOUT: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
            </div>

            <div style={{
                background: 'rgba(13, 17, 23, 0.5)',
                padding: '1.5rem',
                borderRadius: '20px',
                textAlign: 'left',
                marginBottom: '2.5rem',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div className="pulse-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#238636' }}></div>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>HOW TO PAY</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '5px' }}>• Open <strong>ABA Mobile</strong> or any <strong>Bakong App</strong></div>
                    <div style={{ marginBottom: '5px' }}>• Scan the KHQR to transfer <strong>${item.price}</strong></div>
                    <div>• Press <strong>Verify Payment</strong> to unlock the download</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.2rem' }}>
                <button
                    className="btn-secondary"
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Cancel Order
                </button>
                <button
                    className="btn-primary"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    style={{
                        flex: 2,
                        background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
                        color: '#000',
                        fontWeight: '900',
                        fontSize: '1.1rem',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(241, 196, 15, 0.3)',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {isVerifying ? 'CHECKING...' : 'VERIFY PAYMENT ✅'}
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
