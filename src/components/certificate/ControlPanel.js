import React, { useEffect, useRef } from 'react';

// --- HELPER COMPONENTS ---
const fontOptions = [
    { label: 'Modern', value: 'Montserrat' },
    { label: 'Sambung', value: 'Pinyon Script' },
    { label: 'Kaligrafi', value: 'Great Vibes' },
    { label: 'Klasik', value: 'Cinzel' },
    { label: 'Elegan', value: 'Playfair Display' },
];

const StableColorButton = ({ initialColor, onColorChange }) => {
    const previewRef = useRef(null);
    useEffect(() => { if (previewRef.current) previewRef.current.style.backgroundColor = initialColor; }, [initialColor]);
    const handleInput = (e) => { if (previewRef.current) previewRef.current.style.backgroundColor = e.target.value; };
    const handleChange = (e) => { onColorChange(e.target.value); };
    return (
        <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
            <div ref={previewRef} style={{ width: '100%', height: '100%', backgroundColor: initialColor, borderRadius: '6px', border: '1px solid var(--input-border)', cursor: 'pointer' }}></div>
            <input type="color" defaultValue={initialColor} onInput={handleInput} onChange={handleChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
        </div>
    );
};

// ✅ FIX: ImageUploader menerima onStyleChange
const ImageUploader = ({ label, imageSrc, onUpload, onRemove, imageStyle, onStyleChange, id }) => {
    return (
        <div className="file-upload-container">
            <span className="input-label" style={{marginBottom:'2px'}}>{label}</span>
            <div className="file-input-wrapper" style={{marginBottom:'5px'}}>
                {imageSrc ? (
                    <div className="preview-box">
                        <img src={imageSrc} alt="Preview" className="preview-thumb" />
                        <div className="file-check" style={{fontSize:'10px'}}>Terupload</div>
                        <button className="btn-icon btn-remove" onClick={onRemove} title="Hapus">×</button>
                    </div>
                ) : (
                    <input type="file" onChange={onUpload} accept="image/*" />
                )}
            </div>
            
            {/* Slider Kontrol hanya muncul jika ada gambar DAN onStyleChange tersedia */}
            {imageSrc && onStyleChange && (
                <div style={{display:'flex', gap:'5px'}}>
                    <div style={{flex:1}}>
                        <div style={{fontSize:'9px', color:'var(--text-muted)'}}>Ukuran</div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="3" 
                            step="0.1" 
                            value={imageStyle?.scale || 1} 
                            // Event handler yang benar
                            onChange={(e) => onStyleChange(id, 'scale', parseFloat(e.target.value))} 
                            className="zoom-slider" 
                            style={{width:'100%', height:'3px'}} 
                        />
                    </div>
                    <div style={{flex:1}}>
                        <div style={{fontSize:'9px', color:'var(--text-muted)'}}>Transparansi</div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={imageStyle?.opacity ?? 1} 
                            onChange={(e) => onStyleChange(id, 'opacity', parseFloat(e.target.value))} 
                            className="zoom-slider" 
                            style={{width:'100%', height:'3px'}} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const InputGroup = ({ label, value, setValue, id, textStyles, handleStyleChange }) => {
    const isDate = id === 'date';
    const toggleStyle = (field, currentVal, onVal, offVal) => { handleStyleChange(id, field, currentVal === onVal ? offVal : onVal); };

    return (
        <div className="input-box" style={{marginBottom:'15px'}}>
            <div className="input-label" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>{label}</span>
                <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                    <span style={{fontSize:'9px', fontWeight:'normal', textTransform:'none'}}>Font:</span>
                    <select value={textStyles[id]?.fontFamily || 'Montserrat'} onChange={(e) => handleStyleChange(id, 'fontFamily', e.target.value)} style={{width: '80px', height: '20px', padding: '0', fontSize: '9px'}}>
                        {fontOptions.map(font => ( <option key={font.value} value={font.value}>{font.label}</option> ))}
                    </select>
                </div>
            </div>
            <div style={{display:'flex', gap:'5px', alignItems:'center', marginBottom:'5px'}}>
                {id === 'desc' ? ( <textarea value={value} onChange={e=>setValue(e.target.value)} style={{flex:1}} placeholder="Isi teks..." /> ) : ( <input type={isDate ? "date" : "text"} value={value} onChange={e=>setValue(e.target.value)} style={{flex:1}} placeholder="Isi teks..." /> )}
                <StableColorButton initialColor={textStyles[id]?.color || '#000000'} onColorChange={(newColor) => handleStyleChange(id, 'color', newColor)} />
            </div>
            <div style={{display:'flex', gap:'8px', alignItems:'center', background:'var(--input-bg)', padding:'5px', borderRadius:'4px', border:'1px solid var(--input-border)'}}>
                <button onClick={() => toggleStyle('fontWeight', textStyles[id]?.fontWeight, 'bold', 'normal')} style={{fontWeight:'bold', background: textStyles[id]?.fontWeight === 'bold' ? 'var(--primary-blue)' : 'transparent', color: textStyles[id]?.fontWeight === 'bold' ? 'white' : 'var(--text-main)', border:'1px solid var(--input-border)', borderRadius:'3px', width:'24px', height:'24px', cursor:'pointer'}}>B</button>
                <button onClick={() => toggleStyle('fontStyle', textStyles[id]?.fontStyle, 'italic', 'normal')} style={{fontStyle:'italic', background: textStyles[id]?.fontStyle === 'italic' ? 'var(--primary-blue)' : 'transparent', color: textStyles[id]?.fontStyle === 'italic' ? 'white' : 'var(--text-main)', border:'1px solid var(--input-border)', borderRadius:'3px', width:'24px', height:'24px', cursor:'pointer'}}>I</button>
                <div style={{flex:1, display:'flex', alignItems:'center', gap:'5px'}}>
                    <span style={{fontSize:'9px', color:'var(--text-muted)'}}>Size</span>
                    <input type="range" min="10" max="100" step="1" value={textStyles[id]?.fontSize || 12} onChange={(e) => handleStyleChange(id, 'fontSize', parseInt(e.target.value))} className="zoom-slider" style={{flex:1, height:'3px'}} />
                    <span style={{fontSize:'9px', minWidth:'20px'}}>{textStyles[id]?.fontSize}</span>
                </div>
            </div>
        </div>
    );
};

// --- CONTROL PANEL UTAMA ---
const ControlPanel = ({ 
    theme, excelData, currentIndex, handlePrevData, handleNextData, handleExcelUpload, handleFile, 
    customBackground, setCustomBackground, logo, setLogo, signatureImg, setSignatureImg,
    handleRemoveLogo, handleRemoveSig, handleRemoveBg, handleRemoveData,
    imageStyles, handleImageStyleChange, 
    showQR, setShowQR, qrContent, setQrContent, qrColor, setQrColor, qrScale, setQrScale,
    heading, setHeading, name, setName, desc, setDesc, author, setAuthor, date, setDate,
    textStyles, handleStyleChange, generateQty, setGenerateQty, isPremium, FREE_LIMIT, handleMainAction, handleCancelProcess, loadingState,
    user, handleLogin, handleLogout 
}) => {
    
    const isLoading = loadingState === 'loading';
    const totalPrint = generateQty > 0 ? generateQty : excelData.length;
    const needPayment = totalPrint > FREE_LIMIT && !isPremium;

    // Logic Tampilan Akun
    let accountClass = 'guest';
    let displayRole = 'Guest Access';
    let displayIcon = '🕵️';

    if (user) {
        if (isPremium) {
            accountClass = 'admin';
            displayRole = 'Administrator';
            displayIcon = '👑';
        } else {
            accountClass = 'user';
            displayRole = 'Verified Member';
            displayIcon = '👤';
        }
    }

    return (
        <div className="right">
            <div className="form" style={{paddingTop: '5px'}}>
                
                {/* --- ACCOUNT CARD --- */}
                <div className={`account-card ${accountClass}`}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <div className="account-avatar">{displayIcon}</div>
                        <div className="account-info">
                            <div className="account-name">{user ? user.name : 'Tamu'}</div>
                            <div className="account-role">{displayRole}</div>
                        </div>
                    </div>
                    {user ? (
                        <button className="account-btn btn-logout-style" onClick={handleLogout}>Keluar</button>
                    ) : (
                        <button className="account-btn btn-login-style" onClick={handleLogin}>Masuk</button>
                    )}
                </div>

                {/* --- IMPORT DATA --- */}
                <div className="input-box" style={{marginBottom: '15px'}}>
                    <span className="input-label" style={{display:'flex', justifyContent:'space-between'}}>
                        IMPORT DATA (EXCEL)
                        {excelData.length > 0 && (
                            <button onClick={handleRemoveData} style={{background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#ef4444'}}>
                                Hapus 🗑️
                            </button>
                        )}
                    </span>
                    
                    <div className="file-upload-container">
                        <div className="file-input-wrapper">
                            {excelData.length > 0 ? (
                                <div className="preview-box">
                                    <div style={{fontSize:'16px'}}>📊</div>
                                    <div className="file-check" style={{fontWeight:'bold'}}>{excelData.length} Data Loaded</div>
                                    <div style={{display:'flex', gap:'2px'}}>
                                        <button onClick={handlePrevData} disabled={currentIndex === 0} style={{padding:'2px 6px', cursor:'pointer', opacity: currentIndex===0?0.5:1}}>◀</button>
                                        <span style={{fontSize:'10px', padding:'4px'}}>{currentIndex + 1}</span>
                                        <button onClick={handleNextData} disabled={currentIndex === excelData.length-1} style={{padding:'2px 6px', cursor:'pointer', opacity: currentIndex===excelData.length-1?0.5:1}}>▶</button>
                                    </div>
                                </div>
                            ) : (
                                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} />
                            )}
                        </div>
                    </div>
                </div>
                
                <hr style={{margin: '10px 0', borderColor: 'var(--border-color)'}}/>
                
                {/* GAMBAR */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom: '10px'}}>
                    <div style={{gridColumn: 'span 2'}}>
                        <ImageUploader label="Background" imageSrc={customBackground} theme={theme} onUpload={(e) => handleFile(e, setCustomBackground)} onRemove={handleRemoveBg} />
                    </div>
                    
                    {/* ✅ FIX: Props onStyleChange diteruskan dengan benar */}
                    <ImageUploader 
                        label="Logo" 
                        id="logo" 
                        imageSrc={logo} 
                        theme={theme} 
                        onUpload={(e) => handleFile(e, setLogo)} 
                        onRemove={handleRemoveLogo} 
                        imageStyle={imageStyles.logo} 
                        onStyleChange={handleImageStyleChange} 
                    />
                    
                    <ImageUploader 
                        label="Tanda Tangan" 
                        id="signature" 
                        imageSrc={signatureImg} 
                        theme={theme} 
                        onUpload={(e) => handleFile(e, setSignatureImg)} 
                        onRemove={handleRemoveSig} 
                        imageStyle={imageStyles.signature} 
                        onStyleChange={handleImageStyleChange} 
                    />
                </div>

                <hr style={{margin: '10px 0', borderColor: 'var(--border-color)'}}/>
                
                {/* TEKS */}
                <InputGroup label="Judul Sertifikat" value={heading} setValue={setHeading} id="heading" textStyles={textStyles} handleStyleChange={handleStyleChange} />
                <InputGroup label="Nama Peserta" value={name} setValue={setName} id="name" textStyles={textStyles} handleStyleChange={handleStyleChange} />
                <InputGroup label="Deskripsi" value={desc} setValue={setDesc} id="desc" textStyles={textStyles} handleStyleChange={handleStyleChange} />
                <InputGroup label="Penandatangan" value={author} setValue={setAuthor} id="author" textStyles={textStyles} handleStyleChange={handleStyleChange} />
                <InputGroup label="Tanggal" value={date} setValue={setDate} id="date" textStyles={textStyles} handleStyleChange={handleStyleChange} />
                
                <hr style={{margin: '10px 0', borderColor: 'var(--border-color)'}}/>

                {/* QR CODE */}
                <div className="input-box" style={{marginBottom:'10px'}}>
                    <div className="input-label" style={{marginBottom: '8px', display:'flex', justifyContent:'space-between'}}>
                        <span>QR CODE</span>
                        <label style={{position:'relative', display:'inline-block', width:'30px', height:'16px'}}>
                            <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} style={{opacity:0, width:0, height:0}} />
                            <span style={{position:'absolute', cursor:'pointer', top:0, left:0, right:0, bottom:0, backgroundColor: showQR ? 'var(--primary-blue)' : 'rgba(128,128,128,0.3)', transition:'.3s', borderRadius:'34px'}}></span>
                            <span style={{position:'absolute', content:"", height:'12px', width:'12px', left:'2px', bottom:'2px', backgroundColor:'white', transition:'.3s', borderRadius:'50%', transform: showQR ? 'translateX(14px)' : 'translateX(0)'}}></span>
                        </label>
                    </div>
                    {showQR && (
                        <>
                            <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'5px'}}>
                                <input type="text" value={qrContent} onChange={(e) => setQrContent(e.target.value)} placeholder="Link / Auto ID..." style={{flex: 1}} />
                                <StableColorButton initialColor={qrColor} onColorChange={setQrColor} />
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                <span style={{fontSize:'9px', color:'var(--text-muted)'}}>Ukuran</span>
                                <input type="range" min="0.5" max="2" step="0.1" value={qrScale} onChange={(e) => setQrScale(parseFloat(e.target.value))} className="zoom-slider" style={{flex:1, height:'3px'}} />
                            </div>
                        </>
                    )}
                </div>
                
                {/* GENERATE */}
                {excelData.length > 0 && (
                    <div className="input-box" style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '10px' }}>
                        <span className="input-label" style={{marginBottom: '5px'}}>Jumlah Cetak Otomatis:</span>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <input type="number" min="1" max={excelData.length} placeholder={`Max: ${excelData.length}`} value={generateQty > 0 ? generateQty : ''} onChange={e => setGenerateQty(parseInt(e.target.value) || 0)} style={{width: '80px'}} />
                            <div style={{fontSize: '10px', opacity: 0.6, alignSelf: 'center', fontStyle: 'italic'}}>(Kosong = Semua)</div>
                        </div>
                    </div>
                )}

                <button className="generate" onClick={isLoading ? handleCancelProcess : handleMainAction} style={{ background: isLoading ? '#ef4444' : (needPayment ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'linear-gradient(135deg, var(--primary-blue) 0%, #2563eb 100%)') }}>
                    {isLoading ? `❌ STOP / CANCEL` : (excelData.length > 0 ? (needPayment ? `💰 BAYAR & GENERATE (${totalPrint})` : `🖨️ GENERATE ZIP (${totalPrint})`) : `🖨️ DOWNLOAD PDF (PREVIEW)`)}
                </button>
            </div>
        </div>
    );
};
export default ControlPanel;