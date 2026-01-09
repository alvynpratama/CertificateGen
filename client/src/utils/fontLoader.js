export const loadWebFont = (fontName) => {
    if (!fontName) return;

    const existingLink = document.getElementById(`font-${fontName}`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.id = `font-${fontName}`;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
    
    document.head.appendChild(link);
};