// client/src/services/midtransService.js

// URL Backend Anda (Localhost port 5000)
const API_URL = "http://localhost:5000/api";

export const createTransaction = async (orderData) => {
    try {
        const response = await fetch(`${API_URL}/create-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Gagal membuat transaksi");
        }

        return data.token; // Mengembalikan Snap Token dari Backend
    } catch (error) {
        console.error("Midtrans Service Error:", error);
        throw error;
    }
};

export const loadSnapScript = (clientKey) => {
    return new Promise((resolve) => {
        // Cek jika script sudah ada agar tidak double
        if (document.getElementById('midtrans-script')) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.id = 'midtrans-script';
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey); 
        script.onload = () => resolve(true);
        document.body.appendChild(script);
    });
};