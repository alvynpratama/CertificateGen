# Gunakan Node.js versi ringan
FROM node:18-alpine

# Set folder kerja di dalam container
WORKDIR /app

# Copy package.json dulu (agar caching layer docker efisien)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy seluruh kode server
COPY . .

# Buka port 5000 (sesuai index.js)
EXPOSE 5000

# Perintah menjalankan server
CMD ["node", "index.js"]