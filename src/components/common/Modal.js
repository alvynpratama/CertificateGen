import React, { useState, useEffect } from 'react';

const CustomModal = ({ config, onClose, onConfirmInput, theme }) => {
    const [inputValue, setInputValue] = useState('');
    useEffect(() => { if (config.isOpen) setInputValue(''); }, [config.isOpen]);

    if (!config.isOpen) return null;

    const handleConfirmClick = () => {
        if (config.type === 'prompt') onConfirmInput(inputValue);
        else if (config.onConfirm) config.onConfirm();
        else onClose();
    };

    const isLoading = config.type === 'loading';
    const percent = config.total > 0 ? Math.round((config.progress / config.total) * 100) : 0;
    
    const modalBg = theme === 'dark' ? 'var(--panel-dark)' : 'var(--panel-light)';
    const modalColor = theme === 'dark' ? 'var(--text-light)' : 'var(--text-dark)';
    const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${isLoading ? 'loading' : ''}`} style={{background: modalBg, color: modalColor, border: `1px solid ${borderColor}`}}>
                
                <h3 style={{marginBottom: '10px'}}>{config.title}</h3>
                <p style={{whiteSpace: 'pre-line', color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)', fontSize:'14px', lineHeight:'1.5'}}>
                    {config.message}
                </p>
                
                {config.type === 'prompt' && (
                    <input type={config.isPassword ? "password" : "text"} placeholder={config.inputPlaceholder} value={inputValue} onChange={(e) => setInputValue(e.target.value)} autoFocus style={{background: theme === 'dark' ? '#0f172a' : '#f1f5f9', color: theme === 'dark' ? 'white' : 'black', border: '1px solid #cbd5e1', width: '100%', padding: '10px', borderRadius: '5px', marginTop: '15px'}} />
                )}

                {/* DISPLAY PERSENTASE LOADING */}
                {isLoading && (
                    <div style={{marginTop: '20px'}}>
                        <div style={{fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px'}}>
                            {percent}%
                        </div>
                        <div className="modal-progress-container" style={{margin: '0 auto', width: '100%'}}>
                            <div className="modal-progress-bar" style={{ width: `${percent}%` }}></div>
                        </div>
                    </div>
                )}

                <div className="modal-buttons" style={{marginTop: '25px'}}>
                    {(config.cancelText || isLoading) && (
                        <button 
                            className="btn-modal btn-cancel" 
                            onClick={config.onCancel || onClose}
                            style={{background: isLoading ? '#ef4444' : '', color: isLoading ? 'white' : ''}}
                        >
                            {isLoading ? '❌ Batalkan' : (config.cancelText || 'Batal')}
                        </button>
                    )}

                    {!isLoading && config.type !== 'alert' && config.type !== 'loading' && (
                        <button className="btn-modal btn-confirm" onClick={handleConfirmClick}>
                            {config.confirmText || 'Lanjutkan'}
                        </button>
                    )}

                    {config.type === 'alert' && !isLoading && (
                        <button className="btn-modal btn-confirm" onClick={handleConfirmClick}>
                            {config.confirmText || 'Mantap'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;