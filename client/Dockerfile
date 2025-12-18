# --- STAGE 1: Build React ---
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Build aplikasi React menjadi folder 'build'
RUN npm run build

# --- STAGE 2: Serve dengan Nginx ---
FROM nginx:alpine as production-stage

# Copy hasil build dari Stage 1 ke folder Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy konfigurasi Nginx custom (kita buat di langkah selanjutnya)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Buka port 80 (Port standar web)
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]