import React from 'react';
import { useNavigate } from 'react-router-dom';

import AppLogo from '../../assets/templates/logo.png'; 


// --- IKON MODERN ---
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const Header = ({ theme, setTheme, user, onHistoryClick, onLoginClick, onLogout }) => {
    const navigate = useNavigate();
    const [dailyQuota, setDailyQuota] = useState(30);

    useEffect(() => {
        const checkQuota = () => {
            if (user?.role === 'admin') {
                setDailyQuota("∞");
                return;
            }

            const today = new Date().toDateString();
            const usageData = JSON.parse(localStorage.getItem('daily_usage_log') || '{}');
            
            if (usageData.date !== today) {
                setDailyQuota(30);
            } else {
                setDailyQuota(Math.max(0, 30 - (usageData.count || 0)));
            }
        };

        checkQuota();
        const interval = setInterval(checkQuota, 2000);

        return () => clearInterval(interval);
    }, [user]);

    return (
        <header className="header">
            <div className="header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={AppLogo} alt="Logo" className="brand-logo" /> 
                <span className="brand-text">Certificate Generator</span>
            </div>

            <div className="header-actions">
                {/* --- INDIKATOR KUOTA (BARU) --- */}
                {!user || user.role !== 'admin' ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(16, 185, 129, 0.1)', 
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '6px 12px', borderRadius: '20px', marginRight: '10px'
                    }} title="Sisa Kuota Gratis Hari Ini">
                        <div style={{color: '#10b981'}}><TicketIcon /></div>
                        <div style={{fontSize: '13px', fontWeight: '700', color: '#10b981'}}>
                            {dailyQuota} <span style={{fontSize: '11px', fontWeight: '400', opacity: 0.8}}>Free</span>
                        </div>
                    </div>
                ) : null}

                <button 
                    className="btn-icon" 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                    title="Ganti Tema"
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>

                {user && (
                    <button className="btn-icon" onClick={onHistoryClick} title="Riwayat Cetak">
                        <HistoryIcon />
                    </button>
                )}
                
                {user ? (
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', paddingLeft:'15px', borderLeft:'1px solid var(--glass-border)'}}>
                            <div style={{textAlign:'right', lineHeight:'1.3'}}>
                                <div style={{fontSize:'13px', fontWeight:'600', color:'var(--text-main)'}}>{user.name}</div>
                                <div style={{fontSize:'10px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                                    {user.role === 'admin' ? 'PRO ACCOUNT' : 'BASIC USER'}
                                </div>
                            </div>
                            <div style={{
                                width:'36px', height:'36px', borderRadius:'10px', 
                                background:'var(--bg-element)', border:'1px solid var(--border-color)',
                                color:'var(--primary)',
                                display:'flex', alignItems:'center', justifyContent:'center'
                            }}>
                               <UserIcon />
                            </div>
                        </div>
                        
                        <button className="btn-icon" onClick={onLogout} title="Keluar Akun" style={{color:'var(--danger)', borderColor:'rgba(255,0,0,0.1)'}}>
                            <LogoutIcon />
                        </button>
                    </div>
                ) : (
                    <button className="btn-primary" style={{width:'auto', padding:'8px 24px', fontSize:'13px'}} onClick={onLoginClick}>
                        LOGIN
                    </button>
                )}
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .user-info-text { display: none; }
                }
            `}</style>
        </header>
    );
};

export default Header;