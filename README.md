# Khmer Download Web Application

A professional software and video tutorial platform developed with Node.js/Express (Backend) and React (Frontend).

## Features
- **Admin Panel**: Secure login for managing programs and videos.
- **Upload/Edit/Delete**: Full CRUD functionality for admins.
- **Dynamic KHQR Payment**: Integrated with Bakong KHQR for automatic payment generation and tracking.
- **Instant Download**: Automated download process after successful payment verification.
- **Premium Badge System**: Visual distinction between Free and Paid programs.
- **Modern UI**: Styled with Vanilla CSS for a premium look.

## Tech Stack
- **Frontend**: React, Vite, qrcode.react, bakong-khqr.
- **Backend**: Node.js, Express, Sequelize (MySQL), Multer (File Upload), JWT (Authentication).
- **Database**: MySQL.

## Getting Started
### Prerequisites
- Node.js & npm
- MySQL

### Installation
1. Clone the repository
2. Set up the `.env` file in the `backend/` directory.
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Run the development servers:
   ```bash
   cd backend && node server.js
   cd ../frontend && npm run dev
   ```

## Merchant Information
- **Merchant**: PONG CHIVA
- **Account ID**: pong_chiva@bkrt
- **Bank**: Bakong

Developed by Antigravity (powered by Google DeepMind)
