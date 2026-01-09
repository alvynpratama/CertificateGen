import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

// --- SVG ICONS (Professional Look) ---
const Icons = {
    Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
    Zap: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    Shield: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    Layout: () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
    Logo: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    )
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icons.Logo />
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>
                            Certi<span style={{ color: '#8b5cf6' }}>Gen</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => navigate('/admin-login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Admin</button>
                        <button onClick={() => navigate('/generate')} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '30px', fontSize: '13px' }}>
                            Launch App
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
                        GENERASI TERBARU E-SERTIFIKAT
                    </div>
                    <h1 style={{ 
                        fontSize: '56px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px',
                        background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Buat Sertifikat Massal <br/> Dalam Hitungan Detik
                    </h1>
                    <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Platform profesional untuk mencetak sertifikat digital. Upload data Excel, sesuaikan desain, dan kirim ke ribuan peserta secara instan.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/generate')} className="btn-primary" style={{ height: '54px', padding: '0 32px', fontSize: '16px', borderRadius: '12px' }}>
                            Mulai Sekarang <span style={{ marginLeft: '8px' }}><Icons.ArrowRight /></span>
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
                            title="Instant Generation" 
                            desc="Cetak hingga 50.000 sertifikat hanya dengan satu kali klik. Didukung oleh server Azure yang cepat." 
                        />
                        <FeatureCard 
                            icon={<Icons.Layout />} 
                            title="Drag & Drop Editor" 
                            desc="Atur posisi nama, tanggal, dan ID sertifikat dengan mudah langsung di browser Anda." 
                        />
                        <FeatureCard 
                            icon={<Icons.Shield />} 
                            title="Secure & Private" 
                            desc="Data peserta Anda dienkripsi dan dihapus otomatis setelah proses selesai. Privasi terjamin." 
                        />
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section style={{ position: 'relative', zIndex: 1, padding: '100px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Pilihan Paket</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Pilih solusi yang sesuai dengan kebutuhan event Anda</p>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    
                    {/* Free Tier */}
                    <PricingCard 
                        title="Starter" 
                        price="Rp 0" 
                        features={[
                            "Hingga 30 Sertifikat",
                            "Format PDF High Quality",
                            "QR Code Verification",
                            "Template Dasar"
                        ]}
                        buttonText="Coba Gratis"
                        onClick={() => navigate('/generate')}
                    />

                    {/* Pro Tier (Highlighted) */}
                    <PricingCard 
                        title="Professional" 
                        price="Rp 30.000" 
                        isPopular={true}
                        features={[
                            "Hingga 100 Sertifikat",
                            "Custom Background Sendiri",
                            "Tanpa Watermark",
                            "Prioritas Server",
                            "Simpan History"
                        ]}
                        buttonText="Pilih Professional"
                        onClick={() => navigate('/generate')}
                    />

                    {/* Enterprise Tier */}
                    <PricingCard 
                        title="Enterprise" 
                        price="Rp 75.000" 
                        features={[
                            "Unlimited Sertifikat (>150)",
                            "Dedicated Support",
                            "Custom Font & Styling",
                            "API Access (Coming Soon)",
                            "Lifetime History"
                        ]}
                        buttonText="Hubungi Sales"
                        onClick={() => navigate('/generate')}
                    />
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                <p>&copy; {new Date().getFullYear()} Certificate Generator Platform. All rights reserved.</p>
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

const PricingCard = ({ title, price, features, buttonText, isPopular, onClick }) => (
    <div style={{ 
        background: isPopular ? 'linear-gradient(145deg, rgba(124, 58, 237, 0.1) 0%, rgba(20, 20, 30, 0.8) 100%)' : 'rgba(255, 255, 255, 0.02)', 
        border: isPopular ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)', 
        padding: '40px 30px', borderRadius: '20px', position: 'relative',
        display: 'flex', flexDirection: 'column'
    }}>
        {isPopular && (
            <div style={{ 
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#8b5cf6', color: '#fff', fontSize: '11px', fontWeight: '700',
                padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
                Most Popular
            </div>
        )}
        <div style={{ fontSize: '14px', color: isPopular ? '#a78bfa' : 'var(--text-muted)', fontWeight: '600', letterSpacing: '1px', marginBottom: '10px' }}>
            {title.toUpperCase()}
        </div>
        <div style={{ fontSize: '32px', color: '#fff', fontWeight: '700', marginBottom: '30px', fontFamily: 'Montserrat, sans-serif' }}>
            {price}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
            {features.map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '14px' }}>
                    <Icons.Check /> {feat}
                </div>
            ))}
        </div>
        <button onClick={onClick} className={isPopular ? "btn-primary" : "btn-secondary"} style={{ width: '100%', padding: '14px', borderRadius: '12px', justifyContent: 'center' }}>
            {buttonText}
        </button>
    </div>
);

export default LandingPage;