# 🗳️ Interactive Voting System

Sistem pemilihan interaktif untuk organisasi (OSIS, BEM, RT/RW, dll) dengan **frontend modern** dan **backend aman**.  
Dibuat agar voting lebih transparan, interaktif, dan mencegah manipulasi data (1 orang = 1 suara).

---

## ✨ Features
- 🔑 **Login dengan ID unik** (NIM/NIK/Email).
- 🔐 **OTP sederhana via email (2FA)** untuk memastikan 1 user = 1 vote.
- 🎨 **Frontend interaktif** (React + Tailwind + Framer Motion).
- 📊 **Live result chart** setelah voting selesai.
- 🚫 **Anti-manipulasi** → 1 user hanya bisa voting sekali.
- 🔒 **Security by design** dengan JWT + database constraint.

---

## 🛠️ Tech Stack

### Frontend
- [React.js](https://react.dev/) → framework utama untuk UI
- [TailwindCSS](https://tailwindcss.com/) → styling cepat & modern
- [Framer Motion](https://www.framer.com/motion/) → animasi halus
- [GSAP](https://greensock.com/gsap/) *(opsional)* → animasi ekstra interaktif

### Backend
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) → REST API
- [MongoDB](https://www.mongodb.com/) / PostgreSQL → database
- [JWT](https://jwt.io/) → autentikasi user
- [Nodemailer](https://nodemailer.com/) → pengiriman OTP via email

---

## 📂 Project Structure
