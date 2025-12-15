import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import '../styles/global.css';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ControlPanel from '../components/certificate/ControlPanel';
import ComponentToPrint from '../components/certificate/Canvas';
import CustomModal from '../components/common/Modal';
import AdminModal from '../components/common/AdminModal';
import HistoryModal from '../components/common/HistoryModal';

class BulkComponentToPrint extends React.PureComponent { render() { return null; } }

function Homepage() {
    const [theme, setTheme] = useState("dark");
    const [zoom, setZoom] = useState(0.55);
    
    // --- USER & AUTH STATE ---
    const [user, setUser] = useState(null); 
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false); 
    const [isAuthModalAdmin, setIsAuthModalAdmin] = useState(false); 
    const [showHistory, setShowHistory] = useState(false);

    // --- STATE BARU: STATUS PROSES ---
    const [isProcessing, setIsProcessing] = useState(false);

    // --- INIT ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isUrlAdmin = params.get('access') === 'admin';

        if (isUrlAdmin) {
            const storedAdmin = localStorage.getItem('adminUser');
            const storedToken = localStorage.getItem('adminToken');
            if (storedAdmin && storedToken) {
                try {
                    const parsedAdmin = JSON.parse(storedAdmin);
                    if (parsedAdmin.role === 'admin') {
                        setUser(parsedAdmin);
                        setIsAdmin(true);
                    } else { throw new Error("Bukan admin"); }
                } catch (e) {
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('adminToken');
                }
            } else {
                setIsAuthModalAdmin(true);
                setShowAuthModal(true);
            }
        } else {
            const storedUser = localStorage.getItem('certUser');
            const storedToken = localStorage.getItem('certToken');
            if (storedUser && storedToken) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAdmin(false);
                } catch (e) {
                    localStorage.removeItem('certUser');
                    localStorage.removeItem('certToken');
                }
            }
        }
    }, []);

    const handleLoginSuccess = (userData, authToken) => {
        setUser(userData);
        if (userData.role === 'admin') {
            setIsAdmin(true);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            localStorage.setItem('adminToken', authToken);
        } else {
            setIsAdmin(false);
            localStorage.setItem('certUser', JSON.stringify(userData));
            localStorage.setItem('certToken', authToken);
        }
        showModal({ title: 'Login Berhasil', message: `Selamat datang, ${userData.name}!`, type: 'alert', confirmText: 'Lanjut' });
    };

    const handleLogout = () => {
        if (isAdmin) {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            setIsAdmin(false);
        } else {
            localStorage.removeItem('certUser');
            localStorage.removeItem('certToken');
        }
        setUser(null);
        showModal({ title: 'Logout', message: 'Anda telah keluar.', type: 'alert' });
    };

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 380) setZoom(0.24); else if (w < 500) setZoom(0.28); else if (w < 768) setZoom(0.4); else if (w < 1200) setZoom(0.5); else setZoom(0.55);
        };
        handleResize(); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize);
    }, []);
    const handleZoomChange = (e) => setZoom(parseFloat(e.target.value));

    // --- DATA ---
    const [name, setName] = useState(''); const [heading, setHeading] = useState(''); const [desc, setDesc] = useState(''); const [author, setAuthor] = useState(''); const [date, setDate] = useState(''); 
    const [showQR, setShowQR] = useState(true); const [qrContent, setQrContent] = useState(''); const [qrColor, setQrColor] = useState('#000000'); const [qrScale, setQrScale] = useState(1); 
    const [generatedID, setGeneratedID] = useState(''); useEffect(() => { setGeneratedID(uuidv4().slice(0, 8).toUpperCase()); }, []);
    
    const [textStyles, setTextStyles] = useState({ heading: { color: '#0e4573', fontSize: 36, fontFamily: 'Cinzel', fontWeight:'normal', fontStyle:'normal' }, name: { color: '#33d5ac', fontSize: 72, fontFamily: 'Pinyon Script', fontWeight:'bold', fontStyle:'normal' }, desc: { color: '#333333', fontSize: 24, fontFamily: 'Montserrat', fontWeight:'normal', fontStyle:'normal' }, author: { color: '#000000', fontSize: 28, fontFamily: 'Montserrat', fontWeight:'normal', fontStyle:'normal' }, date: { color: '#000000', fontSize: 20, fontFamily: 'Montserrat', fontWeight:'normal', fontStyle:'normal' } });
    const handleStyleChange = (key, field, value) => { setTextStyles(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } })); };
    const [logo, setLogo] = useState(null); const [signatureImg, setSignatureImg] = useState(null); const [customBackground, setCustomBackground] = useState(null); const [template, setTemplate] = useState('template4'); 
    
    const [imageStyles, setImageStyles] = useState({ logo: {scale:1, opacity:1}, signature: {scale:1, opacity:1} });
    const handleImageStyleChange = (id, field, value) => { setImageStyles(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } })); };

    // --- EXCEL ---
    const [excelData, setExcelData] = useState([]); const [currentIndex, setCurrentIndex] = useState(0); const [generateQty, setGenerateQty] = useState(0);
    
    // --- MODAL ---
    const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '' });
    const showModal = (cfg) => { setModal({ isOpen: true, type: 'alert', title: '', message: '', confirmText: 'OK', cancelText: 'Batal', onConfirm: null, ...cfg }); };
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));
    const abortRef = useRef(false);
    const [dragPositions, setDragPositions] = useState({});
    const handleDrag = (id, newPos) => { setDragPositions(prev => ({...prev, [id]: newPos})); };

    const handleExcelUpload = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (event) => { const wb = XLSX.read(event.target.result, { type: "binary" }); const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); setExcelData([...data]); setGenerateQty(data.length); setCurrentIndex(0); if(data.length > 0) updateNameFromExcel(data[0]); showModal({ title: 'Success', message: `✅ ${data.length} data dimuat.`, type: 'alert', confirmText: 'Lanjut' }); }; reader.readAsBinaryString(file); e.target.value = null; };
    const updateNameFromExcel = (row) => { const possibleKeys = ['Name', 'name', 'Nama', 'nama', 'Nama Lengkap']; let pName = "Unknown"; for (const key of possibleKeys) { if (row[key]) { pName = row[key]; break; } } if (pName === "Unknown") pName = Object.values(row)[0] || "Unknown"; setName(pName); setGeneratedID(uuidv4().slice(0, 8).toUpperCase()); };
    const handleNextData = () => { if (currentIndex < excelData.length - 1) { const nextIdx = currentIndex + 1; setCurrentIndex(nextIdx); updateNameFromExcel(excelData[nextIdx]); } };
    const handlePrevData = () => { if (currentIndex > 0) { const prevIdx = currentIndex - 1; setCurrentIndex(prevIdx); updateNameFromExcel(excelData[prevIdx]); } };
    
    // POP-UPS
    const confirmRemoveData = () => { showModal({ type: 'confirm', title: 'Hapus Data?', message: 'Semua data Excel akan dihapus.', confirmText: 'Hapus', cancelText: 'Batal', onConfirm: () => { closeModal(); setExcelData([]); setGenerateQty(0); setName(''); setCurrentIndex(0); } }); };
    const confirmRemoveLogo = () => { showModal({ type: 'confirm', title: 'Hapus Logo?', message: 'Logo akan dihapus.', confirmText: 'Hapus', cancelText: 'Batal', onConfirm: () => { setLogo(null); closeModal(); } }); };
    const confirmRemoveSig = () => { showModal({ type: 'confirm', title: 'Hapus Tanda Tangan?', message: 'Tanda tangan akan dihapus.', confirmText: 'Hapus', cancelText: 'Batal', onConfirm: () => { setSignatureImg(null); closeModal(); } }); };
    const confirmRemoveBg = () => { showModal({ type: 'confirm', title: 'Hapus Background?', message: 'Background akan direset.', confirmText: 'Hapus', cancelText: 'Batal', onConfirm: () => { setCustomBackground(null); setTemplate('template4'); closeModal(); } }); };

    const handleFile = (e, setter) => { if(e.target.files[0]) { const reader = new FileReader(); reader.onload = (x) => { setter(x.target.result); if(setter === setCustomBackground) setTemplate("custom"); }; reader.readAsDataURL(e.target.files[0]); } };
    const handleCancelProcess = () => { abortRef.current = true; setIsProcessing(false); closeModal(); };
    const handleManualResize = () => {}; 
    const saveToDatabase = async () => {}; 

    // --- ✅ SIMPAN RIWAYAT (DENGAN DATA LENGKAP) ---
    const saveToHistory = (count) => {
        if (!user) return; 
        
        // Simpan Data Excel yang dipakai (Agar bisa regenerate)
        // Note: Max 5MB LocalStorage, hati-hati jika data sangat banyak
        const usedData = excelData.slice(0, count);

        const newEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            qty: count,
            fileName: excelData.length > 0 ? "Excel Batch" : "Single PDF",
            paid: count > 30 && !isAdmin,
            fullData: usedData // SIMPAN DATA MENTAH
        };

        try {
            const currentHistory = JSON.parse(localStorage.getItem(`history_${user.email}`) || '[]');
            const updatedHistory = [newEntry, ...currentHistory];
            localStorage.setItem(`history_${user.email}`, JSON.stringify(updatedHistory));
        } catch (e) {
            console.error("Storage penuh, gagal simpan riwayat detail");
        }
    };

    // --- ✅ FUNGSI RE-GENERATE DARI HISTORY ---
    const handleHistoryReDownload = (historyItem) => {
        if (!historyItem.fullData || historyItem.fullData.length === 0) {
            alert("Data lama tidak ditemukan / korup.");
            return;
        }
        setShowHistory(false); // Tutup modal history
        
        // Panggil generate dengan Data dari History
        executeZip(historyItem.qty, historyItem.fullData);
    };

    const processPayment = async (qty) => { try { showModal({ type: 'loading', title: 'Memproses...', message: 'Menghubungkan ke Payment Gateway...', progress: 0, total: 100 }); const response = await fetch('http://localhost:5000/api/create-transaction', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qty, name: user?.name, email: user?.email }) }); const data = await response.json(); closeModal(); if (data.status === 'free') { executeZip(qty); } else if (data.status === 'success') { if (window.snap) { window.snap.pay(data.token, { onSuccess: function() { showModal({ type: 'alert', title: 'Sukses!', message: 'Pembayaran Berhasil.', confirmText: 'Mulai', onConfirm: () => { closeModal(); executeZip(qty); } }); }, onPending: function() { showModal({ type: 'alert', title: 'Pending', message: 'Menunggu pembayaran...', confirmText: 'OK' }); }, onError: function() { showModal({ type: 'alert', title: 'Gagal', message: 'Pembayaran gagal.', confirmText: 'Tutup' }); }, }); } else { alert("Midtrans script error."); } } else { alert('Backend Error: ' + data.message); } } catch (error) { closeModal(); alert("Gagal koneksi ke server."); } };
    
    const handleMainAction = () => {
        if(excelData.length === 0) { executeSinglePDF(); return; }
        const totalData = excelData.length;
        const qty = generateQty > 0 ? generateQty : totalData;
        let infoMessage = qty < totalData ? `⚠️ PERHATIAN:\nDari total ${totalData} data yang tersedia, Anda hanya akan mencetak ${qty} data pertama.` : `Anda akan mencetak seluruh data (${qty} sertifikat).`;

        if (qty > 30) {
            if (isAdmin) { showModal({ type: 'confirm', title: 'Admin Mode', message: `${infoMessage}\n\nLanjutkan gratis?`, confirmText: 'Ya, Generate', cancelText: 'Batal', onConfirm: () => { closeModal(); executeZip(qty); } }); return; }
            if (!user) { showModal({ type: 'confirm', title: 'Login Diperlukan', message: `Anda ingin mencetak ${qty} sertifikat. Wajib login.`, confirmText: 'Login / Daftar', cancelText: 'Batal', onConfirm: () => { closeModal(); setIsAuthModalAdmin(false); setShowAuthModal(true); } }); return; }
            let priceText = "Rp 30.000"; if (qty > 150) priceText = "Rp 75.000"; else if (qty > 100) priceText = "Rp 50.000";
            showModal({ type: 'confirm', title: 'Konfirmasi Pembayaran', message: `${infoMessage}\n\nBiaya: ${priceText}.\nLanjutkan?`, confirmText: 'Bayar & Generate', cancelText: 'Batal', onConfirm: () => { closeModal(); processPayment(qty); } });
        } else {
            showModal({ type: 'confirm', title: 'Konfirmasi Cetak', message: `${infoMessage}\n\nLanjutkan proses?`, confirmText: 'Mulai Cetak', cancelText: 'Batal', onConfirm: () => { closeModal(); executeZip(qty); } });
        }
    };

    const executeSinglePDF = async () => { await saveToDatabase(); showModal({ type: 'loading', title: 'PDF...', progress: 0, total: 1 }); const element = document.getElementById('print-area'); try { const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }); const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] }); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height); pdf.save(`${name || 'Certificate'}.pdf`); saveToHistory(1); closeModal(); } catch (e) { closeModal(); } };

    // --- ✅ FIX EXECUTE ZIP (SUPPORT DATA OVERRIDE UNTUK HISTORY) ---
    const executeZip = async (qty, dataOverride = null) => {
        const element = document.getElementById('print-area');
        
        // Gunakan dataOverride (dari History) jika ada, jika tidak pakai excelData (dari Upload)
        const sourceData = dataOverride || excelData;

        if (!element || !sourceData || sourceData.length === 0) {
            alert("Tidak ada data untuk dicetak.");
            return;
        }
        
        abortRef.current = false; 
        setIsProcessing(true);
        
        const zip = new JSZip();
        try {
            // Loop data sourceData (bukan excelData)
            for (let i = 0; i < qty; i++) {
                if (abortRef.current) break;
                
                const person = sourceData[i];
                
                showModal({
                    type: 'loading',
                    title: 'Sedang Mencetak...',
                    message: `Memproses data ke-${i+1} dari ${qty}`,
                    progress: i + 1,
                    total: qty,
                    onCancel: handleCancelProcess
                });

                const possibleKeys = ['Name', 'name', 'Nama', 'nama', 'Nama Lengkap'];
                let pName = "Unknown";
                for (const key of possibleKeys) { if (person[key]) { pName = person[key]; break; } }
                if (pName === "Unknown") pName = Object.values(person)[0] || "Unknown";
                
                const pID = uuidv4().slice(0, 8).toUpperCase();
                setName(pName); setGeneratedID(pID);
                
                await new Promise(r => setTimeout(r, 10)); // Jeda Cepat

                const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1123, windowHeight: 794 });
                const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
                zip.file(`${pName}_${pID}.pdf`, pdf.output('blob'));
            }
            
            setIsProcessing(false);

            if (!abortRef.current) {
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, 'Certificates.zip');
                
                // Simpan history HANYA jika ini generate baru (bukan re-download)
                if (!dataOverride) {
                    saveToHistory(qty); 
                }
                
                showModal({ 
                    title: 'Selesai', message: 'Download Berhasil! Data akan di-reset.', type: 'alert', confirmText: 'OK', 
                    onConfirm: () => { closeModal(); if(!dataOverride) { setExcelData([]); setGenerateQty(0); setName(''); setCurrentIndex(0); } } 
                });
            } else {
                showModal({ title: 'Dibatalkan', message: 'Proses generate dihentikan.', type: 'alert' });
            }
        } catch (e) { 
            setIsProcessing(false); 
            closeModal();
            alert('Gagal: ' + e.message); 
        }
    };

    const finalQrValue = qrContent.trim() !== '' ? qrContent : generatedID;

    return (
        <div className={`main ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
            <CustomModal config={modal} onClose={closeModal} theme={theme} />
            <AdminModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} isAdminMode={isAuthModalAdmin} />
            
            {/* ✅ PASSING PROP RE-DOWNLOAD KE HISTORY MODAL */}
            <HistoryModal 
                isOpen={showHistory} 
                onClose={() => setShowHistory(false)} 
                user={user} 
                onReDownload={handleHistoryReDownload} 
            />
            
            <Header theme={theme} setTheme={setTheme} user={user} onHistoryClick={() => setShowHistory(true)} />

            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}><div id="print-area"><ComponentToPrint isPreview={false} isPremium={isAdmin} positions={dragPositions} template={template} name={name} heading={heading} desc={desc} author={author} date={date} textStyles={textStyles} logo={logo} customBackground={customBackground} signatureImg={signatureImg} showQR={showQR} qrValue={finalQrValue} qrColor={qrColor} imageStyles={imageStyles} zoom={1} qrScale={qrScale} /></div></div>
            <div className="maincontainer">
                <Sidebar currentTemplate={template} setTemplate={setTemplate} customBackground={customBackground} theme={theme} />
                <div className="middle">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}><ComponentToPrint id="template-area" isPreview={true} positions={dragPositions} onDrag={handleDrag} template={template} name={name} heading={heading} desc={desc} author={author} date={date} textStyles={textStyles} logo={logo} customBackground={customBackground} signatureImg={signatureImg} showQR={showQR} qrValue={finalQrValue} qrColor={qrColor} imageStyles={imageStyles} zoom={zoom} qrScale={qrScale} /></div>
                    <div className="zoom-controls-wrapper"><div className="zoom-label">🔍 {Math.round(zoom * 100)}%</div><input type="range" min="0.1" max="1.5" step="0.01" value={zoom} onChange={handleZoomChange} className="zoom-slider" /><button className="zoom-reset" onClick={() => setZoom(0.55)} title="Reset">↺</button></div>
                </div>

                <ControlPanel 
                    theme={theme} excelData={excelData} currentIndex={currentIndex}
                    handlePrevData={handlePrevData} handleNextData={handleNextData} 
                    handleRemoveData={confirmRemoveData} 
                    handleExcelUpload={handleExcelUpload} handleFile={handleFile} 
                    customBackground={customBackground} setCustomBackground={setCustomBackground} 
                    logo={logo} setLogo={setLogo} signatureImg={signatureImg} setSignatureImg={setSignatureImg}
                    handleRemoveLogo={confirmRemoveLogo} handleRemoveSig={confirmRemoveSig} handleRemoveBg={confirmRemoveBg}
                    imageStyles={imageStyles} handleImageStyleChange={handleImageStyleChange}
                    showQR={showQR} setShowQR={setShowQR}
                    qrContent={qrContent} setQrContent={setQrContent}
                    qrColor={qrColor} setQrColor={setQrColor}
                    qrScale={qrScale} setQrScale={setQrScale}
                    heading={heading} setHeading={setHeading} name={name} setName={setName} desc={desc} setDesc={setDesc}
                    author={author} setAuthor={setAuthor} date={date} setDate={setDate}
                    textStyles={textStyles} handleStyleChange={handleStyleChange}
                    generateQty={generateQty} setGenerateQty={setGenerateQty} isPremium={isAdmin} 
                    handleMainAction={handleMainAction} handleCancelProcess={handleCancelProcess} 
                    loadingState={isProcessing ? 'loading' : 'idle'}
                    user={user} 
                    handleLogin={() => { setIsAuthModalAdmin(false); setShowAuthModal(true); }} 
                    handleLogout={handleLogout}
                />
            </div>
        </div>
    );
}

export default Homepage;