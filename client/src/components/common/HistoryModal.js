import React, { useEffect, useState } from 'react';

const HistoryModal = ({ isOpen, onClose, user, onReDownload }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen && user) {
            // Ambil history
            const raw = localStorage.getItem(`history_${user.email}`);
            if (raw) {
                const data = JSON.parse(raw);
                
                // --- FILTER LOGIC (7 HARI) ---
                const now = new Date();
                const validData = data.filter(item => {
                    const itemDate = new Date(item.date);
                    const diffTime = Math.abs(now - itemDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    return diffDays <= 7;
                });

                // Update state
                setHistory(validData);

                // Update LocalStorage (Hapus yang kadaluarsa)
                if (validData.length !== data.length) {
                    localStorage.setItem(`history_${user.email}`, JSON.stringify(validData));
                }
            }
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="history-card" onClick={(e) => e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                    <h2 className="auth-title" style={{margin:0, fontSize:'20px'}}>Riwayat Cetak</h2>
                    <button className="auth-close" onClick={onClose}>&times;</button>
                </div>

                <div className="history-list-container">
                    {history.length === 0 ? (
                        <p style={{textAlign:'center', color:'var(--text-muted)', fontSize:'13px'}}>Belum ada riwayat (7 hari terakhir).</p>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="history-item">
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <div className="history-info">
                                        <strong>{item.fileName}</strong>
                                        <div className="history-meta">
                                            {new Date(item.date).toLocaleString()} • {item.qty} Files
                                        </div>
                                        {/* Tampilkan Biaya jika ada */}
                                        {item.cost > 0 && (
                                            <div style={{fontSize:'11px', color:'var(--primary)', fontWeight:'bold', marginTop:'2px'}}>
                                                Total: Rp {item.cost.toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className="btn-primary" 
                                        style={{width:'auto', padding:'5px 12px', fontSize:'11px', height:'30px'}}
                                        onClick={() => onReDownload(item)}
                                    >
                                        Cetak Ulang
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Foot Note */}
                <div style={{marginTop:'15px', borderTop:'1px solid var(--border-color)', paddingTop:'10px', fontSize:'10px', color:'var(--text-muted)', textAlign:'center'}}>
                    * Riwayat disimpan lokal di browser selama 7 hari.
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;