import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Depan (Landing Page) */}
        <Route path="/" element={<LandingPage />} />

        {/* Aplikasi Utama (Generator) */}
        <Route path="/generate" element={<Homepage />} />
        
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;