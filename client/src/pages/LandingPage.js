import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import AppLogo from '../../assets/templates/logo.png'; 

// --- SVG ICONS ---
const Icons = {
    Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
    Zap: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    Shield: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    Layout: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
};

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="main dark-theme" style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden' }}>
            
            {/* --- BACKGROUND EFFECTS --- */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(124, 58, 237, 0.15)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '10%', right: '-5%', width: '600px', height: '600px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}></div>

            {/* --- NAVBAR --- */}
            <nav style={{ 
                position: 'sticky', top: 0, zIndex: 100, 
                backdropFilter: 'blur(20px)', background: 'rgba(5, 5, 5, 0.7)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '15px 0'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* LOGO (Sama persis dengan Header.js) */}
                    <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={AppLogo} alt="Logo" style={{ height: '32px', width: 'auto' }} /> 
                        <span className="brand-text" style={{ fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>
                            Certificate Generator
                        </span>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => navigate('/generate')} className="btn-primary" style={{ padding: '8px 24px', borderRadius: '30px', fontSize: '13px' }}>
                            Mulai Generate
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header style={{ position: 'relative', zIndex: 1, padding: '100px 20px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ 
                        display: 'inline-block', padding: '6px 16px', borderRadius: '30px', 
                        background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa', fontSize: '12px', fontWeight: '600', marginBottom: '24px', letterSpacing: '1px'
                    }}>
                        PLATFORM GENERATOR #1
                    </div>
                    <h1 style={{ 
                        fontSize: '56px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px',
                        background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Solusi Cetak Sertifikat <br/> Massal & Otomatis
                    </h1>
                    <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Tidak perlu install aplikasi. Cukup upload Excel, desain sesuai selera, dan dapatkan ribuan sertifikat dalam hitungan detik.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/generate')} className="btn-primary" style={{ height: '54px', padding: '0 32px', fontSize: '16px', borderRadius: '12px' }}>
                            Buat Sertifikat Sekarang <span style={{ marginLeft: '8px' }}><Icons.ArrowRight /></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- FEATURES --- */}
            <section style={{ position: 'relative', zIndex: 1, padding: '80px 20px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <FeatureCard 
                            icon={<Icons.Zap />} 
                            title="Super Cepat" 
                            desc="Didukung teknologi Azure Cloud untuk pemrosesan data massal tanpa lag." 
                        />
                        <FeatureCard 
                            icon={<Icons.Layout />} 
                            title="Full Custom" 
                            desc="Gunakan background sendiri, atur font, warna, dan posisi elemen sesuka hati." 
                        />
                        <FeatureCard 
                            icon={<Icons.Shield />} 
                            title="Aman & Privat" 
                            desc="Data Excel Anda hanya diproses saat generate dan tidak disalahgunakan." 
                        />
                    </div>
                </div>
            </section>

            {/* --- PRICING LIST (Informasional) --- */}
            <section style={{ position: 'relative', zIndex: 1, padding: '100px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Biaya Layanan</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Sistem pembayaran otomatis berdasarkan jumlah sertifikat yang Anda generate.
                    </p>
                </div>

                {/* Grid 4 Kolom */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    
                    {/* TIER 1: GRATIS */}
                    <PricingCard 
                        title="Starter" 
                        qty="1 - 30 Data"
                        price="GRATIS" 
                        features={[
                            "Custom Background",
                            "Tanpa Watermark",
                            "Custom Font & Styling",
                            "QR Code Verification",
                            "Simpan History 7 Hari"
                        ]}
                    />

                    {/* TIER 2: 30K */}
                    <PricingCard 
                        title="Basic Batch" 
                        qty="31 - 100 Data"
                        price="Rp 30.000" 
                        features={[
                            "Semua Fitur Starter",
                            "Prioritas Server (Cepat)",
                            "Simpan History 30 Hari",
                            "Dukungan Email"
                        ]}
                    />

                    {/* TIER 3: 50K */}
                    <PricingCard 
                        title="Pro Batch" 
                        qty="101 - 150 Data"
                        price="Rp 50.000" 
                        isPopular={true}
                        features={[
                            "Semua Fitur Basic",
                            "High-Speed Processing",
                            "Garansi Hasil PDF",
                            "Dedicated Support"
                        ]}
                    />

                    {/* TIER 4: 75K */}
                    <PricingCard 
                        title="Enterprise" 
                        qty="> 150 Data"
                        price="Rp 75.000" 
                        features={[
                            "Semua Fitur Pro",
                            "Unlimited Processing",
                            "Prioritas Tertinggi",
                            "Lifetime History Akses"
                        ]}
                    />
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                        *Pembayaran dilakukan di akhir proses menggunakan QRIS / E-Wallet (Midtrans).
                    </p>
                    <button onClick={() => navigate('/generate')} className="btn-primary" style={{ padding: '15px 40px', fontSize: '16px', borderRadius: '50px', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)' }}>
                        Mulai Generate Sekarang
                    </button>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                <p>&copy; {new Date().getFullYear()} Certificate Generator. Powered by Azure Cloud & React.</p>
            </footer>

        </div>
    );
};

// --- COMPONENTS HELPER ---

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', 
        padding: '30px', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default'
    }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', fontSize: '14px' }}>{desc}</p>
    </div>
);

const PricingCard = ({ title, qty, price, features, isPopular }) => (
    <div style={{ 
        background: isPopular ? 'linear-gradient(145deg, rgba(124, 58, 237, 0.1) 0%, rgba(20, 20, 30, 0.8) 100%)' : 'rgba(255, 255, 255, 0.02)', 
        border: isPopular ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)', 
        padding: '30px 20px', borderRadius: '20px', position: 'relative',
        display: 'flex', flexDirection: 'column', height: '100%'
    }}>
        {isPopular && (
            <div style={{ 
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#8b5cf6', color: '#fff', fontSize: '10px', fontWeight: '700',
                padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
                Best Value
            </div>
        )}
        <div style={{ fontSize: '12px', color: isPopular ? '#a78bfa' : 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' }}>
            {title}
        </div>
        <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginBottom: '15px' }}>
            {qty}
        </div>
        <div style={{ fontSize: '28px', color: '#fff', fontWeight: '700', marginBottom: '25px', fontFamily: 'Montserrat, sans-serif' }}>
            {price}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '10px', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.4' }}>
                    <div style={{ marginTop: '2px' }}><Icons.Check /></div>
                    <span>{feat}</span>
                </div>
            ))}
        </div>
    </div>
);

export default LandingPage;