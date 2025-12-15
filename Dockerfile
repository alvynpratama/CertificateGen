# Gunakan image ringan
FROM node:20-alpine

WORKDIR /app

# 1. Copy package.json DULUAN (agar layer ini ter-cache jika tidak ada perubahan dependency)
COPY package*.json ./

# 2. Install dependency
# Gunakan registry mirror biar download lebih cepat di Indonesia
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install

# 3. Baru copy sisa source code (src, public, server.js)
COPY . .

# Expose port
EXPOSE 3000 5000

# Jalanin backend & frontend
CMD ["npm", "run", "dev"]