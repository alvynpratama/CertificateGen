import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Opsional, bisa dihapus jika tidak dipakai
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // StrictMode DIHAPUS agar react-draggable berjalan lancar
    <App />
);