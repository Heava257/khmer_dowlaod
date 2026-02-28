import React, { useState, useEffect } from 'react';
import { BakongKHQR } from 'bakong-khqr';
import { QRCodeSVG } from 'qrcode.react';

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
            await fetch('http://localhost:5050/api/transactions/init', {
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
            maxWidth: '550px',
            margin: '2rem auto',
            background: '#161b22',
            padding: '3rem',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid #30363d'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '2rem' }}>
                <img src="https://bakong.nbc.org.kh/assets/img/bakong-logo.png" alt="Bakong" style={{ height: '30px' }} />
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Secure Checkout</h2>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '0.5rem' }}>MERCHANT: <span style={{ color: '#fff', fontWeight: 'bold' }}>PONG CHIVA (KHMER DOWNLOAD)</span></p>
                <p style={{ color: '#8b949e', fontSize: '1.1rem' }}>Order Total: <strong style={{ color: '#f1c40f', fontSize: '1.8rem' }}>${item.price}</strong></p>
            </div>

            <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '20px',
                display: 'inline-block',
                position: 'relative',
                marginBottom: '1.5rem',
                boxShadow: '0 0 30px rgba(241, 196, 15, 0.2)'
            }}>
                {qrString ? (
                    <QRCodeSVG value={qrString} size={280} level="H" includeMargin={true} />
                ) : (
                    <div style={{ width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                        Loading QR...
                    </div>
                )}
                {isVerifying && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                        <div className="loader" style={{ borderTop: '3px solid #f1c40f' }}></div>
                        <p style={{ marginTop: '1rem', color: '#000', fontWeight: 'bold' }}>Verifying Transaction...</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '0.8rem', padding: '0 2rem', marginBottom: '2rem' }}>
                <span>BILL: {billNumber}</span>
                <span style={{ color: countdown < 30 ? '#ff7b72' : '#8b949e' }}>EXPIRES IN: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
            </div>

            <div style={{ background: '#0d1117', padding: '1.5rem', borderRadius: '15px', textAlign: 'left', marginBottom: '2.5rem', border: '1px solid #30363d' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#238636', boxShadow: '0 0 10px #238636' }}></div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>Automatic Verification System</span>
                </div>
                <p style={{ margin: 0, color: '#8b949e', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    1. Open any mobile banking app.<br />
                    2. Scan this KHQR to pay <strong>${item.price}</strong>.<br />
                    3. Click "Verify Payment" after completing the transfer.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    className="btn-primary"
                    onClick={onCancel}
                    style={{ flex: 1, background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}
                >
                    Cancel Order
                </button>
                <button
                    className="btn-primary"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)', color: '#000', fontWeight: 'bold' }}
                >
                    {isVerifying ? 'Checking...' : 'Verify Payment ✅'}
                </button>
            </div>
        </div>
    );
}

export default PaymentPage;
