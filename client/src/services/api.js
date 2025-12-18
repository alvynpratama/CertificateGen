import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- FUNGSI 1: Upload File ke Storage ---
// Mengembalikan URL gambar (https://...) agar bisa disimpan di DB
export const uploadImageToStorage = async (file, folderName = "templates") => {
    if (!file) return null;
    try {
        // Nama file unik pakai Date.now() biar gak bentrok
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `${folderName}/${fileName}`);
        
        // Proses Upload
        const snapshot = await uploadBytes(storageRef, file);
        
        // Ambil URL Download
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error upload:", error);
        throw error;
    }
};

// --- FUNGSI 2: Simpan Data Template ke Firestore ---
export const addTemplateToDB = async (templateName, imageFile) => {
    try {
        // 1. Upload dulu gambarnya
        const imageUrl = await uploadImageToStorage(imageFile, "templates");
        
        if (!imageUrl) throw new Error("Gagal upload gambar");

        // 2. Simpan datanya ke Firestore (Database)
        // Koleksi bernama 'templates'
        const docRef = await addDoc(collection(db, "templates"), {
            name: templateName,
            imageUrl: imageUrl, 
            createdAt: new Date(),
            // Nanti bisa tambah field lain: posisi koordinat, warna text, dll
        });
        
        console.log("Template saved with ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error adding document: ", error);
        return false;
    }
};

// --- FUNGSI 3: Ambil Semua Template dari Firestore ---
export const getTemplatesFromDB = async () => {
    try {
        const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        // Format data agar enak dibaca React
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching templates:", error);
        return [];
    }
};