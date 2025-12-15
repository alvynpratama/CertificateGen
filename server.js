const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- 1. SETUP CORS & LOGGER ---
app.use(cors()); // Izinkan semua akses
app.use(express.json());

// Logger: Supaya terlihat di terminal VS Code setiap ada request masuk
app.use((req, res, next) => {
    console.log(`[REQUEST MASUK] ${req.method} ${req.url}`);
    next();
});

// --- 2. DATABASE JSON SEDERHANA ---
const DATA_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_super_aman_123'; 

// Fungsi Helper Database
const getUsers = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

const saveUser = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

// --- 3. API AUTHENTICATION USER BIASA ---

// REGISTER USER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const users = getUsers();

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ status: 'error', message: 'Email sudah terdaftar!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            role: 'user', 
            joinDate: new Date().toISOString()
        };

        users.push(newUser);
        saveUser(users);

        res.json({ status: 'success', message: 'Registrasi berhasil! Silakan login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});

// LOGIN USER
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Email tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Password salah' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            status: 'success', 
            token, 
            user: { name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
});

// --- 4. API LOGIN KHUSUS ADMIN (INI YANG HILANG TADI) ---
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    
    // Password Admin Hardcoded (Bisa diganti 'admin123' dengan yang lain)
    if (password === 'admin123') { 
        console.log("Login Admin Sukses!");
        res.json({ 
            success: true, 
            adminData: { name: "Super Admin", email: "admin@system.com", role: "admin" },
            token: "admin-secret-bypass-token"
        });
    } else {
        console.log("Login Admin Gagal: Password Salah");
        res.status(401).json({ success: false, message: 'Password Admin Salah!' });
    }
});

// --- 5. MIDTRANS CONFIG ---
const snap = new midtransClient.Snap({
    isProduction: false, 
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const calculatePrice = (qty) => {
    if (qty > 150) return 75000;
    if (qty > 100) return 50000;
    if (qty > 30) return 30000;
    return 0;
};

// API Transaksi Midtrans
app.post('/api/create-transaction', async (req, res) => {
    try {
        const { qty, name, email } = req.body;
        const grossAmount = calculatePrice(qty);

        if (grossAmount === 0) return res.json({ status: 'free', message: 'Gratis' });

        const parameter = {
            transaction_details: {
                order_id: `CERT-${new Date().getTime()}-${Math.floor(Math.random()*1000)}`,
                gross_amount: grossAmount
            },
            customer_details: {
                first_name: name || "User",
                email: email || "user@example.com",
            }
        };

        const transaction = await snap.createTransaction(parameter);
        res.json({ status: 'success', token: transaction.token, redirect_url: transaction.redirect_url });

    } catch (error) {
        console.error("Midtrans Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Serve React Production Build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Real Auth jalan di port ${PORT}`));