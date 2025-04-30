## Setup & Configuration

1. **Prerequisites**  
   - Node.js v16+ & npm v8+  
   - MySQL v5.7+  
   - A modern browser (Chrome, Firefox, Safari)

2. **Clone the Repo**  
       git clone https://github.com/HNodeland/nodeland.git  
       cd nodeland

3. **Backend (Express + MySQL + Google OAuth)**  
   - Copy and configure your env file:  
         cp server/.env.example server/.env  
     Edit `server/.env` and set:  
         DB_HOST=localhost  
         DB_USER=<your-mysql-username>  
         DB_PASS=<your-mysql-password>  
         DB_NAME=nodeland  
         PORT=4000  
         
         SESSION_SECRET=<random-secret>  
         GOOGLE_CLIENT_ID=<google-client-id>  
         GOOGLE_CLIENT_SECRET=<google-client-secret>  
         GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback  

   - Install dependencies and (optionally) create the database:  
         cd server  
         npm install  
         # mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nodeland;"  

   - Start the backend server:  
         npm start  

   The API will run at `http://localhost:4000`.

4. **Frontend (Vite + React + Tailwind)**  
   - Install and run:  
         cd ../client  
         npm install  
         npm run dev  

   Open `http://localhost:5173` in your browser. All `/api/*` and `/auth/*` calls are proxied to `localhost:4000`.

5. **Google OAuth Setup**  
   1. In Google Cloud Console → APIs & Services → Credentials, create an **OAuth 2.0 Client ID**.  
   2. Set the Authorized redirect URI to:  
         http://localhost:4000/auth/google/callback  
   3. Copy the Client ID and Secret into your `server/.env`.

6. **Production Build & Serve**  
       cd client  
       npm run build  
       cd ../server  
       # ensure NODE_ENV=production in server/.env  
       npm start  

   The server will serve the built frontend at `http://localhost:4000`.

7. **Troubleshooting**  
   - **MySQL errors**: verify `server/.env` credentials & that MySQL is running.  
   - **OAuth errors**: ensure the redirect URI in Google Console exactly matches `GOOGLE_CALLBACK_URL`.  
   - **Port conflicts**: adjust `PORT` in `server/.env` or the proxy in `client/package.json`.
