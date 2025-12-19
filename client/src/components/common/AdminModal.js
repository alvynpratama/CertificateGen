import React, { useState, useEffect } from 'react';
import '../../styles/global.css';

const AdminModal = ({ isOpen, onClose, onLoginSuccess, isAdminMode = false }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Reset saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setMessage({ type: '', text: '' });
            setFormData({ name: '', email: '', password: '' });
            setIsRegister(false);
        }
    }, [isOpen, isAdminMode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        let endpoint = '';
        let body = {};

        if (isAdminMode) {
            // LOGIN ADMIN
            endpoint = '/api/admin-login';
            body = { password: formData.password };
        } else {
            // LOGIN / REGISTER USER
            endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            body = formData;
        }
        
        try {
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (isAdminMode) {
                // Handle Admin Response
                if (data.success) {
                    onLoginSuccess(data.adminData, data.token);
                    onClose();
                } else {
                    setMessage({ type: 'error', text: data.message || 'Password Salah.' });
                }
            } else {
                // Handle User Response
                if (data.status === 'success') {
                    if (isRegister) {
                        setMessage({ type: 'success', text: 'Akun dibuat! Silakan Login.' });
                        setTimeout(() => { setIsRegister(false); setMessage({}); }, 1500);
                    } else {
                        onLoginSuccess(data.user, data.token);
                        onClose();
                    }
                } else {
                    setMessage({ type: 'error', text: data.message || 'Gagal.' });
                }
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server tidak merespon.' });
        }
        setIsLoading(false);
    };

    // --- TAMPILAN KHUSUS ADMIN  ---
    if (isAdminMode) {
        return (
            <div className="modal-overlay">
                <div className="auth-modal-card" style={{ borderColor: '#d4af37', boxShadow: '0 0 25px rgba(212, 175, 55, 0.15)' }}>
                    <button onClick={onClose} style={{position:'absolute', top:'15px', right:'20px', background:'none', border:'none', fontSize:'24px', color:'var(--text-muted)', cursor:'pointer'}}>&times;</button>
                    
                    <div style={{textAlign:'center', marginBottom:'20px'}}>
                        <div style={{fontSize:'40px', marginBottom:'10px'}}>👑</div>
                        <h2 className="auth-title" style={{ background: 'linear-gradient(135deg, #d4af37, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ADMIN PORTAL</h2>
                        <p className="auth-subtitle">Masukkan Kunci Rahasia</p>
                    </div>

                    {message.text && (
                        <div className={`auth-alert ${message.type}`}>
                            <span>{message.type === 'error' ? '⛔' : '✅'}</span><span>{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <input type="password" name="password" className="auth-input-modern" placeholder="Password Admin..." value={formData.password} onChange={handleChange} required style={{borderColor: '#d4af37'}} autoFocus />
                            <div className="auth-icon-wrapper" style={{color:'#d4af37'}}>🔑</div>
                        </div>
                        <button type="submit" className="auth-btn-primary" disabled={isLoading} style={{background: 'linear-gradient(135deg, #b45309, #d4af37)', border:'1px solid #d4af37'}}>
                            {isLoading ? 'Memverifikasi...' : 'BUKA AKSES'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- TAMPILAN USER BIASA ---
    return (
        <div className="modal-overlay">
            <div className="auth-modal-card">
                <button onClick={onClose} style={{position:'absolute', top:'15px', right:'20px', background:'none', border:'none', fontSize:'24px', color:'var(--text-muted)', cursor:'pointer'}}>&times;</button>

                <h2 className="auth-title">{isRegister ? 'Buat Akun' : 'Selamat Datang'}</h2>
                <p className="auth-subtitle">{isRegister ? 'Daftar untuk mulai.' : 'Masuk untuk akses fitur.'}</p>

                <div className="auth-tabs-wrapper">
                    <button className={`auth-tab ${!isRegister ? 'active' : ''}`} onClick={() => { setIsRegister(false); setMessage({}); }}>Masuk</button>
                    <button className={`auth-tab ${isRegister ? 'active' : ''}`} onClick={() => { setIsRegister(true); setMessage({}); }}>Daftar</button>
                </div>

                {message.text && (
                    <div className={`auth-alert ${message.type}`}>
                        <span>{message.type === 'error' ? '⚠️' : '✅'}</span><span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="auth-field">
                            <input type="text" name="name" className="auth-input-modern" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required />
                            <div className="auth-icon-wrapper">👤</div>
                        </div>
                    )}
                    <div className="auth-field">
                        <input type="email" name="email" className="auth-input-modern" placeholder="Alamat Email" value={formData.email} onChange={handleChange} required />
                        <div className="auth-icon-wrapper">✉️</div>
                    </div>
                    <div className="auth-field">
                        <input type="password" name="password" className="auth-input-modern" placeholder="Kata Sandi" value={formData.password} onChange={handleChange} required />
                        <div className="auth-icon-wrapper">🔒</div>
                    </div>
                    <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                        {isLoading ? 'Memproses...' : (isRegister ? 'Daftar Sekarang' : 'Masuk ke Akun')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminModal;