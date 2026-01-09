require('dotenv').config();
const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const sql = require('mssql');
const bcrypt = require('bcryptjs'); 
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. CONFIG MIDTRANS ---
let snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// --- 2. CONFIG AZURE SQL DATABASE ---
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true, 
        trustServerCertificate: false 
    }
};

// Fungsi untuk inisialisasi Database (Buat Tabel Jika Belum Ada)
async function initializeDatabase() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('✅ Connected to Azure SQL Database');

        // 1. Tabel Transactions (Pembayaran)
        const transCheck = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Transactions'");
        if (transCheck.recordset.length === 0) {
            console.log('⚙️ Creating Transactions table...');
            await pool.request().query(`
                CREATE TABLE Transactions (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    order_id VARCHAR(50) NOT NULL UNIQUE,
                    amount DECIMAL(18,2) NOT NULL,
                    customer_name VARCHAR(100),
                    customer_email VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at DATETIME DEFAULT GETDATE()
                )
            `);
        }

        // 2. Tabel Users (Untuk Akun Member)
        const userCheck = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users'");
        if (userCheck.recordset.length === 0) {
            console.log('⚙️ Creating Users table...');
            await pool.request().query(`
                CREATE TABLE Users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'user',
                    created_at DATETIME DEFAULT GETDATE()
                )
            `);
        }

        // 3. Tabel ActivityLogs (Riwayat Generate User/Guest)
        const logCheck = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ActivityLogs'");
        if (logCheck.recordset.length === 0) {
            console.log('⚙️ Creating ActivityLogs table...');
            await pool.request().query(`
                CREATE TABLE ActivityLogs (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_email VARCHAR(100),
                    user_name VARCHAR(100),
                    activity_type VARCHAR(50),
                    details VARCHAR(255),
                    created_at DATETIME DEFAULT GETDATE()
                )
            `);
        }

        // 4. Tabel SiteStats (Statistik Pengunjung Harian)
        const statCheck = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SiteStats'");
        if (statCheck.recordset.length === 0) {
            console.log('⚙️ Creating SiteStats table...');
            await pool.request().query(`
                CREATE TABLE SiteStats (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    date DATE UNIQUE,
                    visit_count INT DEFAULT 0,
                    generate_count INT DEFAULT 0
                )
            `);
        }
        
        console.log('✅ All Tables Verified/Created Successfully.');

    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
}

initializeDatabase();

// --- 3. ENDPOINT API ---

app.get('/', (req, res) => {
    res.send('Backend Server is Secure & Running!');
});

// --- AUTHENTICATION ENDPOINTS (SECURE) ---

// 1. Register User Baru
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const pool = await sql.connect(dbConfig);

        // 1. Cek Email Duplikat
        const check = await pool.request()
            .input('Email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @Email');

        if (check.recordset.length > 0) {
            return res.status(400).json({ status: 'fail', message: 'Email sudah terdaftar' });
        }

        // 2. HASH PASSWORD (PENTING!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Simpan ke DB (Yang disimpan adalah hashedPassword)
        await pool.request()
            .input('Name', sql.VarChar, name)
            .input('Email', sql.VarChar, email)
            .input('Pass', sql.VarChar, hashedPassword) // Masukkan Hash
            .query("INSERT INTO Users (name, email, password, role) VALUES (@Name, @Email, @Pass, 'user')");

        res.json({ status: 'success', message: 'Registrasi berhasil' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// 2. Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await sql.connect(dbConfig);

        // 1. Cari User berdasarkan Email saja dulu
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query("SELECT * FROM Users WHERE email = @Email");

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            // 2. Cek Password: Bandingkan input user dengan Hash di DB
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Password Benar
                res.json({ 
                    status: 'success', 
                    user: { name: user.name, email: user.email, role: user.role },
                    token: 'mock-jwt-token-123' 
                });
            } else {
                // Password Salah
                res.status(401).json({ status: 'fail', message: 'Password salah' });
            }
        } else {
            // Email tidak ditemukan
            res.status(401).json({ status: 'fail', message: 'Email tidak terdaftar' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// 3. Google Sync
app.post('/api/auth/google-sync', async (req, res) => {
    try {
        const { name, email } = req.body;
        const pool = await sql.connect(dbConfig);

        const checkUser = await pool.request()
            .input('Email', sql.VarChar, email)
            .query("SELECT * FROM Users WHERE email = @Email");

        let user;

        if (checkUser.recordset.length > 0) {
            user = checkUser.recordset[0];
        } else {
            // User baru via Google
            const randomPass = 'google-' + Math.random().toString(36).substring(7);
            const salt = await bcrypt.genSalt(10);
            const hashedRandomPass = await bcrypt.hash(randomPass, salt);
            
            await pool.request()
                .input('Name', sql.VarChar, name)
                .input('Email', sql.VarChar, email)
                .input('Pass', sql.VarChar, hashedRandomPass) 
                .query("INSERT INTO Users (name, email, password, role) VALUES (@Name, @Email, @Pass, 'user')");
            
            const newUser = await pool.request()
                .input('Email', sql.VarChar, email)
                .query("SELECT * FROM Users WHERE email = @Email");
            
            user = newUser.recordset[0];
        }

        res.json({ 
            status: 'success', 
            user: { name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        console.error("Google Sync Error:", err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// 4. Login Admin (Secure)
app.post('/api/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await sql.connect(dbConfig);

        // 1. Cari user berdasarkan Email DAN Role Admin
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query("SELECT * FROM Users WHERE email = @Email AND role = 'admin'");

        if (result.recordset.length > 0) {
            const admin = result.recordset[0];

            // 2. Cek Password Hash
            const isMatch = await bcrypt.compare(password, admin.password);

            if (isMatch) {
                res.json({ 
                    success: true, 
                    adminData: { name: admin.name, email: admin.email, role: 'admin' },
                    token: 'admin-secret-token-' + admin.id
                });
            } else {
                res.status(401).json({ success: false, message: 'Password Admin Salah.' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Akun Admin tidak ditemukan.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
});

app.post('/api/auth/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query("SELECT id FROM Users WHERE email = @Email");
        
        // Return true jika email SUDAH ADA
        res.json({ exists: result.recordset.length > 0 });
    } catch (err) { res.status(500).send(err.message); }
});

// 6. Reset Password Baru
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const pool = await sql.connect(dbConfig);

        // Hash Password Baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update di DB
        await pool.request()
            .input('Email', sql.VarChar, email)
            .input('Pass', sql.VarChar, hashedPassword)
            .query("UPDATE Users SET password = @Pass WHERE email = @Email");

        res.json({ status: 'success', message: 'Password berhasil diubah' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// 7. Endpoint Daftar Google Fonts
let fontsCache = null;
app.get('/api/fonts', async (req, res) => {
    console.log("👉 [SERVER] Request masuk ke /api/fonts");
    try {
        if (fontsCache) {
            console.log("✅ [SERVER] Menggunakan Cache");
            return res.json(fontsCache);
        }
        const apiKey = process.env.GOOGLE_FONTS_API_KEY;
        console.log("🔑 [SERVER] API Key (Depan):", apiKey ? apiKey.substring(0, 5) + "..." : "TIDAK ADA!");

        const response = await axios.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`);
        console.log("ww [SERVER] Menghubungi Google...");
        console.log("✅ [SERVER] Google merespon. Jumlah font:", response.data.items.length);
        
        const allFonts = response.data.items.map(font => ({
            family: font.family,
            category: font.category
        }));

        fontsCache = allFonts;
        res.json(allFonts);
    } catch (error) {
        console.error("Gagal ambil font:", error.message);
        res.status(500).json({ message: "Gagal memuat font" });
    }
});

// --- ADMIN DASHBOARD ENDPOINTS (STATS) ---

app.get('/api/admin/stats', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const userCount = await pool.request().query("SELECT COUNT(*) as count FROM Users");
        const visitCount = await pool.request().query("SELECT SUM(visit_count) as count FROM SiteStats");
        const generateCount = await pool.request().query("SELECT SUM(generate_count) as count FROM SiteStats");
        const income = await pool.request().query("SELECT SUM(amount) as total FROM Transactions WHERE status IN ('settlement', 'capture')");

        res.json({
            users: userCount.recordset[0].count,
            visitors: visitCount.recordset[0].count || 0,
            generated: generateCount.recordset[0].count || 0,
            revenue: income.recordset[0].total || 0
        });
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT TOP 50 id, name, email, role, created_at FROM Users ORDER BY created_at DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/admin/activity', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT TOP 50 * FROM ActivityLogs ORDER BY created_at DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/admin/transactions', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT TOP 50 * FROM Transactions ORDER BY created_at DESC");
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/admin/chart-stats', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // Ambil 7 data terakhir diurutkan tanggal
        const result = await pool.request().query(`
            SELECT TOP 7 date, visit_count 
            FROM SiteStats 
            ORDER BY date DESC
        `);

        res.json(result.recordset.reverse()); 
    } catch (err) { 
        res.status(500).send(err.message); 
    }
});

// --- TRACKING ENDPOINTS ---

app.post('/api/track-visit', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const today = new Date().toISOString().split('T')[0];
        
        const check = await pool.request().query(`SELECT * FROM SiteStats WHERE date = '${today}'`);
        
        if (check.recordset.length === 0) {
            await pool.request().query(`INSERT INTO SiteStats (date, visit_count) VALUES ('${today}', 1)`);
        } else {
            await pool.request().query(`UPDATE SiteStats SET visit_count = visit_count + 1 WHERE date = '${today}'`);
        }
        res.sendStatus(200);
    } catch (err) { console.error("Track Visit Error:", err); res.sendStatus(500); }
});

app.post('/api/log-activity', async (req, res) => {
    try {
        const { email, name, type, details } = req.body;
        const pool = await sql.connect(dbConfig);
        
        await pool.request()
            .input('Email', sql.VarChar, email || 'Guest')
            .input('Name', sql.VarChar, name || 'Guest')
            .input('Type', sql.VarChar, type)
            .input('Details', sql.VarChar, details)
            .query(`INSERT INTO ActivityLogs (user_email, user_name, activity_type, details) VALUES (@Email, @Name, @Type, @Details)`);
            
        const today = new Date().toISOString().split('T')[0];
        const check = await pool.request().query(`SELECT * FROM SiteStats WHERE date = '${today}'`);
        if (check.recordset.length === 0) {
            await pool.request().query(`INSERT INTO SiteStats (date, visit_count, generate_count) VALUES ('${today}', 1, 1)`);
        } else {
            await pool.request().query(`UPDATE SiteStats SET generate_count = generate_count + 1 WHERE date = '${today}'`);
        }

        res.sendStatus(200);
    } catch (err) { console.error("Log Activity Error:", err); res.sendStatus(500); }
});

// --- PAYMENT ENDPOINT ---

app.post('/api/create-transaction', async (req, res) => {
    try {
        const { order_id, gross_amount, customer_details, item_details } = req.body;
        const frontEndUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        let parameter = {
            "transaction_details": { "order_id": order_id, "gross_amount": gross_amount },
            "credit_card":{ "secure" : true },
            "customer_details": customer_details,
            "item_details": item_details,
            "callbacks": {
                "finish": `${frontEndUrl}?status=success&order_id=${order_id}`,
                "error": `${frontEndUrl}?status=error`,
                "pending": `${frontEndUrl}?status=pending`
            }
        };

        const transaction = await snap.createTransaction(parameter);
        
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('OrderId', sql.VarChar, order_id)
                .input('Amount', sql.Decimal, gross_amount)
                .input('Name', sql.VarChar, customer_details.first_name)
                .input('Email', sql.VarChar, customer_details.email)
                .query(`
                    INSERT INTO Transactions (order_id, amount, customer_name, customer_email, status) 
                    VALUES (@OrderId, @Amount, @Name, @Email, 'pending')
                `);
        } catch (dbErr) { console.error("Failed to save to DB:", dbErr); }

        res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });

    } catch (error) {
        console.error("Midtrans Error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/midtrans-notification', async (req, res) => {
    try {
        const statusResponse = await snap.transaction.notification(req.body);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Receiving Notification for Order: ${orderId} | Status: ${transactionStatus}`);

        let finalStatus = 'pending';

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                finalStatus = 'challenge';
            } else if (fraudStatus == 'accept') {
                finalStatus = 'success'; 
            }
        } else if (transactionStatus == 'settlement') {
            finalStatus = 'settlement';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            finalStatus = 'failed';
        } else if (transactionStatus == 'pending') {
            finalStatus = 'pending';
        }

        // Update Database Azure
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Status', sql.VarChar, finalStatus)
            .input('OrderId', sql.VarChar, orderId)
            .query("UPDATE Transactions SET status = @Status WHERE order_id = @OrderId");

        console.log(`Transaction ${orderId} updated to ${finalStatus}`);
        
        res.status(200).send('OK');

    } catch (err) {
        console.error("Notification Error:", err.message);
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});