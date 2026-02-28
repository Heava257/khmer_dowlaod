import React, { useState, useEffect } from 'react';

function UploadForm({ onUploadSuccess, editItem, onCancel }) {
    const [uploadType, setUploadType] = useState('program'); // 'program' or 'video'
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Programs');
    const [file, setFile] = useState(null);
    const [icon, setIcon] = useState(null);
    const [programId, setProgramId] = useState('');
    const [price, setPrice] = useState(0);
    const [isPaid, setIsPaid] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title || '');
            setDescription(editItem.description || '');
            setCategory(editItem.category || 'Programs');
            setProgramId(editItem.programId || '');
            setPrice(editItem.price || 0);
            setIsPaid(editItem.isPaid || false);
            setUploadType(editItem.category ? 'program' : 'video');
        }
    }, [editItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        let endpoint = `http://localhost:5050/api/${uploadType}s`;
        let method = 'POST';

        if (editItem) {
            endpoint = `http://localhost:5050/api/${uploadType}s/${editItem.id}`;
            method = 'PUT';
        }

        if (uploadType === 'program') {
            formData.append('category', category);
            formData.append('price', price);
            formData.append('isPaid', isPaid);
            if (file) formData.append('file', file);
            if (icon) formData.append('icon', icon);
        } else {
            if (file) formData.append('video', file);
            if (icon) formData.append('thumbnail', icon);
            if (programId) formData.append('programId', programId);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (response.ok) {
                alert(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} ${editItem ? 'updated' : 'upload'} successful!`);
                if (!editItem) {
                    setTitle('');
                    setDescription('');
                    setFile(null);
                    setIcon(null);
                    setProgramId('');
                    setPrice(0);
                    setIsPaid(false);
                }
                if (onUploadSuccess) onUploadSuccess();
            } else {
                alert('Action failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error during process.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="program-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'left', padding: '2rem' }}>
            {!editItem && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        className="btn-primary"
                        onClick={() => setUploadType('program')}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: uploadType === 'program' ? 'var(--accent-color)' : 'var(--sidebar-bg)' }}
                    >
                        📦 Program
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setUploadType('video')}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: uploadType === 'video' ? 'var(--accent-color)' : 'var(--sidebar-bg)' }}
                    >
                        🎥 Video Tutorial
                    </button>
                </div>
            )}

            <h3 style={{ marginBottom: '1.5rem' }}>{editItem ? 'Edit' : 'Upload New'} {uploadType === 'program' ? 'Program' : 'Video Tutorial'}</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
                    <input
                        type="text"
                        className="search-bar"
                        style={{ width: '100%', borderRadius: '10px' }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                    <textarea
                        className="search-bar"
                        style={{ width: '100%', height: '100px', borderRadius: '10px', resize: 'none' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                {uploadType === 'program' && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--sidebar-bg)', padding: '1rem', borderRadius: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pricing Type</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" checked={!isPaid} onChange={() => setIsPaid(false)} /> Free
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" checked={isPaid} onChange={() => setIsPaid(true)} /> Paid / Premium
                                </label>
                            </div>
                        </div>
                        {isPaid && (
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="search-bar"
                                    style={{ width: '100%', borderRadius: '10px' }}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {uploadType === 'program' ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                        <select
                            className="search-bar"
                            style={{ width: '100%', borderRadius: '10px' }}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Programs</option>
                            <option>Games</option>
                            <option>Extensions</option>
                            <option>Operating Systems</option>
                        </select>
                    </div>
                ) : (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Related Program ID (Optional)</label>
                        <input
                            type="number"
                            className="search-bar"
                            style={{ width: '100%', borderRadius: '10px' }}
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            {uploadType === 'program' ? 'Program File' : 'Video File'} {editItem && '(Optional)'}
                        </label>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required={!editItem} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            {uploadType === 'program' ? 'Icon Image' : 'Thumbnail'} {editItem && '(Optional)'}
                        </label>
                        <input type="file" onChange={(e) => setIcon(e.target.files[0])} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 2, padding: '1rem' }}>
                        {uploading ? '⏳ Processing...' : `${editItem ? 'Update' : 'Publish'} ${uploadType.toUpperCase()}`}
                    </button>
                    {editItem && (
                        <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: 'var(--sidebar-bg)' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default UploadForm;
