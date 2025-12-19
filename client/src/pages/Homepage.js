import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import '../styles/global.css';

import { createTransaction, loadSnapScript } from '../services/midtransService';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ControlPanel from '../components/certificate/ControlPanel';
import ComponentToPrint from '../components/certificate/Canvas';
import CustomModal from '../components/common/Modal';
import LoginModal from '../components/auth/LoginModal';
import HistoryModal from '../components/common/HistoryModal';

function Homepage() {
    const [theme, setTheme] = useState("dark");
    const [zoom, setZoom] = useState(0.55);
    const middleRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

    // --- USER STATE ---
    const [user, setUser] = useState(null); 
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
    const [showHistory, setShowHistory] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- INIT ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('access') === 'admin') {
            const storedAdmin = localStorage.getItem('adminUser');
            if (storedAdmin) { setUser(JSON.parse(storedAdmin)); setIsAdmin(true); } 
            else { setIsLoginModalOpen(true); }
        } else {
            const storedUser = localStorage.getItem('certUser');
            if (storedUser) { setUser(JSON.parse(storedUser)); setIsAdmin(false); }
        }

        // LOAD MIDTRANS SCRIPT
        loadSnapScript(process.env.REACT_APP_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXXXXXXXXXXXXXX'); 

    }, []);

    const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '' });
    const showModal = (cfg) => { setModal({ isOpen: true, type: 'alert', title: '', message: '', confirmText: 'OK', cancelText: 'Batal', onConfirm: null, ...cfg }); };
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        if (userData.role === 'admin') { setIsAdmin(true); localStorage.setItem('adminUser', JSON.stringify(userData)); } 
        else { setIsAdmin(false); localStorage.setItem('certUser', JSON.stringify(userData)); }
        setIsLoginModalOpen(false); 
        showModal({ title: 'Login Berhasil', message: `Selamat datang, ${userData.name}!`, type: 'alert', confirmText: 'Lanjut' });
    };

    const handleLoginClick = () => { setIsLoginModalOpen(true); };

    const confirmLogout = () => {
        showModal({ type: 'confirm', title: 'Konfirmasi Logout', message: 'Yakin ingin keluar?', confirmText: 'Logout', cancelText: 'Batal', onConfirm: () => { setUser(null); setIsAdmin(false); localStorage.removeItem('adminUser'); localStorage.removeItem('certUser'); closeModal(); }});
    };

    // --- ZOOM LOGIC ---
    useEffect(() => {
        const handleResize = () => { const w = window.innerWidth; if (w < 768) setZoom(0.35); else if (w < 1200) setZoom(0.45); else setZoom(0.55); };
        handleResize(); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                setZoom(p => parseFloat(Math.max(0.1, Math.min(p + delta, 2.0)).toFixed(2)));
            }
        };
        const el = middleRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => { if (el) el.removeEventListener('wheel', handleWheel); };
    }, []);

    const handleZoomIn = () => setZoom(p => Math.min(p + 0.05, 1.5));
    const handleZoomOut = () => setZoom(p => Math.max(p - 0.05, 0.1));

    // --- DATA STATE ---
    const [name, setName] = useState(''); 
    const [heading, setHeading] = useState(''); 
    const [desc, setDesc] = useState(''); 
    const [author, setAuthor] = useState(''); 
    const [date, setDate] = useState(''); 
    
    const [extraTexts, setExtraTexts] = useState([]);
    const [selectedId, setSelectedId] = useState(null); 

    const defaultStyle = { 
        color: '#000000', fontSize: 24, fontFamily: 'Montserrat', 
        fontWeight:'normal', fontStyle:'normal', textAlign: 'center', 
        width: 300, x: 0, y: 0 
    };

    const [textStyles, setTextStyles] = useState({ 
        heading: { ...defaultStyle, fontSize: 36, fontFamily: 'Cinzel', color: '#0e4573', y: 100 }, 
        name: { ...defaultStyle, fontSize: 72, fontFamily: 'Pinyon Script', color: '#33d5ac', fontWeight:'bold', y: 200 }, 
        desc: { ...defaultStyle, fontSize: 24, color: '#333333', y: 300, width: 600 }, 
        author: { ...defaultStyle, fontSize: 28, y: 500 }, 
        date: { ...defaultStyle, fontSize: 20, y: 550 } 
    });

    const handleAddText = () => {
        const newId = `extra-${Date.now()}`;
        const newText = { id: newId, text: 'Teks Baru', style: { ...defaultStyle, x: 100, y: 100 } };
        setExtraTexts([...extraTexts, newText]);
        setSelectedId(newId);
    };

    const handleDeleteText = (id) => {
        setExtraTexts(prev => prev.filter(t => t.id !== id));
        if(selectedId === id) setSelectedId(null);
    };

    const getTextStyle = (id) => {
        if (['heading', 'name', 'desc', 'author', 'date'].includes(id)) { return textStyles[id]; }
        const extra = extraTexts.find(t => t.id === id);
        return extra ? extra.style : defaultStyle;
    };

    const handleStyleChange = (id, field, value) => {
        if (['heading', 'name', 'desc', 'author', 'date'].includes(id)) {
            setTextStyles(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
        } else {
            setExtraTexts(prev => prev.map(t => t.id === id ? { ...t, style: { ...t.style, [field]: value } } : t));
        }
    };

    const updateTextContent = (id, val) => {
        if (id === 'heading') setHeading(val);
        else if (id === 'name') setName(val);
        else if (id === 'desc') setDesc(val);
        else if (id === 'author') setAuthor(val);
        else if (id === 'date') setDate(val);
        else { setExtraTexts(prev => prev.map(t => t.id === id ? { ...t, text: val } : t)); }
    };

    // --- ASSETS & QR ---
    const [showQR, setShowQR] = useState(true); 
    const [qrContent, setQrContent] = useState(''); 
    const [qrColor, setQrColor] = useState('#000000'); 
    
    const [qrStyle, setQrStyle] = useState({ x: 50, y: 600, width: 80 }); 
    const handleQrStyleChange = (field, value) => { setQrStyle(prev => ({ ...prev, [field]: value })); };

    const [generatedID, setGeneratedID] = useState(''); useEffect(() => { setGeneratedID(uuidv4().slice(0, 8).toUpperCase()); }, []);
    const [logo, setLogo] = useState(null); const [signatureImg, setSignatureImg] = useState(null); 
    
    // Custom Backgrounds Logic
    const [customBackgrounds, setCustomBackgrounds] = useState([]); 
    const [activeCustomBg, setActiveCustomBg] = useState(null);     
    const [template, setTemplate] = useState('template1'); 
    
    const [imageStyles, setImageStyles] = useState({ logo: { width: 150, x: 50, y: 50, opacity: 1 }, signature: { width: 150, x: 50, y: 50, opacity: 1 } });
    const handleImageStyleChange = (id, field, value) => { setImageStyles(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } })); };

    // --- EXCEL ---
    const [excelData, setExcelData] = useState([]); const [currentIndex, setCurrentIndex] = useState(0); const [generateQty, setGenerateQty] = useState(0);
    const abortRef = useRef(false);

    const handleExcelUpload = (e) => { 
        const file = e.target.files[0]; if(!file) return; 
        const reader = new FileReader(); 
        reader.onload = (event) => { 
            const wb = XLSX.read(event.target.result, { type: "binary" }); 
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); 
            setExcelData([...data]); setGenerateQty(data.length); setCurrentIndex(0); 
            if(data.length > 0) updateNameFromExcel(data[0]); 
            showModal({ title: 'Success', message: `${data.length} data berhasil dimuat.`, type: 'alert', confirmText: 'OK' }); 
        }; 
        reader.readAsBinaryString(file); e.target.value = null; 
    };

    const updateNameFromExcel = (row) => { const possibleKeys = ['Name', 'name', 'Nama', 'nama', 'Nama Lengkap']; let pName = "Unknown"; for (const key of possibleKeys) { if (row[key]) { pName = row[key]; break; } } if (pName === "Unknown") pName = Object.values(row)[0] || "Unknown"; setName(pName); setGeneratedID(uuidv4().slice(0, 8).toUpperCase()); };
    const handleNextData = () => { if (currentIndex < excelData.length - 1) { const nextIdx = currentIndex + 1; setCurrentIndex(nextIdx); updateNameFromExcel(excelData[nextIdx]); } };
    const handlePrevData = () => { if (currentIndex > 0) { const prevIdx = currentIndex - 1; setCurrentIndex(prevIdx); updateNameFromExcel(excelData[prevIdx]); } };
    const confirmRemoveData = () => { showModal({ type: 'confirm', title: 'Hapus Data?', message: 'Data Excel akan dihapus.', confirmText: 'Hapus', cancelText: 'Batal', onConfirm: () => { closeModal(); setExcelData([]); setGenerateQty(0); setName(''); } }); };
    
    // --- SIDEBAR HANDLERS ---
    const handleBackgroundUploadFromSidebar = (e) => { 
        if(e.target.files[0]) { 
            const reader = new FileReader(); 
            reader.onload = (x) => { 
                const newBg = x.target.result;
                setCustomBackgrounds(prev => [...prev, newBg]);
                setActiveCustomBg(newBg);
                setTemplate("custom"); 
            }; 
            reader.readAsDataURL(e.target.files[0]); 
        } 
    };
    const handleSelectCustomBg = (bgUrl) => { setActiveCustomBg(bgUrl); setTemplate("custom"); };
    const handleRemoveCustomBg = (e, indexToRemove) => { 
        e.stopPropagation(); 
        const newBgs = customBackgrounds.filter((_, idx) => idx !== indexToRemove);
        setCustomBackgrounds(newBgs);
        if (customBackgrounds[indexToRemove] === activeCustomBg) {
            if (newBgs.length > 0) { setActiveCustomBg(newBgs[0]); } 
            else { setActiveCustomBg(null); setTemplate('template1'); }
        }
    };
    const handleFile = (e, setter) => { if(e.target.files[0]) { const reader = new FileReader(); reader.onload = (x) => { setter(x.target.result); }; reader.readAsDataURL(e.target.files[0]); } };
    const confirmRemoveLogo = () => { setLogo(null); }; 
    const confirmRemoveSig = () => { setSignatureImg(null); };

    // --- GENERATE & PAYMENT LOGIC ---
    
    // Logic Simpan History (Hanya jika User Login)
    const saveToHistory = (count, cost) => { 
        if (!user) return; // Jika guest, tidak simpan history
        
        const usedData = excelData.slice(0, count); 
        const newEntry = { 
            id: uuidv4(), 
            date: new Date().toISOString(), 
            qty: count, 
            fileName: excelData.length > 0 ? "Excel Batch" : "Single PDF", 
            cost: cost, 
            fullData: usedData 
        }; 
        
        try { 
            const currentHistory = JSON.parse(localStorage.getItem(`history_${user.email}`) || '[]'); 
            localStorage.setItem(`history_${user.email}`, JSON.stringify([newEntry, ...currentHistory])); 
        } catch (e) {} 
    };

    const handleCancelProcess = () => { abortRef.current = true; setIsProcessing(false); closeModal(); };
    const handleHistoryReDownload = (item) => { setShowHistory(false); executeZip(item.qty, item.fullData); };
    const resetAllInputs = () => { setExcelData([]); setGenerateQty(0); setCurrentIndex(0); setName(''); setHeading(''); setDesc(''); setAuthor(''); setDate(''); setQrContent(''); setExtraTexts([]); };

    // LOGIC HITUNG HARGA
    const calculatePrice = (qty) => {
        if (qty <= 30) return 0;
        if (qty <= 100) return 30000;
        if (qty <= 150) return 50000;
        return 75000; 
    };

    // HANDLE UTAMA (Cek Guest/User & Harga)
    const handleMainAction = async () => {
        if(excelData.length === 0) { executeSinglePDF(); return; }

        const total = excelData.length; 
        const qty = generateQty > 0 ? generateQty : total;
        
        if (!user && qty > 30) { 
            showModal({ type: 'confirm', title: 'Login Diperlukan', message: 'Guest limit 30. Login untuk lanjut.', confirmText: 'Login', onConfirm: () => { closeModal(); setIsLoginModalOpen(true); } }); 
            return; 
        }

        const price = calculatePrice(qty);

        if (price > 0) {
            showModal({ 
                type: 'confirm', 
                title: 'Konfirmasi Pembayaran', 
                message: `Cetak ${qty} sertifikat.\nTotal: Rp ${price.toLocaleString('id-ID')}.\nLanjutkan ke pembayaran?`, 
                confirmText: 'Bayar Sekarang', 
                onConfirm: () => { 
                    closeModal(); 
                    processMidtransPayment(qty, price); 
                } 
            });
        } else {
            // Logika Gratis
            showModal({ type: 'confirm', title: 'Konfirmasi', message: `Cetak ${qty} sertifikat (Gratis)?`, confirmText: 'Mulai', onConfirm: () => { closeModal(); executeZip(qty, null, 0); } });
        }
    };

    // FUNGSI BARU: PROSES MIDTRANS
    const processMidtransPayment = async (qty, price) => {
        setIsProcessing(true);
        try {
            const orderData = {
                order_id: `CERT-${uuidv4().slice(0,8)}`,
                gross_amount: price,
                customer_details: {
                    first_name: user?.name || "Guest",
                    email: user?.email || "guest@example.com"
                },
                item_details: [{
                    id: "CERT-PRINT",
                    price: price,
                    quantity: 1,
                    name: `Cetak ${qty} Sertifikat`
                }]
            };

            console.log("Meminta token ke backend...");
            const snapToken = await createTransaction(orderData); 
            
            setIsProcessing(false);

            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function(result){
                        saveToHistory(qty, price);
                        executeZip(qty, null, price);
                    },
                    onPending: function(result){
                        showModal({ title: 'Pending', message: 'Menunggu pembayaran...', type: 'alert' });
                    },
                    onError: function(result){
                        showModal({ title: 'Gagal', message: 'Pembayaran gagal!', type: 'alert' });
                    },
                    onClose: function(){
                        showModal({ title: 'Batal', message: 'Anda menutup popup pembayaran.', type: 'alert' });
                    }
                });
            } else {
                alert("Snap script error/belum termuat. Refresh halaman.");
            }

        } catch (error) {
            setIsProcessing(false);
            showModal({ title: 'Error', message: 'Gagal memproses pembayaran: ' + error.message, type: 'alert' });
        }
    };

    const executeSinglePDF = async () => {
        const el = document.getElementById('print-area');
        setSelectedId(null); 
        await new Promise(r => setTimeout(r, 100)); 

        showModal({ type: 'loading', title: 'PDF...', progress: 0, total: 1 });
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${name || 'Certificate'}.pdf`);
            saveToHistory(1, 0); 
            closeModal(); 
            showModal({ title: 'Selesai', message: 'Berhasil!', type: 'alert', confirmText: 'OK', onConfirm: () => { closeModal(); resetAllInputs(); } });
        } catch (e) { closeModal(); alert("Gagal: " + e.message); }
    };

    const executeZip = async (qty, dataOverride = null, cost = 0) => {
        const el = document.getElementById('print-area');
        const source = dataOverride || excelData;
        if (!source || source.length === 0) return;
        
        setSelectedId(null); 
        abortRef.current = false; setIsProcessing(true);
        const zip = new JSZip();

        try {
            for (let i = 0; i < qty; i++) {
                if (abortRef.current) break;
                
                const person = source[i];
                if (!person) {
                    showModal({ 
                        title: 'Data Tidak Cukup', 
                        message: `Hanya ada ${source.length} data di Excel, tetapi Anda meminta ${qty}. Proses dihentikan pada data ke-${i}.`, 
                        type: 'alert' 
                    });
                    break;
                }

                showModal({ type: 'loading', title: 'Mencetak...', message: `${i+1}/${qty}`, progress: i + 1, total: qty, onCancel: handleCancelProcess });
                
                const possibleKeys = ['Name', 'name', 'Nama', 'nama']; let pName = "User";
                for (const key of possibleKeys) if (person[key]) { pName = person[key]; break; }
                const pID = uuidv4().slice(0, 8).toUpperCase();
                
                setName(pName); setGeneratedID(pID);
                await new Promise(r => setTimeout(r, 100)); 

                const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
                zip.file(`${pName}_${pID}.pdf`, pdf.output('blob'));
            }
            setIsProcessing(false);
            if (!abortRef.current) {
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, 'Certificates.zip');
                if (!dataOverride) saveToHistory(qty, cost); 
                showModal({ title: 'Selesai', message: 'Berhasil!', type: 'alert', onConfirm: () => { closeModal(); if(!dataOverride) resetAllInputs(); } });
            } 
        } catch (e) { setIsProcessing(false); closeModal(); alert(e.message); }
    };

    const finalQrValue = qrContent.trim() !== '' ? qrContent : generatedID;

    // --- PACKING PROPS ---
    const allTextProps = {
        heading, name, desc, author, date,
        styles: textStyles,
        extraTexts
    };

    return (
        <div className={`main ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
            <CustomModal config={modal} onClose={closeModal} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginSuccess} onShowAlert={showModal} />
            <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} user={user} onReDownload={handleHistoryReDownload} />
            
            <Header theme={theme} setTheme={setTheme} user={user} onHistoryClick={() => setShowHistory(true)} onLoginClick={handleLoginClick} onLogout={confirmLogout} />

            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -1000, opacity: 0, overflow: 'hidden', width: '1123px', height: '794px' }}>
                <div id="print-area" style={{width: '1123px', height: '794px'}}>
                    <ComponentToPrint 
                        isPreview={false}
                        template={template} 
                        {...allTextProps}
                        logo={logo} customBackground={activeCustomBg} signatureImg={signatureImg} 
                        showQR={showQR} qrValue={finalQrValue} qrColor={qrColor} imageStyles={imageStyles} 
                        qrStyle={qrStyle} zoom={1}
                    />
                </div>
            </div>

            <div className="maincontainer">
                <Sidebar 
                    isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} 
                    currentTemplate={template} setTemplate={setTemplate} 
                    onUploadBackground={handleBackgroundUploadFromSidebar}
                    customBackgrounds={customBackgrounds} activeCustomBg={activeCustomBg}
                    onSelectCustomBg={handleSelectCustomBg} onRemoveCustomBg={handleRemoveCustomBg} 
                    theme={theme} 
                />
                
                <div className="middle" ref={middleRef} title="Ctrl + Scroll untuk Zoom" onClick={() => setSelectedId(null)}>
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }} onClick={(e) => e.stopPropagation()}>
                        <ComponentToPrint 
                            id="template-area" 
                            isPreview={true} template={template} {...allTextProps}
                            selectedId={selectedId} setSelectedId={setSelectedId}
                            onStyleChange={handleStyleChange} handleImageStyleChange={handleImageStyleChange} handleQrStyleChange={handleQrStyleChange}
                            qrStyle={qrStyle} zoom={zoom}
                            logo={logo} customBackground={activeCustomBg} signatureImg={signatureImg} 
                            showQR={showQR} qrValue={finalQrValue} qrColor={qrColor} imageStyles={imageStyles} 
                        />
                    </div>
                    
                    <div className="zoom-controls-wrapper">
                        <button className="zoom-btn" onClick={handleZoomOut}>-</button>
                        <div className="zoom-label">{Math.round(zoom * 100)}%</div>
                        <button className="zoom-btn" onClick={handleZoomIn}>+</button>
                    </div>
                </div>

                <ControlPanel 
                    theme={theme} excelData={excelData} currentIndex={currentIndex}
                    handlePrevData={handlePrevData} handleNextData={handleNextData} handleRemoveData={confirmRemoveData} 
                    handleExcelUpload={handleExcelUpload} handleFile={handleFile} 
                    
                    heading={heading} name={name} desc={desc} author={author} date={date}
                    textStyles={textStyles} extraTexts={extraTexts}
                    handleAddText={handleAddText} updateTextContent={updateTextContent}
                    handleDeleteText={handleDeleteText}

                    getTextStyle={getTextStyle} handleStyleChange={handleStyleChange}
                    selectedId={selectedId} setSelectedId={setSelectedId}

                    customBackground={activeCustomBg} 
                    logo={logo} setLogo={setLogo} signatureImg={signatureImg} setSignatureImg={setSignatureImg}
                    handleRemoveLogo={confirmRemoveLogo} handleRemoveSig={confirmRemoveSig} 
                    imageStyles={imageStyles} handleImageStyleChange={handleImageStyleChange}

                    showQR={showQR} setShowQR={setShowQR} qrContent={qrContent} setQrContent={setQrContent} 
                    qrColor={qrColor} setQrColor={setQrColor} qrStyle={qrStyle}

                    generateQty={generateQty} setGenerateQty={setGenerateQty} isPremium={isAdmin} 
                    handleMainAction={handleMainAction} handleCancelProcess={handleCancelProcess} 
                    loadingState={isProcessing ? 'loading' : 'idle'}
                />
            </div>
        </div>
    );
}
export default Homepage;