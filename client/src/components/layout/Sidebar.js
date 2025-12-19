import React from 'react';
import templateImages from '../../assets/templates';

// Icon Templates
const TemplateIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const ChevronLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

const Sidebar = ({ 
    currentTemplate, setTemplate, 
    onUploadBackground, 
    customBackgrounds, activeCustomBg, onSelectCustomBg, onRemoveCustomBg,
    theme, isOpen, setIsOpen 
}) => {
    
    const templates = Object.keys(templateImages).filter(k => k !== 'custom');

    return (
        <>
            <button 
                className="sidebar-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Tutup Template" : "Buka Template"}
                style={{ left: isOpen ? '260px' : '0' }} 
            >
                {isOpen ? <ChevronLeft /> : <MenuIcon />} 
            </button>

            <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>Pilih Template</h3>
                </div>

                <div className="template-grid">
                    {/* 1. TOMBOL UPLOAD */}
                    <div className="template-item" onClick={() => document.getElementById('bg-upload-sidebar').click()}>
                        <input type="file" id="bg-upload-sidebar" hidden accept="image/*" onChange={onUploadBackground} />
                        <div className="upload-placeholder">
                            <UploadIcon />
                            <span>Upload</span>
                        </div>
                    </div>

                    {/* 2. CUSTOM BACKGROUNDS */}
                    {customBackgrounds && customBackgrounds.map((bg, idx) => (
                        <div 
                            key={`custom-${idx}`} 
                            className={`template-item ${currentTemplate === 'custom' && activeCustomBg === bg ? 'active' : ''}`}
                            onClick={() => onSelectCustomBg(bg)}
                        >
                            <img src={bg} alt={`Custom ${idx}`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            
                            {/* Tombol Hapus per item */}
                            <button 
                                onClick={(e) => onRemoveCustomBg(e, idx)} 
                                className="btn-remove-bg"
                                title="Hapus"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* 3. DEFAULT TEMPLATES */}
                    {templates.map((key) => (
                        <div 
                            key={key} 
                            className={`template-item ${currentTemplate === key ? 'active' : ''}`}
                            onClick={() => { setTemplate(key); }} 
                        >
                            <img src={templateImages[key]} alt={key} loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;