

Baik, saya mengerti. Terkadang format kode blok bisa sulit untuk disalin seluruhnya.

Saya akan berikan versi teks biasa di bawah ini. Anda bisa langsung memblok semua teks dari awal hingga akhir, lalu salin dan tempelkan ke file `README.md` Anda.

---

# TikTok Downloader

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Express.js](https://img.shields.io/badge/express.js-4.18.2-white.svg)](https://expressjs.com/)

Aplikasi web modern, cepat, dan bergaya untuk mengunduh video TikTok tanpa watermark. Dibangun dengan Node.js dan Express.js di backend, serta UI yang responsif dan menarik di frontend.

## Fitur Utama

-   **Unduh Tanpa Watermark**: Dapatkan video TikTok dalam kualitas asli tanpa watermark.
-   **UI Modern & Responsif**: Desain yang kekinian dengan efek visual dan animasi halus, sempurna di desktop maupun mobile.
-   **Mendukung Berbagai URL**: Kompatibel dengan semua format link TikTok (`tiktok.com`, `vm.tiktok.com`, `t.tiktok.com`, `vt.tiktok.com`).
-   **Proses Cepat**: Tidak perlu antri, unduh video langsung setelah proses selesai.
-   **Aman & Andal**: Dilengkapi dengan rate limiting dan error handling yang baik.
-   **Tidak Perlu Database**: Aplikasi berjalan tanpa memerlukan database atau instalasi yang rumit.
-   **Tampilkan Metadata**: Lihat informasi video seperti penulis, deskripsi, jumlah tayang, suka, dan komentar.

## Tech Stack

**Backend:**
-   [Node.js](https://nodejs.org/) - Runtime JavaScript
-   [Express.js](https://expressjs.com/) - Web Framework
-   [Axios](https://axios-http.com/) - HTTP Client
-   [CORS](https://www.npmjs.com/package/cors) - Enable Cross-Origin Resource Sharing
-   [Helmet](https://helmetjs.github.io/) - Security Middleware
-   [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) - Rate Limiting

**Frontend:**
-   Vanilla JavaScript (ES6+)
-   CSS3 dengan animasi modern
-   HTML5

## Prerequisites

Sebelum memulai, pastikan Anda telah menginstal **Node.js** (versi LTS 18 atau lebih baru) dan **npm** di komputer Anda.

-   [Unduh & Instal Node.js](https://nodejs.org/en/)

## Instalasi & Setup

Ikuti langkah-langkah berikut untuk mengatur project ini di komputer lokal Anda.

1.  **Clone Repository**
    ```bash
    git clone https://github.com/USERNAME_GITHUB_ANDA/tiktok-downloader.git
    ```

2.  **Masuk ke Folder Project**
    ```bash
    cd tiktok-downloader
    ```

3.  **Instal Dependencies**
    ```bash
    npm install
    ```

## Cara Menjalankan Secara Lokal

Setelah instalasi selesai, Anda bisa menjalankan aplikasi dalam dua mode:

**Mode Development (dengan `nodemon` untuk auto-restart):**
```bash
npm run dev
```

**Mode Production:**
```bash
npm start
```

Buka browser Anda dan akses aplikasi di:
```
http://localhost:3000
```

## Deployment (Cara Membuat Online)

Aplikasi ini sangat mudah untuk di-deploy ke platform cloud. Berikut adalah panduan singkat untuk menggunakan **Railway** (yang paling mudah dan gratis):

1.  **Unggah ke GitHub**: Pastikan kode project Anda sudah di-push ke repository GitHub.
2.  **Daftar ke Railway**: Kunjungi [railway.app](https://railway.app/) dan daftar menggunakan akun GitHub Anda.
3.  **Buat Project Baru**:
    -   Klik **"New Project"** -> **"Deploy from GitHub repo"**.
    -   Pilih repository `tiktok-downloader` Anda.
    -   Railway akan otomatis mendeteksi project Node.js dan mengatur `npm install` dan `npm start`.
    -   Klik **"Deploy"**.
4.  **Selesai!** Railway akan memberikan URL publik (misal `https://tiktok-downloader-production.up.railway.app`) yang bisa Anda bagikan.

*Alternatif lain: [Render](https://render.com/), [Vercel](https://vercel.com/), atau Heroku.*

## Struktur API Endpoints

Aplikasi ini memiliki dua endpoint API utama:

### 1. Mendapatkan Informasi Video

-   **Endpoint**: `POST /api/download`
-   **Request Body**:
    ```json
    {
      "url": "https://www.tiktok.com/@user/video/123"
    }
    ```
-   **Success Response (200)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "123",
        "author": { ... },
        "description": "Deskripsi video",
        "thumbnail": "https://...",
        "downloadUrls": {
          "noWatermark": "https://...",
          "withWatermark": "https://..."
        },
        ...
      }
    }
    ```
-   **Error Response (4xx/5xx)**:
    ```json
    {
      "success": false,
      "error": "Pesan error yang jelas"
    }
    ```

### 2. Mengunduh Video (Streaming)

-   **Endpoint**: `POST /api/download-stream`
-   **Request Body**:
    ```json
    {
      "url": "https://www.tiktok.com/@user/video/123"
    }
    ```
-   **Response**: Akan mengalirkan (stream) file video langsung ke klien.

## Kontribusi

Kontribusi sangat diterima! Jika Anda ingin memperbaiki bug atau menambah fitur baru:

1.  Fork project ini.
2.  Buat branch baru (`git checkout -b fitur/AmazingFeature`).
3.  Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`).
4.  Push ke branch (`git push origin fitur/AmazingFeature`).
5.  Buka Pull Request.

## Lisensi

Project ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

## Disclaimer

Aplikasi ini dibuat untuk tujuan pendidikan dan penggunaan pribadi. Mohon hormati hak cipta dan **Ketentuan Layanan (Terms of Service) TikTok**. Penggunaan aplikasi ini adalah tanggung jawab Anda sepenuhnya. Saya tidak bertanggung jawab atas penyalahgunaan aplikasi ini.

## Author

Dibuat dengan Node.js oleh [Nama Anda](https://github.com/USERNAME_GITHUB_ANDA)

---

Coba salin teks di atas. Semoga ini lebih mudah
