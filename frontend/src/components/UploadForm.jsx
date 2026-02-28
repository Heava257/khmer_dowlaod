import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function UploadForm({ onUploadSuccess, editItem, onCancel }) {
    const [uploadType, setUploadType] = useState('program'); // 'program' or 'video'
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Programs');
    const [file, setFile] = useState(null);
    const [icon, setIcon] = useState(null);
    const [banner, setBanner] = useState(null);
    const [programId, setProgramId] = useState('');
    const [price, setPrice] = useState(0);
    const [isPaid, setIsPaid] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [externalUrl, setExternalUrl] = useState('');

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title || '');
            setDescription(editItem.description || '');
            setCategory(editItem.category || 'Programs');
            setProgramId(editItem.programId || '');
            setPrice(editItem.price || 0);
            setIsPaid(editItem.isPaid || false);
            setExternalUrl(editItem.externalDownloadUrl || editItem.externalVideoUrl || '');
            setUploadType(editItem.category ? 'program' : 'video');
        }
    }, [editItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        const sanitizedExternalUrl = externalUrl.trim();
        if (uploadType === 'program' && !editItem && !file && !sanitizedExternalUrl) {
            alert('Please provide a file or an external download link!');
            setUploading(false);
            return;
        }

        let endpoint = `${API_BASE_URL}/api/${uploadType}s`;
        let method = 'POST';

        if (editItem) {
            endpoint = `${API_BASE_URL}/api/${uploadType}s/${editItem.id}`;
            method = 'PUT';
        }

        if (uploadType === 'program') {
            formData.append('category', category);
            formData.append('price', String(price || 0));
            formData.append('isPaid', String(isPaid));
            formData.append('externalDownloadUrl', sanitizedExternalUrl);
            if (file) formData.append('file', file);
            if (icon) formData.append('icon', icon);
            if (banner) formData.append('banner', banner);
        } else {
            formData.append('externalVideoUrl', sanitizedExternalUrl);
            if (icon) formData.append('thumbnail', icon);
            if (programId) formData.append('programId', programId);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                alert(`Successfully ${editItem ? 'updated' : 'uploaded'}!`);
                if (onUploadSuccess) onUploadSuccess();
            } else {
                alert(`Error: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert('System Error. Please check connection.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto', background: '#fff', padding: '3rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            {!editItem && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                    <button
                        className="buy-btn"
                        onClick={() => setUploadType('program')}
                        style={{ flex: 1, margin: 0, background: uploadType === 'program' ? 'var(--accent-gradient)' : '#f2f2f7', color: uploadType === 'program' ? '#fff' : '#6e6e73' }}
                    >
                        📦 Program
                    </button>
                    <button
                        className="buy-btn"
                        onClick={() => setUploadType('video')}
                        style={{ flex: 1, margin: 0, background: uploadType === 'video' ? 'var(--accent-gradient)' : '#f2f2f7', color: uploadType === 'video' ? '#fff' : '#6e6e73' }}
                    >
                        🎥 Video Tutorial
                    </button>
                </div>
            )}

            <h2 style={{ marginBottom: '2rem', fontWeight: 800 }}>{editItem ? 'Edit Content' : `Upload New ${uploadType}`}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Title</label>
                    <input
                        type="text"
                        className="search-input"
                        style={{ background: '#f9f9fb', height: '50px' }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Description</label>
                    <textarea
                        className="search-input"
                        style={{ background: '#f9f9fb', height: '120px', padding: '1rem', resize: 'none' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>
                        {uploadType === 'program' ? '🚀 External Download URL' : '📹 YouTube URL'}
                    </label>
                    <input
                        type="text"
                        className="search-input"
                        style={{ background: '#f9f9fb', height: '50px' }}
                        placeholder="https://..."
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                    />
                </div>

                {uploadType === 'program' && (
                    <div style={{ display: 'flex', gap: '1.5rem', background: '#f9f9fb', padding: '1.5rem', borderRadius: '18px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Type</label>
                            <select className="search-input" value={isPaid} onChange={(e) => setIsPaid(e.target.value === 'true')} style={{ background: '#fff' }}>
                                <option value="false">Free</option>
                                <option value="true">Premium (Paid)</option>
                            </select>
                        </div>
                        {isPaid && (
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Price ($)</label>
                                <input type="number" step="0.01" className="search-input" value={price} onChange={(e) => setPrice(e.target.value)} style={{ background: '#fff' }} />
                            </div>
                        )}
                    </div>
                )}

                {uploadType === 'program' && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Category</label>
                        <select className="search-input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ background: '#f9f9fb' }}>
                            <option>Programs</option>
                            <option>Games</option>
                            <option>Extensions</option>
                            <option>Operating Systems</option>
                        </select>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    {uploadType === 'program' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.8rem' }}>Banner Image</label>
                            <input type="file" onChange={(e) => setBanner(e.target.files[0])} style={{ fontSize: '0.7rem' }} />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.8rem' }}>{uploadType === 'program' ? 'Icon' : 'Thumbnail'}</label>
                        <input type="file" onChange={(e) => setIcon(e.target.files[0])} style={{ fontSize: '0.7rem' }} />
                    </div>
                    {uploadType === 'program' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.8rem' }}>Prog File (R2 Pref)</label>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ fontSize: '0.7rem' }} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="buy-btn" disabled={uploading} style={{ flex: 2, margin: 0 }}>
                        {uploading ? 'Processing...' : `${editItem ? 'Save Changes' : 'Publish Content'}`}
                    </button>
                    <button type="button" onClick={onCancel} className="buy-btn" style={{ flex: 1, margin: 0, background: '#f2f2f7', color: '#1d1d1f' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UploadForm;
