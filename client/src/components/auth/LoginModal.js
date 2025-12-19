import React, { useState, useEffect } from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import emailjs from '@emailjs/browser';
import { emailConfig } from "../../config/emailjs";

const LoginModal = ({ isOpen, onClose, onLogin, onShowAlert }) => {
    const [view, setView] = useState('login'); 
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [otpCode, setOtpCode] = useState(''); 
    const [inputOtp, setInputOtp] = useState(''); 
    const [newPassword, setNewPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) resetAll();
    }, [isOpen]);

    const resetAll = () => {
        setView('login');
        setName(''); setEmail(''); setPassword('');
        setOtpCode(''); setInputOtp(''); setNewPassword('');
        setError(''); setIsLoading(false);
    };

    if (!isOpen) return null;

    const sendOtpEmail = async (targetEmail, targetName = "User") => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setOtpCode(code);
        
        const templateParams = {
            to_name: targetName,
            to_email: targetEmail,
            otp_code: code,
            from_name: "Certificate Generator"
        };

        try {
            await emailjs.send(
                emailConfig.serviceId,
                emailConfig.templateId,
                templateParams,
                emailConfig.publicKey
            );
            return true;
        } catch (err) {
            console.error("Gagal kirim email:", err);
            setError("Gagal mengirim kode OTP. Periksa koneksi internet.");
            return false;
        }
    };

    const handleRegisterRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const isExist = existingUsers.find(u => u.email === email);

        if (isExist) {
            setError('Email sudah terdaftar. Silakan login.');
            setIsLoading(false);
        } else {
            const isSent = await sendOtpEmail(email, name);
            setIsLoading(false);
            
            if (isSent) {
                onShowAlert({
                    title: 'OTP Terkirim',
                    message: `Kode verifikasi telah dikirim ke ${email}. Cek Inbox/Spam.`,
                    type: 'alert'
                });
                setView('otp_register'); 
            }
        }
    };

    const handleVerifyRegister = (e) => {
        e.preventDefault();
        if (inputOtp === otpCode) {
            const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const newUser = { name, email, password, role: 'user', type: 'email' };
            existingUsers.push(newUser);
            localStorage.setItem('registered_users', JSON.stringify(existingUsers));
            
            onShowAlert({
                title: 'Registrasi Berhasil',
                message: 'Akun Anda berhasil dibuat. Silakan Login.',
                type: 'alert'
            });
            resetAll();
        } else {
            setError('Kode OTP salah! Cek email Anda kembali.');
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (email === 'admin@test.com' && password === 'admin123') {
                onLogin({ name: 'Admin Utama', role: 'admin', email });
                return;
            }

            const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const validUser = existingUsers.find(u => u.email === email && u.password === password);

            if (validUser) {
                onLogin(validUser);
            } else {
                setError('Email atau password salah.');
                setIsLoading(false);
            }
        }, 800);
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const userFound = existingUsers.find(u => u.email === email);

        if (!userFound) {
            setError('Email tidak ditemukan dalam database.');
            setIsLoading(false);
            return;
        }

        const isSent = await sendOtpEmail(email, userFound.name || "User");
        setIsLoading(false);

        if (isSent) {
            onShowAlert({
                title: 'OTP Terkirim',
                message: `Kode reset password dikirim ke ${email}.`,
                type: 'alert'
            });
            setView('otp_forgot');
        }
    };

    const handleVerifyForgot = (e) => {
        e.preventDefault();
        if (inputOtp === otpCode) {
            setView('reset_password');
            setError('');
        } else {
            setError('Kode OTP salah!');
        }
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const updatedUsers = existingUsers.map(u => {
            if (u.email === email) return { ...u, password: newPassword };
            return u;
        });
        localStorage.setItem('registered_users', JSON.stringify(updatedUsers));

        onShowAlert({
            title: 'Sukses',
            message: 'Password berhasil diubah! Silakan login.',
            type: 'alert'
        });
        resetAll();
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            let appUser = existingUsers.find(u => u.email === user.email);

            if (!appUser) {
                appUser = { name: user.displayName, email: user.email, role: 'user', type: 'google' };
                existingUsers.push(appUser);
                localStorage.setItem('registered_users', JSON.stringify(existingUsers));
            }
            onLogin(appUser);
        } catch (error) {
            console.error("Google Error:", error);
            setError("Gagal login dengan Google.");
            setIsLoading(false);
        }
    };

    // RENDER UI
    const getTitle = () => {
        switch(view) {
            case 'login': return 'LOGIN AKUN';
            case 'register': return 'DAFTAR AKUN BARU';
            case 'otp_register': return 'VERIFIKASI EMAIL';
            case 'forgot_request': return 'LUPA PASSWORD';
            case 'otp_forgot': return 'KODE OTP';
            case 'reset_password': return 'PASSWORD BARU';
            default: return 'AUTH';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-card" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close" onClick={onClose}>&times;</button>
                <div className="auth-title">{getTitle()}</div>
                
                <div style={{textAlign:'center', fontSize:'13px', color:'var(--text-muted)', marginBottom:'20px'}}>
                    {view === 'otp_register' || view === 'otp_forgot' 
                        ? `Masukkan 4 digit kode yang dikirim ke ${email}` 
                        : (view === 'login' ? 'Masuk untuk melanjutkan' : 'Lengkapi data berikut')}
                </div>

                {error && <div style={{background:'rgba(255, 71, 87, 0.1)', color:'var(--danger)', padding:'10px', borderRadius:'10px', fontSize:'12px', textAlign:'center', border:'1px solid var(--danger)', marginBottom:'10px'}}>{error}</div>}

                {/* FORM LOGIN */}
                {view === 'login' && (
                    <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div className="input-group" style={{margin:0}}><input type="email" className="input-field" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div className="input-group" style={{margin:0}}><input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        <div style={{textAlign:'right'}}><span onClick={() => setView('forgot_request')} style={{fontSize:'12px', color:'var(--primary)', cursor:'pointer', fontWeight:'600'}}>Lupa Password?</span></div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Memproses...' : 'MASUK'}</button>
                    </form>
                )}

                {/* FORM REGISTER */}
                {view === 'register' && (
                    <form onSubmit={handleRegisterRequest} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div className="input-group" style={{margin:0}}><input type="text" className="input-field" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                        <div className="input-group" style={{margin:0}}><input type="email" className="input-field" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <div className="input-group" style={{margin:0}}><input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Mengirim OTP...' : 'DAFTAR & KIRIM OTP'}</button>
                    </form>
                )}

                {/* FORM OTP */}
                {(view === 'otp_register' || view === 'otp_forgot') && (
                    <form onSubmit={view === 'otp_register' ? handleVerifyRegister : handleVerifyForgot} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div className="input-group" style={{margin:0}}><input type="text" className="input-field" placeholder="Kode OTP" value={inputOtp} onChange={(e) => setInputOtp(e.target.value)} maxLength="4" style={{textAlign:'center', letterSpacing:'5px', fontSize:'18px'}} required /></div>
                        <button type="submit" className="btn-primary">VERIFIKASI</button>
                        <span onClick={() => setView(view === 'otp_register' ? 'register' : 'forgot_request')} style={{textAlign:'center', fontSize:'12px', color:'var(--text-muted)', cursor:'pointer', textDecoration:'underline'}}>Ubah Email</span>
                    </form>
                )}

                {/* FORM FORGOT */}
                {view === 'forgot_request' && (
                    <form onSubmit={handleForgotRequest} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div className="input-group" style={{margin:0}}><input type="email" className="input-field" placeholder="Email Terdaftar" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Mencari Akun...' : 'KIRIM OTP RESET'}</button>
                        <span onClick={() => setView('login')} style={{textAlign:'center', fontSize:'12px', color:'var(--text-muted)', cursor:'pointer', textDecoration:'underline'}}>Kembali ke Login</span>
                    </form>
                )}

                {/* FORM RESET PASS */}
                {view === 'reset_password' && (
                    <form onSubmit={handleResetPassword} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div className="input-group" style={{margin:0}}><input type="password" className="input-field" placeholder="Password Baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                        <button type="submit" className="btn-primary">SIMPAN PASSWORD</button>
                    </form>
                )}

                {/* GOOGLE BTN & FOOTER */}
                {(view === 'login' || view === 'register') && (
                    <>
                         <div style={{display:'flex', alignItems:'center', gap:'10px', margin:'15px 0'}}><div style={{flex:1, height:'1px', background:'var(--glass-border)'}}></div><span style={{fontSize:'11px', color:'var(--text-muted)'}}>ATAU</span><div style={{flex:1, height:'1px', background:'var(--glass-border)'}}></div></div>
                         <button className="btn-google" onClick={handleGoogleAuth} disabled={isLoading}>
                             <svg className="google-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                             {view === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
                         </button>
                         <div style={{marginTop:'20px', textAlign:'center', fontSize:'13px', color:'var(--text-main)'}}>
                            {view === 'login' ? <><span style={{marginRight:'5px'}}>Belum punya akun?</span><span onClick={() => setView('register')} style={{color:'var(--primary)', fontWeight:'bold', cursor:'pointer', textDecoration:'underline'}}>Daftar Disini</span></> : <><span style={{marginRight:'5px'}}>Sudah punya akun?</span><span onClick={() => setView('login')} style={{color:'var(--primary)', fontWeight:'bold', cursor:'pointer', textDecoration:'underline'}}>Login Disini</span></>}
                        </div>
                    </>
                )}otp
            </div>
        </div>
    );
};
export default LoginModal;