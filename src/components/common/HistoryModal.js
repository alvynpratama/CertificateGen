import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import '../../styles/global.css';

// ✅ Menerima prop 'onReDownload'
const HistoryModal = ({ isOpen, onClose, user, onReDownload }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen && user) {
            const data = JSON.parse(localStorage.getItem(`history_${user.email}`) || '[]');
            setHistory(data);
        }
    }, [isOpen, user]);

    // --- FUNGSI DOWNLOAD LOG (PDF) ---
    const downloadReport = (item) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("LAPORAN GENERATE SERTIFIKAT", 105, 20, null, null, "center");
        doc.setFontSize(10);
        doc.text(`User: ${user.email}`, 20, 30);
        doc.text(`Tanggal: ${new Date(item.date).toLocaleString()}`, 20, 35);
        doc.text(`Jumlah: ${item.qty} Sertifikat`, 20, 40);
        doc.line(20, 50, 190, 50);
        doc.text("Daftar Penerima (Jika Tersimpan):", 20, 60);
        
        let yPos = 70;
        const recipients = item.fullData ? item.fullData.map(d => d.Name || d.name || Object.values(d)[0]) : (item.recipients || []);
        
        if (recipients.length > 0) {
            recipients.forEach((name, index) => {
                if (yPos > 280) { doc.addPage(); yPos = 20; }
                doc.text(`${index + 1}. ${name}`, 25, yPos);
                yPos += 7;
            });
        } else { doc.text("- Data tidak ditemukan -", 25, 70); }
        doc.save(`Laporan_${item.id.slice(0,5)}.pdf`);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="auth-modal-card" style={{ width: '550px', maxHeight: '80vh', overflow: 'hidden', display:'flex', flexDirection:'column' }}>
                <button onClick={onClose} style={{position:'absolute', top:'15px', right:'20px', background:'none', border:'none', fontSize:'24px', color:'var(--text-muted)', cursor:'pointer'}}>&times;</button>
                <h2 className="auth-title">Riwayat Cetak</h2>
                <p className="auth-subtitle">Arsip aktivitas Anda (Klik ZIP untuk cetak ulang).</p>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada riwayat.</div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} style={{
                                background: 'rgba(128,128,128,0.05)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '10px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: 'bold', fontSize: '13px', color: 'var(--text-main)'}}>
                                        {item.fileName || "Sertifikat"} ({item.qty} File)
                                    </div>
                                    <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop:'4px'}}>
                                        {new Date(item.date).toLocaleString()}
                                    </div>
                                </div>
                                
                                <div style={{display:'flex', gap:'5px'}}>
                                    {/* TOMBOL LOG PDF */}
                                    <button onClick={() => downloadReport(item)} style={{background: 'transparent', border:'1px solid var(--border-color)', color:'var(--text-main)', borderRadius:'6px', padding:'6px 10px', cursor:'pointer', fontSize:'10px'}}>
                                        📄 Log
                                    </button>

                                    {/* ✅ TOMBOL DOWNLOAD ZIP ULANG */}
                                    {item.fullData && item.fullData.length > 0 ? (
                                        <button 
                                            onClick={() => onReDownload(item)}
                                            style={{
                                                background: 'var(--primary-blue)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                        >
                                            ♻️ ZIP
                                        </button>
                                    ) : (
                                        <button disabled style={{background: 'gray', opacity: 0.5, border:'none', borderRadius:'6px', padding:'6px 10px', fontSize:'10px', color:'white', cursor:'not-allowed'}}>
                                            🚫 Expired
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;