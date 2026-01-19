import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import AppLogo from '../assets/templates/logo.png'; 

// --- SVG ICONS ---
const Icons = {
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
    Zap: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    Shield: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    Layout: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
    Calculator: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
};

const LandingPage = () => {
    const navigate = useNavigate();
    
    // --- CALCULATOR STATE ---
    const [simQty, setSimQty] = useState(50);
    const [simPrice, setSimPrice] = useState(10000);

    const handleSimChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        setSimQty(val);
        
        // LOGIKA HARGA (SAMA DENGAN HOMEPAGE.JS)
        let price = 0;
        if (val <= 30) {
            price = 0;
        } else {
            const excess = val - 30;
            price = excess * 500;
            if (price < 2000) price = 2000; // Min payment
            if (price > 49000) price = 49000; // Cap Max Enterprise
        }
        setSimPrice(price);
    };

    return (
        <div className="main dark-theme" style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'Outfit, sans-serif' }}>
            
            {/* --- BACKGROUND EFFECTS --- */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(124, 58, 237, 0.15)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '10%', right: '-5%', width: '600px', height: '600px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>

            {/* --- NAVBAR --- */}
            <nav style={{ 
                position: 'sticky', top: 0, zIndex: 100, 
                backdropFilter: 'blur(20px)', background: 'rgba(5, 5, 5, 0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '15px 0'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={AppLogo} alt="Logo" style={{ height: '32px', width: 'auto' }} /> 
                        <span className="brand-text" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>
                            Certificate Generator
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => navigate('/generate')} className="btn-primary" style={{ padding: '8px 24px', borderRadius: '30px', fontSize: '13px', fontWeight: '600' }}>
                            Mulai Generate
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header style={{ position: 'relative', zIndex: 1, padding: '100px 20px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', 
                        background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#a78bfa', fontSize: '12px', fontWeight: '600', marginBottom: '24px', letterSpacing: '1px'
                    }}>
                        <span style={{width:'8px', height:'8px', background:'#a78bfa', borderRadius:'50%'}}></span>
                        SISTEM HARGA BARU: LEBIH HEMAT!
                    </div>
                    <h1 style={{ 
                        fontSize: '56px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px',
                        background: 'linear-gradient(to right, #fff 20%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Solusi Cetak Sertifikat <br/> Massal & Otomatis
                    </h1>
                    <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Tidak perlu install aplikasi berat. Upload Excel, desain sesuka hati, dan generate ribuan sertifikat dalam hitungan detik. Bayar hanya yang Anda pakai.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/generate')} className="btn-primary" style={{ height: '54px', padding: '0 32px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.25)' }}>
                            Buat Sertifikat Sekarang <span style={{ marginLeft: '8px' }}><Icons.ArrowRight /></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- PRICING SECTION --- */}
            <section style={{ position: 'relative', zIndex: 1, padding: '80px 20px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), rgba(0,0,0,0))' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Harga Transparan & Adil</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Tidak ada biaya langganan bulanan. Sistem "Pay-as-you-go" kami memastikan Anda hanya membayar kelebihan jumlah sertifikat yang Anda butuhkan.
                    </p>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>
                    
                    {/* KIRI: Penjelasan Skema */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ color: '#fff', fontSize: '20px', margin: 0 }}>0 - 30 Sertifikat</h3>
                                <span style={{ background: '#10b981', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>GRATIS</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                                Sempurna untuk event kecil, rapat, atau uji coba. Nikmati semua fitur premium tanpa biaya sepeserpun setiap hari.
                            </p>
                        </div>

                        <div style={{ background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.1) 0%, rgba(20, 20, 30, 0.6) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '16px', padding: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ color: '#fff', fontSize: '20px', margin: 0 }}>&gt; 30 Sertifikat</h3>
                                <span style={{ background: '#8b5cf6', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>BAYAR KELEBIHANNYA</span>
                            </div>
                            <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.5', marginBottom: '15px' }}>
                                Hanya Rp 500 per lembar untuk setiap sertifikat di atas kuota gratis. 
                            </p>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#a78bfa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Check /> Hemat Biaya</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Check /> Tanpa Langganan</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ color: '#fff', fontSize: '20px', margin: 0 }}>Enterprise Cap</h3>
                                <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>MAX Rp 49.000</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                                Cetak ribuan sertifikat? Jangan khawatir biaya membengkak. Kami kunci biaya maksimal di Rp 49.000 sekali proses.
                            </p>
                        </div>
                    </div>

                    {/* KANAN: Simulator Kalkulator */}
                    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                            <div style={{ background: '#333', padding: '8px', borderRadius: '8px' }}><Icons.Calculator /></div>
                            <h3 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>Simulasi Biaya</h3>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>Jumlah Peserta (Sertifikat)</label>
                            <input 
                                type="number" 
                                value={simQty}
                                onChange={handleSimChange}
                                style={{ 
                                    width: '100%', background: '#000', border: '1px solid #333', borderRadius: '12px', 
                                    padding: '15px', color: '#fff', fontSize: '24px', fontWeight: 'bold', outline: 'none'
                                }}
                            />
                            <input 
                                type="range" 
                                min="0" max="1000" 
                                value={simQty} 
                                onChange={handleSimChange}
                                style={{ width: '100%', marginTop: '15px', accentColor: '#8b5cf6', cursor: 'pointer' }} 
                            />
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>
                                <span>30 Gratis:</span>
                                <span>-Rp {(simQty > 30 ? 30 * 500 : simQty * 500).toLocaleString('id-ID')} (FREE)</span>
                            </div>
                            {simQty > 30 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#ccc' }}>
                                    <span>Kelebihan ({simQty - 30} x 500):</span>
                                    <span>Rp {((simQty - 30) * 500).toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#fff', fontWeight: '600' }}>ESTIMASI BIAYA:</span>
                                <span style={{ color: '#10b981', fontSize: '28px', fontWeight: '800' }}>
                                    Rp {simPrice.toLocaleString('id-ID')}
                                </span>
                            </div>
                            {simQty > 30 && simPrice < ((simQty - 30) * 500) && (
                                <div style={{ textAlign: 'right', fontSize: '11px', color: '#3b82f6', marginTop: '5px' }}>
                                    *Max Price Applied (Hemat!)
                                </div>
                            )}
                            {simPrice === 0 && (
                                <div style={{ textAlign: 'right', fontSize: '11px', color: '#10b981', marginTop: '5px' }}>
                                    *Masih dalam kuota gratis
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                <p>&copy; {new Date().getFullYear()} Certificate Generator. Powered by Azure Cloud & React.</p>
            </footer>

        </div>
    );
};

export default LandingPage;