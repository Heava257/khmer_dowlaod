# Khmer Download Website

A premium web application for downloading software and watching explanation videos.

## Features
- **Premium Dark Theme**: Sleek and modern UI inspired by top software platforms.
- **Software Management**: Upload and download various programs and games.
- **Video Tutorials**: Watch explanation videos for software installation and troubleshooting.
- **Full Stack**: Built with Node.js (Express), MySQL (Sequelize), and React.

## Technology Stack
- **Frontend**: React (Vite) + Vanilla CSS
- **Backend**: Node.js + Express
- **ORM**: Sequelize
- **Database**: MySQL

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- MySQL Server installed and running

### 2. Database Configuration
1. Create a database named `khmer_download` in your MySQL server.
2. Update the `.env` file in the `backend` folder with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=khmer_download
   ```

### 3. Install Dependencies
Run the following command in the root directory:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 4. Run the Application
In the root directory, run:
```bash
npm run dev
```
This will start both the backend server (port 5000) and the frontend dev server (port 5173) concurrently.

## Project Structure
- `/backend`: Express API, Sequelize models, and file upload logic.
- `/frontend`: React application with premium styling.
- `/uploads`: Directory where uploaded files and icons are stored.
