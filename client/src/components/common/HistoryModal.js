import React, { useEffect, useState } from 'react';

const HistoryModal = ({ isOpen, onClose, user, onReDownload }) => {
    const [history, setHistory] = useState([]);

    // --- HELPER: HITUNG HARI TERSISA ---
    const getDaysRemaining = (item) => {
        const retention = item.retentionDays || 7; // Default 7 hari
        const createdDate = new Date(item.date);
        const expiryDate = new Date(createdDate);
        expiryDate.setDate(createdDate.getDate() + retention);
        
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    useEffect(() => {
        if (isOpen && user) {
            const raw = localStorage.getItem(`history_${user.email}`);
            
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    const now = new Date();

                    const validData = data.filter(item => {
                        const daysLeft = getDaysRemaining(item);
                        return daysLeft >= 0;
                    });

                    setHistory(validData);

                    if (validData.length !== data.length) {
                        localStorage.setItem(`history_${user.email}`, JSON.stringify(validData));
                    }
                } catch (e) {
                    console.error("Error parsing history:", e);
                    localStorage.removeItem(`history_${user.email}`);
                    setHistory([]);
                }
            } else {
                setHistory([]);
            }
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="history-card" onClick={(e) => e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid var(--border-color)', paddingBottom:'10px'}}>
                    <div>
                        <h2 className="auth-title" style={{margin:0, fontSize:'20px'}}>Riwayat Cetak</h2>
                        <span style={{fontSize:'11px', color:'var(--text-muted)'}}>Disimpan di browser ini</span>
                    </div>
                    <button className="auth-close" onClick={onClose} style={{fontSize:'24px', lineHeight:'20px'}}>&times;</button>
                </div>

                <div className="history-list-container">
                    {history.length === 0 ? (
                        <div style={{padding:'40px 0', textAlign:'center', color:'var(--text-muted)'}}>
                            <div style={{fontSize:'40px', marginBottom:'10px', opacity:0.3}}>📂</div>
                            <p style={{fontSize:'13px'}}>Belum ada riwayat aktif.</p>
                        </div>
                    ) : (
                        history.map((item) => {
                            const daysLeft = getDaysRemaining(item);
                            const planColor = item.plan === 'Enterprise' ? '#8b5cf6' : 
                                              item.plan === 'Pro' ? '#3b82f6' : 
                                              item.plan === 'Basic' ? '#10b981' : '#64748b';

                            return (
                                <div key={item.id} className="history-item" style={{position:'relative', overflow:'hidden'}}>
                                    {/* Indikator Paket */}
                                    <div style={{
                                        position:'absolute', top:0, right:0, 
                                        background: planColor, color:'#fff', 
                                        fontSize:'9px', padding:'2px 8px', 
                                        borderBottomLeftRadius:'8px', fontWeight:'bold'
                                    }}>
                                        {item.plan || 'Free'}
                                    </div>

                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginTop:'10px'}}>
                                        <div className="history-info" style={{flex:1}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                                                <strong style={{fontSize:'14px', color:'var(--text-main)'}}>{item.fileName}</strong>
                                            </div>
                                            
                                            <div className="history-meta" style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                                                <span>{new Date(item.date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                                                <span style={{color:'var(--text-main)'}}> {item.qty} Sertifikat</span>
                                                
                                                {/* Info Expired */}
                                                <span style={{
                                                    fontSize:'10px', 
                                                    color: daysLeft <= 3 ? '#ef4444' : 'var(--text-muted)',
                                                    marginTop:'4px', fontWeight:'500'
                                                }}>
                                                    Expired: {daysLeft} hari lagi
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px'}}>
                                            {item.cost > 0 ? (
                                                <div style={{fontSize:'13px', color:'var(--primary)', fontWeight:'bold'}}>
                                                    Rp {item.cost.toLocaleString('id-ID')}
                                                </div>
                                            ) : (
                                                <div style={{fontSize:'12px', color:'var(--text-muted)', fontWeight:'bold'}}>FREE</div>
                                            )}

                                            <button 
                                                className="btn-primary" 
                                                style={{width:'auto', padding:'6px 14px', fontSize:'11px', height:'auto', borderRadius:'6px'}}
                                                onClick={() => onReDownload(item)}
                                            >
                                                Cetak Ulang
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* Foot Note */}
                <div style={{marginTop:'15px', borderTop:'1px solid var(--border-color)', paddingTop:'10px', fontSize:'10px', color:'var(--text-muted)', textAlign:'center', lineHeight:'1.4'}}>
                    * Data history disimpan lokal. Jika Anda membersihkan cache browser, data akan hilang.<br/>
                    * Durasi simpan sesuai paket: Free (7 hari), Basic (25), Pro (30), Enterprise (50).
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;