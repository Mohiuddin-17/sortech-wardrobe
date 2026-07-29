# Sortech Wardrobe

A private wardrobe management app for you and your friends — built with React, Node.js, PostgreSQL, and Cloudinary. Entirely free to host on Render.

---

## What it does

| Feature | Details |
|---|---|
| Sign up / Sign in | JWT auth. Each person's wardrobe is 100% private. |
| Upload clothes | Photo + category (T-Shirt, Jeans, Shoes, Shalwar Kameez…) + Formal / Casual. |
| Wardrobe stats | Count of each item type, total formal vs casual, total worth (optional). |
| Build outfits | Select items → flat-lay preview shows them together so you can judge combinations. |
| Share outfits | One-click share link. Recipient sees the flat-lay, no account needed. |
| Optional cost tracking | Enter price per item; app totals up your wardrobe value. |
| Admin dashboard | You (the creator) see user count, item counts, outfit counts. Never their photos. |
| Role system | USER (default) or ADMIN. Only admins can see the admin panel. |

---

## Free-tier stack

| Layer | Service | Free limit | Notes |
|---|---|---|---|
| Frontend | Render Static Sites | Unlimited | Serves the React build. |
| Backend API | Render Web Service | 750 hrs/month | Spins down after 15 min idle — first request takes ~30s to wake. Acceptable for personal use. |
| Database | Render PostgreSQL | 1 GB | Enough for 20 users × 50 items each. |
| Image storage | Cloudinary | 25 credits/month (~25 GB) | Images are compressed to max 1000×1000px on upload. |

---

## Prerequisites

- Node.js ≥ 18
- Git
- A free Render account → render.com
- A free Cloudinary account → cloudinary.com

---

## Local development setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/sortech-wardrobe.git
cd sortech-wardrobe
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in real values (see below)
npx prisma generate
npx prisma migrate dev --name init
npm run dev                 # runs on http://localhost:5000
```

**Fill in `backend/.env`:**

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=<run: openssl rand -base64 48>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ORIGIN=http://localhost:5173
FIRST_ADMIN_EMAIL=your@email.com
```

> **FIRST_ADMIN_EMAIL** — when this email signs up, the account is automatically given the ADMIN role. Set it to your own email before running the app.

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# .env contains: VITE_API_URL=http://localhost:5000/api
npm run dev                 # runs on http://localhost:5173
```

Open http://localhost:5173, sign up with the email you put in FIRST_ADMIN_EMAIL, and you're the admin.

---

## Making yourself admin (if you forgot to set FIRST_ADMIN_EMAIL)

Sign up normally, then run this one-time command in the backend folder:

```bash
npx prisma studio
```

Open the `users` table, find your row, and change `role` from `USER` to `ADMIN`. Save and close.

---

## Deploying to Render (free, live on the internet)

### Step 1 — Create a PostgreSQL database on Render

1. Go to render.com → New → PostgreSQL
2. Name: `sortech-wardrobe-db`
3. Plan: **Free**
4. Click Create. Copy the **External Database URL** — you need it in Step 3.

### Step 2 — Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sortech-wardrobe.git
git push -u origin main
```

### Step 3 — Deploy the backend on Render

1. New → Web Service → Connect your GitHub repo
2. Root directory: `backend`
3. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start Command: `npm start`
5. Plan: **Free**
6. Add Environment Variables:

```
DATABASE_URL         <paste the External Database URL from Step 1>
JWT_SECRET           <long random string>
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CORS_ORIGIN          https://YOUR-FRONTEND.onrender.com   (fill after Step 4)
FIRST_ADMIN_EMAIL    your@email.com
PORT                 (leave blank — Render sets this automatically)
```

7. Click Deploy. Wait for "Live". Copy the backend URL (e.g. `https://sortech-wardrobe-api.onrender.com`).

### Step 4 — Deploy the frontend on Render

1. New → Static Site → Connect same GitHub repo
2. Root directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add Environment Variable:

```
VITE_API_URL   https://sortech-wardrobe-api.onrender.com/api
```

6. Click Deploy. Wait for "Live". Copy the frontend URL.

### Step 5 — Update CORS on the backend

Go back to the backend service → Environment → update `CORS_ORIGIN` to the frontend URL from Step 4. Render will redeploy automatically.

### Step 6 — Sign up as admin

Open the frontend URL, sign up with the email matching `FIRST_ADMIN_EMAIL`. You'll automatically get the ADMIN role and see the Admin link in the nav.

---

## Inviting friends

Send them your frontend URL. They sign up themselves. Their wardrobe is 100% isolated from yours — nobody can see anyone else's clothes. You (admin) can only see counts.

---

## Scaling guide (when it outgrows the free tier)

### 20 → 100 users

| What breaks | Fix | Cost |
|---|---|---|
| Render free backend sleeps after 15 min | Upgrade to Render Starter ($7/mo) | $7/mo |
| Render free DB hits 1GB | Upgrade to Render Starter DB ($7/mo) | $7/mo |
| Cloudinary 25 credits/month | Upgrade to Cloudinary Plus (~$89/mo) OR switch to Backblaze B2 ($0.006/GB) | Low |

Total at 100 users: ~$15–20/month

### 100 → 1,000 users

- Move backend to **Railway** or **Fly.io** (auto-scaling, better pricing at this tier)
- Move DB to **Supabase Pro** ($25/mo, 8GB, connection pooling via PgBouncer)
- Add **Redis** (Upstash free tier) for caching stats queries
- Add image size limits and Cloudinary upload presets to control storage growth
- Add **per-user item limits** via the `MAX_ITEMS_PER_USER` constant in `clothingController.js` (already in place — just increase the number)
- Set up database indices: already defined in `schema.prisma` (`@@index([userId])` on both `clothing_items` and `outfits`)

Total at 1,000 users: ~$50–80/month

### 1,000 → 10,000 users (subscription model)

- Introduce Stripe subscriptions (you already have the PMS Stripe experience)
- Move images to **AWS S3 + CloudFront CDN** (much cheaper at scale than Cloudinary)
- Split backend into separate services: auth, wardrobe, outfits (microservices or just separate Render services)
- Move to **managed Postgres on AWS RDS or Supabase** with read replicas
- Add a job queue (BullMQ + Redis) for async image processing
- Implement proper rate limiting per user, not just per IP
- Add monitoring: **Sentry** (free tier) for errors, **Render Metrics** for infra

Total at 10,000 users with $5/mo subscriptions: revenue covers costs easily.

---

## Project structure

```
sortech-wardrobe/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # DB schema (users, clothing_items, outfits)
│   ├── src/
│   │   ├── config/db.js         # Prisma singleton
│   │   ├── controllers/         # authController, clothingController, outfitController, adminController
│   │   ├── middleware/          # auth.js (JWT check), adminOnly.js
│   │   ├── routes/              # one file per resource
│   │   ├── utils/cloudinary.js  # multer + Cloudinary storage
│   │   └── index.js             # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance with auth headers
    │   ├── components/           # Logo, Navbar, ClothingCard, CategoryStats, ProtectedRoute
    │   ├── context/AuthContext.jsx
    │   ├── pages/                # Home, Login, Signup, Wardrobe, Outfits, Admin, SharedOutfit
    │   ├── styles/index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Admin capabilities

- View total user count, total items uploaded, total outfits — aggregate only
- See each user's name, email, join date, item count, outfit count
- Promote any user to ADMIN or demote them
- Cannot see any user's photos or wardrobe contents (privacy preserved by design)

---

## Security notes

- Passwords are hashed with bcrypt (cost factor 10)
- JWTs expire after 7 days
- Login and signup endpoints are rate-limited (30 requests per 15 min)
- Every wardrobe/outfit query is scoped to `userId === req.user.id` — no user can access another user's data even with a valid token
- Images are uploaded to Cloudinary under each user's own folder path
- Share tokens are random 12-character strings (nanoid) — not guessable
- Shared outfit endpoint returns item names, categories, and images only — never the owner's email, other wardrobe items, or any personal info
