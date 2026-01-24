# Attendance System – Feature Update

This repository contains a **feature update for https://careerinstitute.co.in**.

This project aims to implement a **seamless attendance system for students**, using **QR scanners provided within their account dashboard**. The system focuses on secure, fast, and reliable attendance marking with minimal manual effort.

---

## Project Overview (Attendance Scanner 👀)

The attendance system enables:

- **QR-Based Attendance Scanning**  
Attendance is captured through secure QR code scanning to enable fast, contactless check-ins.

- **Authenticated Scanner Access**  
QR scanning functionality is available only through authenticated user dashboards to ensure authorized usage.

- **Secure, Time-Bound QR Tokens**  
Dynamically generated QR codes expire after a defined time window to prevent misuse and replay attacks.

- **Duplicate and Expired Scan Prevention**  
System-level validation blocks multiple scans by the same user and rejects expired QR tokens.

- **Real-Time Attendance Submission**  
Attendance data is processed and recorded instantly upon successful scan for immediate availability.


The solution is designed to be efficient, scalable, and user-friendly for academic institutions.

---

## 🌐 Tech Stack

This project is built using:

- **Next.js** – Frontend framework
- **TypeScript** – Static typing and improved maintainability
- **PHP** – Backend processing and APIs
- **Tailwind CSS** – UI Styling

---
## 📂 Project Structure
```
attendance-system-scanner/
│
├── .next/
├── node_modules/
│
├── php-api/
│   ├── databaseUploader/
│   │   ├── credentials.env         # DB credentials
│   │   ├── database.php            # DB connection
│   │   └── index.php               # Upload endpoint
│   │
│   └── qrTokenGeneration/
│       ├── credentials.env         # Token secrets
│       └── index.php               # Token endpoint
│
├── public/
│
├── src/
│   └── app/                        
│       ├── api/                    # API route handlers
│       ├── assets/                 # Frontend assets
│       ├── globals.css             # Global styles
│       ├── layout.tsx              # Root layout
│       ├── page.tsx                # Home page
│       └── scannerClient.tsx       # QR scanner UI
│
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.js
├── tsconfig.json
│
└── README.md                       # Project documentation
