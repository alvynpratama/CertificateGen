const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

        return data.token;
    } catch (error) {
        console.error("Midtrans Service Error:", error);
        throw error;
    }
};

export const loadSnapScript = (clientKey) => {
    return new Promise((resolve, reject) => {
        if (document.getElementById('midtrans-script')) {
            resolve(true);
            return;
        }
        const isProduction = !clientKey.includes('SB-'); 
        
        const src = isProduction 
            ? 'https://app.midtrans.com/snap/snap.js'  // URL PRODUCTION
            : 'https://app.sandbox.midtrans.com/snap/snap.js'; // URL SANDBOX
        const script = document.createElement('script');
        script.src = src;
        script.id = 'midtrans-script';
        script.setAttribute('data-client-key', clientKey); 
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.js'));
        document.body.appendChild(script);
    });
};