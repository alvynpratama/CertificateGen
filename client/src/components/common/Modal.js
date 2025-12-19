import React from 'react';

const CustomModal = ({ config, onClose }) => {
    const { isOpen, type, title, message, confirmText, cancelText, onConfirm, progress, total } = config;

    if (!isOpen) return null;

    // Hitung persentase untuk Loading Bar
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

    return (
        <div className="modal-overlay" onClick={type !== 'loading' ? onClose : undefined}>
            <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{textAlign: 'center', width: '380px', padding: '30px'}}>
                
                {/* 1. HEADER / TITLE */}
                <div className="auth-title" style={{fontSize: '22px', marginBottom: '10px'}}>
                    {title || 'Notification'}
                </div>

                {/* 2. BODY / MESSAGE */}
                <div style={{
                    color: 'var(--text-main)', 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    marginBottom: '25px',
                    fontWeight: '500'
                }}>
                    {message.split('\n').map((line, i) => (
                        <span key={i}>{line}<br/></span>
                    ))}
                </div>

                {/* 3. KONTEN KHUSUS BERDASARKAN TIPE */}
                
                {/* TIPE: LOADING (Progress Bar) */}
                {type === 'loading' && (
                    <div style={{width: '100%', marginBottom: '10px'}}>
                        <div style={{
                            width: '100%', 
                            height: '10px', 
                            background: 'var(--input-bg)', 
                            borderRadius: '5px', 
                            overflow: 'hidden',
                            border: 'var(--input-border)'
                        }}>
                            <div style={{
                                width: `${percentage}%`, 
                                height: '100%', 
                                background: 'var(--primary-gradient)', 
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        <div style={{fontSize: '12px', marginTop: '8px', color: 'var(--text-muted)'}}>
                            {percentage}% Complete
                        </div>
                        {config.onCancel && (
                            <button 
                                onClick={config.onCancel} 
                                className="btn-danger" 
                                style={{marginTop: '15px', padding: '8px 16px', width: 'auto', marginInline: 'auto', fontSize: '11px'}}
                            >
                                Batalkan Proses
                            </button>
                        )}
                    </div>
                )}

                {/* TIPE: ALERT */}
                {type === 'alert' && (
                    <button className="btn-primary" onClick={onConfirm || onClose}>
                        {confirmText || 'OK'}
                    </button>
                )}

                {/* TIPE: CONFIRM */}
                {type === 'confirm' && (
                    <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                        <button className="btn-secondary" onClick={onClose} style={{flex: 1}}>
                            {cancelText || 'Batal'}
                        </button>
                        <button className="btn-primary" onClick={onConfirm} style={{flex: 1}}>
                            {confirmText || 'Lanjut'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomModal;