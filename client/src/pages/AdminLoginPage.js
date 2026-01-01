import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css'; 

// --- ICONS ---
const LockIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15V17" stroke="url(#themeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 11H18C19.1046 11 20 11.8954 20 13V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V13C4 11.8954 4.89543 11 6 11Z" stroke="url(#themeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="url(#themeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="themeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" /> 
                <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
        </defs>
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const KeyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const AdminLoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        try {
            const res = await fetch(`${API_URL}/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminUser', JSON.stringify(data.adminData));
                navigate('/admin-dashboard');
            } else {
                setError(data.message || 'Kredensial tidak valid.');
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } catch (err) {
            setError('Gagal terhubung ke server database.');
        }
        setIsLoading(false);
    };

    return (
        <div className="main dark-theme" style={{ alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
            
            <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.15)', borderRadius: '50%', filter: 'blur(120px)' }}></div>
            <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '350px', height: '350px', background: 'rgba(79, 70, 229, 0.15)', borderRadius: '50%', filter: 'blur(100px)' }}></div>

            <div className="auth-card" style={{ width: '100%', maxWidth: '400px', padding: '45px 35px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20, 20, 30, 0.7)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <div style={{ marginBottom: '15px', display: 'inline-block', padding: '15px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '50%', boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)' }}>
                        <LockIcon />
                    </div>
                    <h2 style={{ 
                        fontFamily: 'Montserrat, sans-serif', 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        margin: '0 0 5px 0',
                        letterSpacing: '1px',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ADMIN ACCESS
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                        Portal kontrol sistem terpusat
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        marginBottom: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div className="input-group" style={{ margin: 0 }}>
                        <div className="auth-icon-wrapper" style={{ left: '15px', color: 'var(--primary)' }}>
                            <UserIcon />
                        </div>
                        <input 
                            type="email" 
                            name="email"
                            className="input-field" 
                            placeholder="Email Address" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            autoFocus
                            style={{ paddingLeft: '50px', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }} 
                        />
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                        <div className="auth-icon-wrapper" style={{ left: '15px', color: 'var(--primary)' }}>
                            <KeyIcon />
                        </div>
                        <input 
                            type="password" 
                            name="password"
                            className="input-field" 
                            placeholder="Password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            style={{ paddingLeft: '50px', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={isLoading}
                        style={{ 
                            marginTop: '15px', 
                            height: '48px', 
                            fontSize: '13px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            background: 'var(--primary-gradient)', 
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
                        }}
                    >
                        {isLoading ? 'Verifying...' : 'Secure Login'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    <span 
                        onClick={() => navigate('/')} 
                        style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-muted)', 
                            cursor: 'pointer', 
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                        onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Kembali ke Website Utama
                    </span>
                </div>

            </div>
        </div>
    );
};

export default AdminLoginPage;