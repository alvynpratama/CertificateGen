import React, { useState, useEffect, useRef } from 'react';
import { loadWebFont } from '../../utils/fontLoader';

// --- IKON SVG (Sama) ---
const BoldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>;
const ItalicIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>;
const UploadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const PlayIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const StopIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/></svg>;
const PlusIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MinusIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const FileIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;

// --- MODERN NUMBER INPUT ---
const ModernNumberInput = ({ value, onChange, min = 0 }) => {
    const safeVal = value === '' ? 0 : parseInt(value);
    const handleDec = () => { if (safeVal > min) onChange(safeVal - 1); };
    const handleInc = () => { onChange(safeVal + 1); };
    const handleInput = (e) => { const val = e.target.value; if (val === '') onChange(''); else onChange(parseInt(val)); };

    return (
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-element)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', height: '36px', width: '100px' }}>
            <button onClick={handleDec} style={{ width: '30px', height: '100%', background: 'transparent', border: 'none', borderRight: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MinusIcon /></button>
            <input type="number" value={value} onChange={handleInput} style={{ flex: 1, width: '100%', border: 'none', background: 'transparent', color: 'var(--text-main)', textAlign: 'center', fontWeight: '600', fontSize: '13px', outline: 'none', appearance: 'textfield', MozAppearance: 'textfield' }} />
            <button onClick={handleInc} style={{ width: '30px', height: '100%', background: 'transparent', border: 'none', borderLeft: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlusIcon /></button>
            <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button {-webkit-appearance: none; margin: 0;}`}</style>
        </div>
    );
};

// --- CUSTOM HOOK ---
const useFonts = () => {
    const [fonts, setFonts] = useState([
        { family: 'Montserrat' }, { family: 'Cinzel' }, { family: 'Pinyon Script' },
        { family: 'Playfair Display' }, { family: 'Great Vibes' }, { family: 'Inter' }
    ]);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${API_URL}/fonts`);
                if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFonts(prev => {
                        const existing = new Set(prev.map(f => f.family));
                        const uniqueNew = data.filter(f => !existing.has(f.family));
                        return [...prev, ...uniqueNew];
                    });
                }
            } catch (e) { console.error("Font fetch error:", e); }
        };
        fetchFonts();
    }, []);

    return fonts;
};

// --- SEARCHABLE FONT DROPDOWN ---
const FontDropdown = ({ value, onChange, fonts, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    // Filter Fonts (Max 50 result agar tidak lag saat render)
    const filtered = fonts.filter(f => f.family.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (fontFamily) => {
        loadWebFont(fontFamily);
        onChange(fontFamily);
        setSearch(''); 
        setIsOpen(false);
    };

    return (
        <div className="font-dropdown-wrapper" ref={wrapperRef} style={{position:'relative', flex:1}}>
            <div 
                className="font-dropdown-trigger" 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    background:'var(--bg-main)', border:'1px solid var(--border-color)',
                    borderRadius:'6px', padding:'0 10px', height:'36px', cursor:'pointer',
                    color:'var(--text-main)', fontSize:'13px'
                }}
            >
                <span style={{fontFamily: value, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'120px'}}>
                    {value || 'Pilih Font'}
                </span>
                <ChevronDown />
            </div>

            {isOpen && (
                <div style={{
                    position:'absolute', top:'100%', left:0, right:0, zIndex:1000,
                    backgroundColor: theme === 'dark' ? '#252525' : '#ffffff', 
                    border: '1px solid var(--border-color)',
                    borderRadius:'6px', marginTop:'5px', 
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    maxHeight:'250px', overflowY:'auto', display:'flex', flexDirection:'column'
                }}>
                    <input 
                        type="text" 
                        placeholder="Cari dari 1000+ font..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                        style={{
                            margin:'8px', padding:'8px', 
                            background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                            border:'1px solid var(--border-color)', borderRadius:'4px',
                            color:'var(--text-main)', fontSize:'12px', outline:'none'
                        }}
                        onClick={(e) => e.stopPropagation()} 
                    />
                    
                    {filtered.length > 0 ? filtered.map((f, i) => (
                        <div 
                            key={i}
                            onClick={() => handleSelect(f.family)}
                            style={{
                                padding:'10px 12px', cursor:'pointer', fontSize:'14px',
                                fontFamily: f.family, 
                                color: value === f.family ? 'var(--primary)' : 'var(--text-main)',
                                background: value === f.family ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee') : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.02)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f0f0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = value === f.family ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee') : 'transparent'}
                        >
                            {f.family}
                        </div>
                    )) : (
                        <div style={{padding:'10px', textAlign:'center', fontSize:'12px', color:'var(--text-muted)'}}>
                            Font "{search}" tidak ditemukan.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- TOOLBAR (UPDATED) ---
const StyleToolbar = ({ fieldKey, styleData, handleStyleChange, fonts, theme }) => { 
    const style = styleData || {};
    const externalFontSize = style.fontSize ? Math.round(parseFloat(style.fontSize)) : 12;
    const [inputValue, setInputValue] = useState(externalFontSize);

    useEffect(() => { if (!isNaN(externalFontSize)) setInputValue(externalFontSize); }, [externalFontSize]);
    if (!style) return null;

    const changeFontSize = (delta) => { const newSize = Math.max(1, externalFontSize + delta); handleStyleChange(fieldKey, 'fontSize', newSize); };
    const handleManualChange = (e) => { const val = e.target.value; setInputValue(val); if (val !== '') { const num = parseInt(val); if (!isNaN(num)) handleStyleChange(fieldKey, 'fontSize', num); } };
    const handleBlur = () => { if (inputValue === '' || inputValue < 1) { handleStyleChange(fieldKey, 'fontSize', 12); setInputValue(12); } else { setInputValue(externalFontSize); } };

    return (
        <div className="style-toolbar" onClick={(e) => e.stopPropagation()}>
            <div className="toolbar-row" style={{marginBottom:'8px'}}>
                
                {/* SEARCHABLE FONT SELECTOR */}
                <FontDropdown 
                    value={style.fontFamily || 'Montserrat'} 
                    onChange={(val) => handleStyleChange(fieldKey, 'fontFamily', val)}
                    fonts={fonts} 
                    theme={theme}
                />

                <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--text-muted)', overflow: 'hidden', background: style.color || '#000000', flexShrink: 0 }}>
                    <input type="color" value={style.color || '#000000'} onInput={(e) => handleStyleChange(fieldKey, 'color', e.target.value)} style={{position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', cursor: 'pointer'}} />
                </div>
            </div>

            <div className="toolbar-row" style={{justifyContent: 'space-between'}}>
                <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                    <span style={{fontSize:'9px', color:'var(--text-muted)'}}>Ukuran</span>
                    <div className="font-control-wrapper" style={{width: '100px'}}>
                        <button onClick={() => changeFontSize(-2)} className="font-btn"><MinusIcon /></button>
                        <input type="number" className="font-input no-spin" value={inputValue} onChange={handleManualChange} onBlur={handleBlur} style={{width: '40px', textAlign:'center', fontWeight:'bold'}} />
                        <button onClick={() => changeFontSize(2)} className="font-btn"><PlusIcon /></button>
                    </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                    <span style={{fontSize:'9px', color:'var(--text-muted)'}}>Gaya</span>
                    <div style={{display:'flex', gap:'5px', height:'36px', alignItems:'center'}}>
                        <button className={`toolbar-btn ${style.fontWeight === 'bold' ? 'active' : ''}`} onClick={() => handleStyleChange(fieldKey, 'fontWeight', style.fontWeight === 'bold' ? 'normal' : 'bold')} style={{width:'32px', height:'32px', padding:0, display:'flex', alignItems:'center', justifyContent:'center'}}><BoldIcon /></button>
                        <button className={`toolbar-btn ${style.fontStyle === 'italic' ? 'active' : ''}`} onClick={() => handleStyleChange(fieldKey, 'fontStyle', style.fontStyle === 'italic' ? 'normal' : 'italic')} style={{width:'32px', height:'32px', padding:0, display:'flex', alignItems:'center', justifyContent:'center'}}><ItalicIcon /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlPanel = (props) => {
    const { 
        theme, excelData, currentIndex, handlePrevData, handleNextData, handleRemoveData, handleExcelUpload, handleFile,
        heading, name, desc, author, date, extraTexts, handleAddText, updateTextContent, getTextStyle, handleStyleChange,
        selectedId, setSelectedId, logo, handleRemoveLogo, setLogo, signatureImg, handleRemoveSig, setSignatureImg,
        imageStyles, handleImageStyleChange, showQR, setShowQR, qrContent, setQrContent, qrColor, setQrColor, 
        generateQty, setGenerateQty, handleMainAction, handleCancelProcess, loadingState, handleDeleteText 
    } = props;

    const isLoading = loadingState === 'loading';
    const panelRef = useRef(null);
    const handleFocus = (id) => setSelectedId(id);
    const handleQtyUpdate = (newVal) => { if (newVal === '') setGenerateQty(''); else setGenerateQty(newVal); };

    // --- LOAD FONTS ONCE ---
    const availableFonts = useFonts();

    const renderInput = (id, placeholder, value) => {
        const currentStyle = getTextStyle ? getTextStyle(id) : {};
        return (
            <div className="input-group" key={id}>
                <input type="text" className="input-field" placeholder={placeholder} value={value} onChange={(e) => updateTextContent(id, e.target.value)} onFocus={() => handleFocus(id)} />
                {selectedId === id && <StyleToolbar fieldKey={id} styleData={currentStyle} handleStyleChange={handleStyleChange} fonts={availableFonts} theme={theme} />}
            </div>
        );
    };

    return (
        <div className="control-panel" ref={panelRef}>
            {/* DATA PESERTA */}
            <div className="panel-section">
                <span className="panel-label">DATA PESERTA</span>
                {excelData.length === 0 ? (
                    <div style={{display:'flex', gap:'8px'}}>
                        <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} style={{display:'none'}} id="excel-upload" />
                        <label htmlFor="excel-upload" className="btn-secondary" style={{flex:1, justifyContent:'center'}}><UploadIcon /> Upload Excel</label>
                    </div>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        <div className="file-info-box">
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><FileIcon /><span className="file-name">Excel ({excelData.length})</span></div>
                            <button onClick={handleRemoveData} className="btn-danger" style={{width:'auto', padding:'6px 10px', fontSize:'11px'}}>Hapus</button>
                        </div>
                        <div style={{marginTop:'5px', padding:'10px', background:'var(--bg-element)', border:'1px solid var(--border-color)', borderRadius:'6px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'8px', color:'var(--text-main)'}}><span>Row {currentIndex + 1}</span><strong>{excelData[currentIndex]?.Name || name}</strong></div>
                            <div style={{display:'flex', gap:'8px'}}><button className="btn-secondary" style={{padding:'4px'}} onClick={handlePrevData} disabled={currentIndex === 0}>←</button><button className="btn-secondary" style={{padding:'4px'}} onClick={handleNextData} disabled={currentIndex === excelData.length - 1}>→</button></div>
                        </div>
                    </div>
                )}
            </div>

            {/* KONTEN SERTIFIKAT */}
            <div className="panel-section">
                <span className="panel-label">KONTEN SERTIFIKAT</span>
                {renderInput('heading', 'Judul Sertifikat', heading)}
                
                <div className="input-group">
                    <input type="text" className="input-field" placeholder="Nama Peserta" value={name} onChange={(e) => updateTextContent('name', e.target.value)} onFocus={() => handleFocus('name')} />
                    <div style={{fontSize:'10px', color:'var(--text-muted)', marginTop:'2px', marginLeft:'2px'}}>Gunakan tanda titik koma (;) untuk banyak nama</div>
                    {selectedId === 'name' && <StyleToolbar fieldKey="name" styleData={getTextStyle('name')} handleStyleChange={handleStyleChange} fonts={availableFonts} theme={theme} />}
                </div>

                <div className="input-group">
                    <textarea className="input-field" rows="3" placeholder="Deskripsi..." value={desc} onChange={(e) => updateTextContent('desc', e.target.value)} onFocus={() => handleFocus('desc')} style={{resize:'none'}} />
                    {selectedId === 'desc' && <StyleToolbar fieldKey="desc" styleData={getTextStyle('desc')} handleStyleChange={handleStyleChange} fonts={availableFonts} theme={theme} />}
                </div>

                {extraTexts && extraTexts.map((t, idx) => (
                    <div key={t.id} style={{marginBottom:'10px'}}>
                        <div style={{display:'flex', gap:'5px'}}>
                            <input type="text" className="input-field" placeholder={`Teks Tambahan ${idx + 1}`} value={t.text} onChange={(e) => updateTextContent(t.id, e.target.value)} onFocus={() => handleFocus(t.id)} />
                            <button onClick={() => handleDeleteText(t.id)} className="btn-danger" style={{width:'36px', padding:0, display:'flex', alignItems:'center', justifyContent:'center'}}><TrashIcon/></button>
                        </div>
                        {selectedId === t.id && <StyleToolbar fieldKey={t.id} styleData={getTextStyle(t.id)} handleStyleChange={handleStyleChange} fonts={availableFonts} theme={theme} />}
                    </div>
                ))}

                <button onClick={handleAddText} className="btn-secondary" style={{marginBottom:'15px', borderStyle:'dashed', fontSize:'11px'}}><PlusIcon /> Tambah Teks</button>
                {renderInput('author', 'Penandatangan', author)}
                <div className="input-group">
                    <input type="date" className="input-field" value={date} onChange={(e) => updateTextContent('date', e.target.value)} onFocus={() => handleFocus('date')} />
                    {selectedId === 'date' && <StyleToolbar fieldKey="date" styleData={getTextStyle('date')} handleStyleChange={handleStyleChange} fonts={availableFonts} theme={theme} />}
                </div>
            </div>

            {/* GAMBAR & QR */}
            <div className="panel-section">
                <span className="panel-label">LOGO & QR CODE</span>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                    <div>
                        <input type="file" id="logo-up" hidden onChange={(e) => handleFile(e, setLogo)} />
                        {logo ? (<div style={{background:'var(--bg-element)', padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center'}}><span style={{fontSize:'11px', fontWeight:'bold', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80px', color:'var(--text-main)'}}>Logo.png</span><button onClick={handleRemoveLogo} style={{background:'none', border:'none', color:'var(--danger)', padding:0, cursor:'pointer'}}><TrashIcon/></button></div>) : (<label htmlFor="logo-up" className="btn-secondary" style={{fontSize:'11px', padding:'8px', justifyContent:'center', width:'100%', boxSizing:'border-box'}}><PlusIcon/> Logo</label>)}
                    </div>
                    <div>
                        <input type="file" id="sig-up" hidden onChange={(e) => handleFile(e, setSignatureImg)} />
                        {signatureImg ? (<div style={{background:'var(--bg-element)', padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center'}}><span style={{fontSize:'11px', fontWeight:'bold', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80px', color:'var(--text-main)'}}>TTD.png</span><button onClick={handleRemoveSig} style={{background:'none', border:'none', color:'var(--danger)', padding:0, cursor:'pointer'}}><TrashIcon/></button></div>) : (<label htmlFor="sig-up" className="btn-secondary" style={{fontSize:'11px', padding:'8px', justifyContent:'center', width:'100%', boxSizing:'border-box'}}><PlusIcon/> TTD</label>)}
                    </div>
                </div>
                <div style={{background:'var(--bg-element)', padding:'10px', borderRadius:'6px', border:'1px solid var(--border-color)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}><span style={{fontSize:'12px', fontWeight:'600', color:'var(--text-main)'}}>QR Code</span><input type="checkbox" checked={showQR} onChange={() => setShowQR(!showQR)} /></div>
                    {showQR && (<div style={{display:'flex', flexDirection:'column', gap:'8px'}}><input type="text" className="input-field" placeholder="Isi QR..." value={qrContent} onChange={(e) => setQrContent(e.target.value)} style={{fontSize:'12px', padding:'6px'}} /><div style={{display:'flex', alignItems:'center', gap:'8px', justifyContent:'space-between'}}><span style={{fontSize:'11px', color:'var(--text-muted)'}}>Warna</span><div style={{width:'32px', height:'32px', overflow:'hidden', borderRadius:'6px', border:'1px solid var(--text-muted)', position:'relative', flexShrink: 0, background: qrColor}}><input type="color" value={qrColor} onInput={(e) => setQrColor(e.target.value)} style={{position:'absolute', top:'-10px', left:'-10px', width:'200%', height:'200%', cursor:'pointer', opacity: 0}} /></div></div></div>)}
                </div>
            </div>

            {/* ACTION */}
            <div className="panel-section" style={{marginTop:'auto', paddingTop:'15px', borderTop:'1px solid var(--border-color)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                     <span style={{fontSize:'11px', color:'var(--text-muted)'}}>Total Sertifikat</span>
                     <ModernNumberInput value={generateQty} onChange={handleQtyUpdate} />
                </div>
                {isLoading ? <button className="btn-danger" onClick={handleCancelProcess}><StopIcon /> Stop</button> : <button className="btn-primary" onClick={handleMainAction}><PlayIcon /> Generate</button>}
            </div>
        </div>
    );
};

export default ControlPanel;