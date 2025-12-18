// src/assets/templates/index.js

// Pastikan file-file ini BENAR-BENAR ADA di folder yang sama
import t1 from './Template1.png';
import t2 from './Template2.png';
import t3 from './Template3.png';
import t4 from './Template4.jpeg'; // Perhatikan .jpeg
import t5 from './Template5.png';
import t6 from './Template6.png';
import t7 from './Template7.png';
import t8 from './Template8.png';
import t9 from './Template9.jpg';  // Perhatikan .jpg
import t10 from './Template10.png'; 

// Jika Template11 belum ada gambarnya, JANGAN dipanggil disini dulu agar tidak error.
// import t11 from './Template11.png'; 

const templates = {
    template1: t1,
    template2: t2,
    template3: t3,
    template4: t4,
    template5: t5,
    template6: t6,
    template7: t7,
    template8: t8,
    template9: t9,
    template10: t10,
    // template11: t11, // Saya komen dulu agar tidak error
};

export default templates;