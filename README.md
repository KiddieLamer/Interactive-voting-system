# 🗳️ Interactive Voting System

**Transparan, interaktif, dan aman 🔒**

Interactive Voting System adalah solusi modern untuk pemilihan digital. Dengan autentikasi OTP, animasi interaktif, dan hasil real-time, kini setiap pemilihan jadi lebih menyenangkan dan bebas manipulasi.

## ✨ Fitur Utama

### 🔐 Keamanan Tinggi
- **Autentikasi OTP via Email** - Verifikasi identitas dengan kode 6 digit
- **JWT Token Security** - Sesi aman dengan token expiration
- **Rate Limiting** - Perlindungan dari spam dan abuse
- **Input Validation** - Sanitasi dan validasi semua input pengguna
- **Anti-Fraud Protection** - Sistem pencegahan voting ganda

### 🎨 UI/UX Modern
- **Animasi Interaktif** - Powered by Framer Motion
- **Glass Morphism Design** - UI modern dengan efek kaca
- **Responsive Layout** - Optimal di semua perangkat
- **Real-time Animations** - Feedback visual yang menarik
- **Particle Background** - Background animasi yang elegan

### 📊 Real-time Results
- **Live Vote Updates** - Hasil langsung tanpa refresh
- **Interactive Charts** - Grafik batang dan pie chart
- **Vote Activity Feed** - Aktivitas voting real-time
- **Statistical Dashboard** - Analytics lengkap untuk admin

### 👥 Multi-Role System
- **Voter Interface** - Interface sederhana untuk pemilih
- **Public Results** - Hasil dapat dilihat publik
- **Admin Dashboard** - Panel kontrol lengkap untuk admin
- **Export Results** - Download hasil dalam format JSON

## 🚀 Teknologi

### Backend
- **Node.js** + Express.js
- **Socket.io** untuk real-time communication
- **JWT** untuk authentication
- **Nodemailer** untuk email OTP
- **bcrypt** untuk password hashing
- **Helmet** untuk security headers

### Frontend
- **React 18** dengan Hooks
- **Framer Motion** untuk animasi
- **Socket.io Client** untuk real-time updates
- **Recharts** untuk data visualization
- **React Hot Toast** untuk notifications
- **Lucide React** untuk icons

### Security & Performance
- **CORS** protection
- **Rate limiting** per endpoint
- **Input sanitization** dan validation
- **XSS protection**
- **CSRF protection**
- **Error handling** yang robust

## 🛠️ Instalasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- npm atau yarn
- Email account untuk SMTP (Gmail recommended)

### Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/interactive-voting-system.git
   cd interactive-voting-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup environment variables**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` dengan konfigurasi Anda:
   ```env
   PORT=3011
   JWT_SECRET=your_super_secret_jwt_key_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ADMIN_EMAIL=admin@votingsystem.com
   NODE_ENV=development
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Akses aplikasi**
   - Voter Interface: http://localhost:3010
   - Results Page: http://localhost:3010/results
   - Admin Dashboard: http://localhost:3010/admin (login sebagai admin)

## 📱 Cara Penggunaan

### Untuk Pemilih (Voters)

1. **Registrasi & Verifikasi**
   - Buka aplikasi di browser
   - Masukkan nama lengkap dan email
   - Klik "Send OTP"
   - Check email untuk kode OTP
   - Masukkan kode 6 digit untuk verifikasi

2. **Voting Process**
   - Pilih kandidat favorit Anda
   - Review pilihan Anda
   - Klik "Cast My Vote" untuk konfirmasi
   - Vote berhasil! Anda dapat melihat hasil real-time

### Untuk Admin

1. **Login Admin**
   - Gunakan email admin yang sudah dikonfigurasi
   - Verifikasi dengan OTP seperti biasa
   - Akses dashboard admin

2. **Monitor Voting**
   - Dashboard menampilkan statistik real-time
   - Monitor aktivitas voting live
   - Lihat detailed results dan analytics

3. **Manage Voting**
   - Export results dalam format JSON
   - Reset voting jika diperlukan
   - Monitor system health dan uptime

### Untuk Publik

1. **Lihat Hasil**
   - Akses /results tanpa perlu login
   - Lihat grafik dan statistik real-time
   - Monitor aktivitas voting terbaru

## 🔧 Konfigurasi

### Email Setup (Gmail)
1. Enable 2-Factor Authentication di akun Gmail
2. Generate App Password: Google Account > Security > 2-Step Verification > App Passwords
3. Gunakan App Password di environment variable `EMAIL_PASS`

### Admin Setup
Set `ADMIN_EMAIL` di environment variable dengan email admin yang diinginkan.

### Custom Candidates
Edit kandidat di `server/routes/vote.js` pada array `sampleCandidates`.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP code
- `POST /api/auth/verify-otp` - Verify OTP and login

### Voting
- `GET /api/vote/candidates` - Get all candidates
- `POST /api/vote/cast` - Cast vote (requires auth)
- `GET /api/vote/results` - Get current results
- `GET /api/vote/status` - Check user voting status

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `POST /api/admin/reset-votes` - Reset all votes
- `GET /api/admin/export-results` - Export results

## 🛡️ Keamanan

### Implemented Security Measures
- **OTP Authentication** - 6-digit codes dengan expiration
- **JWT Tokens** - Secure session management
- **Rate Limiting** - Prevent spam dan abuse
- **Input Validation** - XSS dan injection protection
- **CORS Policy** - Controlled cross-origin requests
- **Secure Headers** - Helmet.js security headers
- **Vote Integrity** - One vote per verified email
- **Audit Logging** - Security events logging

### Best Practices
- Tokens expire dalam 2 jam
- OTP expire dalam 10 menit
- Maximum 3 OTP attempts
- Rate limiting: 1 vote per minute per IP
- Email validation dan sanitization
- Suspicious activity monitoring

## 📈 Performance

- **Real-time Updates** - Socket.io untuk instant updates
- **Optimized Animations** - Hardware-accelerated dengan Framer Motion
- **Lazy Loading** - Component loading optimization
- **Caching Strategy** - Smart caching untuk API responses
- **Responsive Design** - Mobile-first approach

## 🤝 Contributing

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Interactive Voting System Team**

- 🌟 If you like this project, please give it a star!
- 🐛 Found a bug? Please open an issue
- 💡 Have an idea? We'd love to hear from you!

## 🎯 Roadmap

- [ ] **Multiple Elections** - Support untuk multiple voting sessions
- [ ] **Blockchain Integration** - Immutable vote recording
- [ ] **Mobile App** - React Native mobile application  
- [ ] **Advanced Analytics** - Machine learning vote analysis
- [ ] **Internationalization** - Multi-language support
- [ ] **Social Media Integration** - Share results di social media
- [ ] **Voter Registration** - Advanced voter management system

---

**Made with ❤️ for Democracy**

*Interactive Voting System - Making Digital Voting Secure, Transparent, and Engaging*