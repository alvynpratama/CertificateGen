import React from 'react';
import templateImages from '../../assets/templates'; 

const Sidebar = ({ currentTemplate, setTemplate, customBackground }) => { // Hapus props 'theme'
    const templates = Object.keys(templateImages);

    return (
        // Hapus style={{background...}} agar ikut CSS .leftmost
        <div className="leftmost"> 
            <h3 style={{marginBottom: '20px', fontSize: '12px', color: 'var(--primary-blue)', letterSpacing: '1px', fontWeight: 'bold'}}>TEMPLATES</h3>
            
            {customBackground && (
                <div 
                    className={`templates ${currentTemplate === 'custom' ? 'active' : ''}`} 
                    onClick={() => setTemplate('custom')} 
                    title="Upload Anda"
                >
                    <img src={customBackground} alt="Custom" style={{height:'140px', objectFit:'cover'}} />
                    <div className="custom-bg-label">UPLOAD ANDA</div>
                </div>
            )}

            {templates.map((key) => (
                <div 
                    key={key} 
                    className={`templates ${currentTemplate === key ? 'active' : ''}`}
                    onClick={() => setTemplate(key)}
                >
                    <img src={templateImages[key]} alt={key} />
                </div>
            ))}
        </div>
    );
};

export default Sidebar;