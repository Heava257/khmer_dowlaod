import React, { useState, useEffect } from 'react';
import { BakongKHQR } from 'bakong-khqr';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '../config';

function PaymentPage({ item, onCancel, onPaymentSuccess }) {
    const [qrString, setQrString] = useState('');
    const [billNumber, setBillNumber] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 minutes
    const [isVerifying, setIsVerifying] = useState(false);

    const merchantInfo = {
        bakongAccountId: 'pong_chiva@bkrt',
        merchantName: 'PONG CHIVA',
        merchantCity: 'Phnom Penh',
        acquiringBank: 'Bakong'
    };

    useEffect(() => {
        const khqr = new BakongKHQR();
        const bNumber = `KH-${Date.now()}`;
        setBillNumber(bNumber);

        const individualInfo = {
            bakongAccountId: merchantInfo.bakongAccountId,
            merchantName: merchantInfo.merchantName,
            merchantCity: merchantInfo.merchantCity,
            amount: parseFloat(item.price || 0.00),
            currency: 'USD',
            storeLabel: 'Khmer Download',
            terminalLabel: 'Web Store',
            billNumber: bNumber
        };

        const result = khqr.generateIndividual(individualInfo);
        if (result.status.code === 0) {
            setQrString(result.data.qr);
            recordTransaction(bNumber, result.data.md5);
        }

        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [item]);

    const recordTransaction = async (bNum, md5Hash) => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            await fetch(`${API_BASE_URL}/api/transactions/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    billNumber: bNum,
                    amount: item.price,
                    programId: item.id,
                    md5: md5Hash,
                    userId: user?.id
                })
            });
        } catch (error) {
            console.error('Failed to record transaction:', error);
        }
    };

    const handleVerify = () => {
        setIsVerifying(true);
        // Simulate Bank Verification
        setTimeout(() => {
            setIsVerifying(false);
            onPaymentSuccess();
        }, 3000);
    };

    return (
        <div className="animate-fade-in" style={{
            maxWidth: '520px',
            margin: '2rem auto',
            background: '#ffffff',
            padding: '3rem',
            borderRadius: '32px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
            border: '1px solid #eee',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '2rem' }}>
                <img src="https://bakong.nbc.org.kh/assets/img/bakong-logo.png" alt="Bakong" style={{ height: '30px' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Secure Payment</h2>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f5f5f7', borderRadius: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: '#86868b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Amount to Pay</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1d1d1f' }}>${item.price}</div>
                <div style={{ fontSize: '0.9rem', color: '#1d1d1f', marginTop: '0.5rem', fontWeight: '600' }}>{item.title}</div>
            </div>

            <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '24px',
                border: '1px solid #eee',
                display: 'inline-block',
                marginBottom: '1.5rem',
                position: 'relative'
            }}>
                {qrString ? (
                    <QRCodeSVG value={qrString} size={240} level="H" includeMargin={true} />
                ) : (
                    <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="loader"></div>
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
                        zIndex: 20
                    }}>
                        <div className="loader"></div>
                        <p style={{ marginTop: '1rem', fontWeight: '800', color: '#007aff' }}>CHECKING BANK...</p>
                    </div>
                )}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#86868b', marginBottom: '2rem' }}>
                Ref ID: {billNumber} • Time Left: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>

            <div style={{ textAlign: 'left', background: '#f5f5f7', padding: '1.5rem', borderRadius: '18px', marginBottom: '2rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.8rem' }}>Payment Instructions:</div>
                <ol style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#424245', lineHeight: '1.6' }}>
                    <li>Open your ABA or Bakong mobile app</li>
                    <li>Scan the KHQR code above</li>
                    <li>Confirm the payment of <b>${item.price}</b></li>
                    <li>Wait 5-10 seconds and click <b>Verify Now</b></li>
                </ol>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={onCancel} className="buy-btn" style={{ flex: 1, margin: 0, background: '#f2f2f7', color: '#1d1d1f' }}>
                    Cancel
                </button>
                <button onClick={handleVerify} className="buy-btn" style={{ flex: 2, margin: 0 }}>
                    {isVerifying ? 'Verifying...' : 'Verify Now ✅'}
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
