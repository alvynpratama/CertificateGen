// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const sql = require('mssql');

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
        encrypt: true, // Wajib untuk Azure
        trustServerCertificate: false 
    }
};

// Fungsi untuk inisialisasi Database (Drop Table Lama & Buat Baru)
async function initializeDatabase() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('✅ Connected to Azure SQL Database');

        // Cek apakah tabel Transactions sudah ada
        const tableCheck = await pool.request().query(`
            SELECT * FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Transactions'
        `);

        if (tableCheck.recordset.length === 0) {
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
            console.log('✅ Transactions table created successfully.');
        } else {
            console.log('✅ Transactions table already exists.');
        }

    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
}

// Jalankan inisialisasi DB
initializeDatabase();

// --- 3. ENDPOINT API ---

// API Cek Kesehatan Server
app.get('/', (req, res) => {
    res.send('Backend Server is Running correctly!');
});

// API: Buat Transaksi Midtrans
app.post('/api/create-transaction', async (req, res) => {
    try {
        const { order_id, gross_amount, customer_details, item_details } = req.body;

        console.log(`Creating transaction for: ${order_id} - IDR ${gross_amount}`);

        let parameter = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": gross_amount
            },
            "credit_card":{ "secure" : true },
            "customer_details": customer_details,
            "item_details": item_details
        };

        // 1. Minta Token ke Midtrans
        const transaction = await snap.createTransaction(parameter);
        
        // 2. Simpan Status Pending ke Database Azure
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
            console.log("Transaction saved to DB");
        } catch (dbErr) {
            console.error("Failed to save to DB:", dbErr);
        }

        // 3. Kirim Token ke Frontend
        res.status(200).json({ 
            token: transaction.token,
            redirect_url: transaction.redirect_url 
        });

    } catch (error) {
        console.error("Midtrans Error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});