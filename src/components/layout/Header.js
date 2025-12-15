import React from 'react';
import '../../styles/global.css'; 
import myAppLogo from '../../assets/templates/logo.png'; 

const Header = ({ theme, setTheme, onHistoryClick, user }) => {
  return (
    <div className="header">
      
      <div className="header-left">
        <button 
            className="theme-toggle-btn" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
        </button>

        {/* Tombol History (Hanya muncul jika user login) */}
        {user && (
            <button 
                className="theme-toggle-btn"
                onClick={onHistoryClick}
                style={{marginLeft: '10px', display:'flex', alignItems:'center', gap:'5px'}}
            >
                📜 Riwayat
            </button>
        )}
      </div>

      <div className="header-right">
        <div className="logo-desktop-wrapper">
            <span className="header-title-text">CERTIFICATE GENERATOR</span>
            <div className="vertical-divider"></div>
            <div className="logo-wrapper">
                <img src={myAppLogo} alt="Logo" className="app-logo" style={{height: '38px', objectFit: 'contain'}} />
            </div>
        </div>
        <div className="logo-mobile-icon">🎓</div>
      </div>

    </div>
  );
};

export default Header;