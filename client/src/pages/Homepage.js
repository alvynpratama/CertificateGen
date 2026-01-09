import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
import AppLogo from '../assets/templates/logo.png';

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

    const navigate = useNavigate();

    // --- INIT ---
    useEffect(() => {
        // 1. Cek Sesi Admin
        const storedAdmin = localStorage.getItem('adminUser');
        if (storedAdmin) { 
            setUser(JSON.parse(storedAdmin)); 
            setIsAdmin(true); 
        } else {
            // 2. Cek Sesi User Biasa
            const storedUser = localStorage.getItem('certUser');
            if (storedUser) { 
                setUser(JSON.parse(storedUser)); 
                setIsAdmin(false); 
            }
        }

        // 3. Tracking
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        fetch(`${API_URL}/track-visit`, { method: 'POST' })
            .catch(err => console.error("Gagal catat visit:", err));

        // 4. Midtrans
        loadSnapScript(process.env.REACT_APP_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXXXXXXXXXXXXXX');
    }, []);

    const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '' });
    const showModal = (cfg) => { setModal({ isOpen: true, type: 'alert', title: '', message: '', confirmText: 'OK', cancelText: 'Batal', onConfirm: null, ...cfg }); };
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        if (userData.role === 'admin') { 
            setIsAdmin(true); 
            localStorage.setItem('adminUser', JSON.stringify(userData)); 
            navigate('/admin-dashboard'); 
        } 
        else { 
            setIsAdmin(false); 
            localStorage.setItem('certUser', JSON.stringify(userData)); 
        }
        setIsLoginModalOpen(false);
        showModal({ title: 'Login Berhasil', message: `Selamat datang, ${userData.name}!`, type: 'alert', confirmText: 'Lanjut' });
    };

    const handleLoginClick = () => { setIsLoginModalOpen(true); };

    const confirmLogout = () => {
        showModal({ type: 'confirm', title: 'Konfirmasi Logout', message: 'Yakin ingin keluar?', confirmText: 'Logout', cancelText: 'Batal', onConfirm: () => { setUser(null); setIsAdmin(false); localStorage.removeItem('adminUser'); localStorage.removeItem('certUser'); closeModal(); } });
    };

    // --- ZOOM LOGIC ---
    useEffect(() => {
        const handleResize = () => { const w = window.innerWidth; if (w < 768) setZoom(0.35); else if (w < 1200) setZoom(0.45); else setZoom(0.55); };
        handleResize(); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize);
    }, []);
    // --- MIDTRANS RETURN HANDLER ---
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const status = query.get('transaction_status'); 
        const statusCode = query.get('status_code');    

        if ( (status === 'settlement' || status === 'capture') && statusCode === '200' ) {
            console.log("Payment Success Detected inside useEffect");

            const pendingDataStr = localStorage.getItem('pending_cert_data');
            
            if (pendingDataStr) {
                const { qty, price, dataSource } = JSON.parse(pendingDataStr);

                let currentUser = null;
                const storedAdmin = localStorage.getItem('adminUser');
                const storedUser = localStorage.getItem('certUser');
                
                if (storedAdmin) currentUser = JSON.parse(storedAdmin);
                else if (storedUser) currentUser = JSON.parse(storedUser);
                
                console.log("📦 Data Retrieved from Storage:", { qty, price, dataSourceLength: dataSource?.length }); // LOG 2

                if (!dataSource || dataSource.length === 0) {
                    console.error("CRITICAL: Data Source is EMPTY!");
                    alert("Gagal memuat data sertifikat. Hubungi Admin.");
                    return;
                }

                setIsProcessing(true);
                showModal({ title: 'Pembayaran Berhasil', message: 'Memulai proses generate sertifikat...', type: 'alert' });

                setTimeout(async () => {
                    saveToHistory(qty, price, dataSource, currentUser);
                    
                    console.log("Starting executeZip...");
                    await executeZip(qty, dataSource, price);
                    console.log("executeZip Finished.");
                    
                    localStorage.removeItem('pending_cert_data');
                    window.history.replaceState({}, document.title, "/"); 
                    setIsProcessing(false);
                    
                }, 1000);
            } else {
                console.warn("No pending data found in LocalStorage");
            }
        }
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
        fontWeight: 'normal', fontStyle: 'normal', textAlign: 'center',
        width: 300, x: 0, y: 0
    };

    const [textStyles, setTextStyles] = useState({
        heading: { ...defaultStyle, fontSize: 36, fontFamily: 'Cinzel', color: '#0e4573', y: 100 },
        name: { ...defaultStyle, fontSize: 72, fontFamily: 'Pinyon Script', color: '#33d5ac', fontWeight: 'bold', y: 200 },
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
        if (selectedId === id) setSelectedId(null);
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

    // --- EXCEL & DATA HANDLING ---
    const [excelData, setExcelData] = useState([]); const [currentIndex, setCurrentIndex] = useState(0); const [generateQty, setGenerateQty] = useState(0);
    const abortRef = useRef(false);

    const handleExcelUpload = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const wb = XLSX.read(event.target.result, { type: "binary" });
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            setExcelData([...data]); setGenerateQty(data.length); setCurrentIndex(0);
            if (data.length > 0) updateNameFromExcel(data[0]);
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
        if (e.target.files[0]) {
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
    const handleFile = (e, setter) => { if (e.target.files[0]) { const reader = new FileReader(); reader.onload = (x) => { setter(x.target.result); }; reader.readAsDataURL(e.target.files[0]); } };
    const confirmRemoveLogo = () => { setLogo(null); };
    const confirmRemoveSig = () => { setSignatureImg(null); };

    // --- LOGIC HARGA ---
        const calculatePrice = (qty) => {
        if (qty <= 30) return 0;
        if (qty <= 100) return 15000;
        if (qty <= 150) return 40000;
        return 65000;
    };

    // LOGIKA WATERMARK
    const isWatermarkActive = !isAdmin && calculatePrice(generateQty) === 0;

    // --- LOGIC UTAMA ---

    // --- CEK DAILY QUOTA ---
    const checkDailyQuota = (qty) => {
        if (isAdmin) return true; 
        if (calculatePrice(qty) > 0) return true; 

        // Logic Limit Harian untuk Gratis
        const today = new Date().toDateString(); 
        const storageKey = 'daily_usage_log';
        let usageData = JSON.parse(localStorage.getItem(storageKey) || '{}');

        // Reset jika beda hari
        if (usageData.date !== today) {
            usageData = { date: today, count: 0 };
        }

        // Cek Sisa Kuota
        if (usageData.count + qty > 30) {
            const sisa = Math.max(0, 30 - usageData.count);
            showModal({ 
                title: 'Limit Harian Tercapai', 
                message: `Kuota gratis harian Anda tersisa: ${sisa}.\nAnda meminta: ${qty}.\n\nSilakan kurangi jumlah, upgrade ke Premium, atau kembali besok.`, 
                type: 'alert' 
            });
            return false;
        }

        return true;
    };

    const updateDailyQuota = (qty) => {
        if (isAdmin || calculatePrice(qty) > 0) return;
        const today = new Date().toDateString();
        const storageKey = 'daily_usage_log';
        let usageData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        if (usageData.date !== today) usageData = { date: today, count: 0 };
        usageData.count += qty;
        
        localStorage.setItem(storageKey, JSON.stringify(usageData));
    };

    // 1. Simpan ke Database & Local
    const saveToHistory = (count, cost, dataUsed, currentUserOverride = null) => {
        updateDailyQuota(count);

        const finalUser = currentUserOverride || user;
        
        let planType = 'Free';
        let retentionDays = 7;

        if (cost === 15000) { planType = 'Basic'; retentionDays = 25; }
        else if (cost === 40000) { planType = 'Pro'; retentionDays = 30; }
        else if (cost >= 65000) { planType = 'Enterprise'; retentionDays = 50; }

        const activityData = {
            email: finalUser ? finalUser.email : 'Guest',
            name: finalUser ? finalUser.name : 'Guest',
            type: dataUsed.length > 1 ? 'Batch Generate' : 'Single PDF',
            details: `Qty: ${count} | Plan: ${planType}`
        };

        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        fetch(`${API_URL}/log-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
        }).catch(err => console.error("Gagal simpan log:", err));

        if (!finalUser) return;

        const newEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            qty: count,
            fileName: `Certificates (${planType})`,
            cost: cost,
            plan: planType,
            retentionDays: retentionDays,
            fullData: dataUsed
        };

        try {
            const currentHistory = JSON.parse(localStorage.getItem(`history_${finalUser.email}`) || '[]');
            localStorage.setItem(`history_${finalUser.email}`, JSON.stringify([newEntry, ...currentHistory]));
        } catch (e) { 
            console.error(e);
            alert("Penyimpanan Browser Penuh. History lama mungkin tidak tersimpan.");
        }
    };

    const handleCancelProcess = () => { abortRef.current = true; setIsProcessing(false); closeModal(); };
    const handleHistoryReDownload = (item) => { setShowHistory(false); executeZip(item.qty, item.fullData); };
    const resetAllInputs = () => { setExcelData([]); setGenerateQty(0); setCurrentIndex(0); setName(''); setHeading(''); setDesc(''); setAuthor(''); setDate(''); setQrContent(''); setExtraTexts([]); };

    // 2. HANDLE UTAMA (Validasi Data & Pembayaran)
    const handleMainAction = async () => {
        let finalDataSource = [];

        if (excelData.length > 0) {
            finalDataSource = [...excelData];
        } else if (name.trim()) {
            const namesArray = name.split(';').map(n => n.trim()).filter(n => n !== "");
            if (namesArray.length > 0) {
                finalDataSource = namesArray.map(n => ({ Name: n }));
            }
        }

        if (finalDataSource.length === 0) {
            showModal({ title: 'Data Kosong', message: 'Silakan isi Nama Peserta atau Upload Excel.', type: 'alert' });
            return;
        }

        const availableCount = finalDataSource.length;
        const requestedQty = generateQty > 0 ? generateQty : availableCount;

        if (requestedQty > availableCount) {
            showModal({
                type: 'confirm',
                title: 'Data Tidak Cukup',
                message: `Anda meminta mencetak ${requestedQty} sertifikat, tetapi hanya ada ${availableCount} data (nama). Sistem hanya akan mencetak ${availableCount} data teratas. Lanjut?`,
                confirmText: `Cetak ${availableCount} Saja`,
                cancelText: 'Batal',
                onConfirm: () => {
                    closeModal();
                    setGenerateQty(availableCount);
                    proceedToPayment(availableCount, finalDataSource);
                }
            });
            return;
        }

        proceedToPayment(requestedQty, finalDataSource);
    };

    // 4. PROSES PEMBAYARAN / EKSEKUSI
    const proceedToPayment = (qty, dataSource) => {
        // Cek Login untuk qty besar
        if (!user && qty > 30) {
            showModal({ type: 'confirm', title: 'Login Diperlukan', message: 'Guest limit 30. Login untuk lanjut.', confirmText: 'Login', onConfirm: () => { closeModal(); setIsLoginModalOpen(true); } });
            return;
        }

        if (!checkDailyQuota(qty)) return;

        const price = calculatePrice(qty);

        // Jika Berbayar
        if (price > 0) {
            showModal({
                type: 'confirm',
                title: 'Konfirmasi Pembayaran',
                message: `Cetak ${qty} sertifikat.\nTotal: Rp ${price.toLocaleString('id-ID')}.\nLanjutkan ke pembayaran?`,
                confirmText: 'Bayar Sekarang',
                onConfirm: () => {
                    closeModal();
                    processMidtransPayment(qty, price, dataSource);
                }
            });
        } else {
            // Jika Gratis
            if (qty === 1) {
                executeSinglePDF(dataSource[0]); 
            } else {
                // Batch ZIP
                showModal({ 
                    type: 'confirm', 
                    title: 'Konfirmasi', 
                    message: `Cetak ${qty} sertifikat (Gratis)?`, 
                    confirmText: 'Mulai', 
                    onConfirm: () => { 
                        closeModal(); 
                        saveToHistory(qty, 0, dataSource); 
                        executeZip(qty, dataSource, 0); 
                    } 
                });
            }
        }
    };

    // FUNGSI PROSES MIDTRANS (Menerima dataSource)
    const processMidtransPayment = async (qty, price, dataSource) => {
        setIsProcessing(true);
        localStorage.setItem('pending_cert_data', JSON.stringify({
            qty, 
            price, 
            dataSource,
            timestamp: Date.now()
        }));
        try {
            const orderData = {
                order_id: `CERT-${uuidv4().slice(0, 8)}`,
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
                }],
                callbacks: {
                    finish: window.location.href
                }
            };

            const snapToken = await createTransaction(orderData);
            setIsProcessing(false);

            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: function (result) {
                        console.log("Payment Success (Popup callback)");
                    },
                    onPending: function (result) {
                        console.log("Payment Pending");
                    },
                    onError: function (result) {
                        console.log("Payment Error");
                        localStorage.removeItem('pending_cert_data');
                        showModal({ title: 'Gagal', message: 'Pembayaran gagal!', type: 'alert' });
                    },
                    onClose: function () {
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

    const executeSinglePDF = async (singleData = null) => {
        if (singleData) {
            updateNameFromExcel(singleData);
            setGeneratedID(uuidv4().slice(0, 8).toUpperCase());
        }

        const el = document.getElementById('print-area');
        setSelectedId(null);
        await new Promise(r => setTimeout(r, 200));

        showModal({ type: 'loading', title: 'PDF...', progress: 0, total: 1 });
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${name || 'Certificate'}.pdf`);
            
            // Simpan history single
            saveToHistory(1, 0, singleData ? [singleData] : [{Name: name}]);
            
            closeModal();
            showModal({ title: 'Selesai', message: 'Berhasil!', type: 'alert', confirmText: 'OK', onConfirm: () => { closeModal(); resetAllInputs(); } });
        } catch (e) { closeModal(); alert("Gagal: " + e.message); }
    };

    const executeZip = async (qty, dataSource, cost = 0) => {
        const el = document.getElementById('print-area');
        if (!dataSource || dataSource.length === 0) {
            console.error("ExecuteZip aborted: No DataSource");
            return;
        }

        setSelectedId(null);
        abortRef.current = false; 
        setIsProcessing(true);
        const zip = new JSZip();

        try {
            console.log(`Loop started for ${qty} items`);

            for (let i = 0; i < qty; i++) {
                // 1. Cek Abort
                if (abortRef.current) {
                    console.warn("Process Aborted by User");
                    break;
                }

                // 2. Cek Data Existence
                const person = dataSource[i];
                if (!person) {
                    console.error(`Data missing at index ${i}`);
                    continue; // Skip if data corrupt, don't break
                }

                // Update Progress Modal
                showModal({ 
                    type: 'loading', 
                    title: 'Mencetak...', 
                    message: `Memproses data ke-${i + 1} dari ${qty}`, 
                    progress: i + 1, 
                    total: qty, 
                    onCancel: handleCancelProcess 
                });

                // --- INNER TRY-CATCH (Agar 1 error tidak mematikan semua) ---
                try {
                    // Update Nama & ID
                    const possibleKeys = ['Name', 'name', 'Nama', 'nama']; let pName = "User";
                    for (const key of possibleKeys) if (person[key]) { pName = person[key]; break; }
                    if(pName === "User" && Object.values(person)[0]) pName = Object.values(person)[0];

                    const pID = uuidv4().slice(0, 8).toUpperCase();

                    setName(pName); 
                    setGeneratedID(pID);
                    await document.fonts.ready;
                    await new Promise(r => setTimeout(r, 800));

                    // Cek apakah elemen ada sebelum capture
                    if(!el) throw new Error("Print Area Element not found in DOM");

                    const canvas = await html2canvas(el, { 
                        scale: 1.5, 
                        useCORS: true,
                        logging: false
                    });

                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
                    zip.file(`${pName}_${pID}.pdf`, pdf.output('blob'));

                } catch (innerError) {
                    console.error(`Error on item ${i+1}:`, innerError);
                }
            }
            
            if (!abortRef.current) {
                if (Object.keys(zip.files).length === 0) {
                    throw new Error("No files were generated successfully.");
                }

                setIsProcessing(true); 
                showModal({ type: 'loading', title: 'Compressing...', message: 'Sedang membuat file ZIP...', progress: qty, total: qty });
                
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, 'Certificates.zip');
                
                showModal({ title: 'Selesai', message: 'Download berhasil dimulai!', type: 'alert', confirmText: 'OK', onConfirm: () => { closeModal(); resetAllInputs(); } });
            }
        } catch (e) { 
            setIsProcessing(false); 
            showModal({ title: 'Error', message: 'Terjadi kesalahan: ' + e.message, type: 'alert' });
        }
        
        return true; 
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
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
                onLogin={handleLoginSuccess} 
                onShowAlert={showModal} 
                isAdminMode={isAdmin} 
            />
            <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} user={user} onReDownload={handleHistoryReDownload} />

            <Header theme={theme} setTheme={setTheme} user={user} onHistoryClick={() => setShowHistory(true)} onLoginClick={handleLoginClick} onLogout={confirmLogout} />

            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -1000, opacity: 0, overflow: 'hidden', width: '1123px', height: '794px' }}>
                <div id="print-area" style={{ width: '1123px', height: '794px' }}>
                    <ComponentToPrint
                        isPreview={false}
                        template={template}
                        {...allTextProps}
                        logo={logo} customBackground={activeCustomBg} signatureImg={signatureImg}
                        showQR={showQR} qrValue={finalQrValue} qrColor={qrColor} imageStyles={imageStyles}
                        qrStyle={qrStyle} zoom={1}
                        showWatermark={isWatermarkActive} 
                        watermarkImg={AppLogo}
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