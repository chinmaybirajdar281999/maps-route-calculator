# Deploying Maps Route & Toll Calculator on Render

## Prerequisites
- A GitHub account with this repo pushed
- A [Render](https://render.com) account (free tier works)
- Your Mapbox access token

---

## Option A: One-Click Blueprint (Recommended)

The `render.yaml` in the repo root auto-creates all 4 services.

1. **Push code to GitHub**
   ```bash
   cd /Users/chinmay/Downloads/Maps
   git init && git add -A && git commit -m "initial commit"
   # Create a repo on GitHub, then:
   git remote add origin https://github.com/<you>/maps-route-calculator.git
   git branch -M main && git push -u origin main
   ```

2. **Create Blueprint on Render**
   - Go to https://dashboard.render.com → **New** → **Blueprint**
   - Connect your GitHub repo
   - Render reads `render.yaml` and shows 4 services:
     - `maps-postgres` (PostgreSQL)
     - `maps-redis` (Redis)
     - `maps-backend` (Node.js Web Service)
     - `maps-frontend` (Static Site)
   - Click **Apply**

3. **Set secret environment variables**
   After the blueprint deploys, go to each service's **Environment** tab:

   | Service         | Variable                  | Value                          |
   |-----------------|---------------------------|--------------------------------|
   | maps-backend    | `MAPBOX_ACCESS_TOKEN`     | `pk.eyJ1...` (your token)     |
   | maps-frontend   | `REACT_APP_MAPBOX_TOKEN`  | same Mapbox token              |

4. **Update cross-service URLs**
   After the first deploy, Render assigns URLs like `maps-backend.onrender.com`.
   Update these env vars with the actual URLs:

   | Service         | Variable             | Value                                        |
   |-----------------|----------------------|----------------------------------------------|
   | maps-backend    | `FRONTEND_URL`       | `https://maps-frontend.onrender.com`         |
   | maps-frontend   | `REACT_APP_API_URL`  | `https://maps-backend.onrender.com/api`      |

   Then **Manual Deploy** → **Clear build cache & deploy** on both services.

5. **Seed the database**
   - Go to `maps-postgres` → **Shell** tab (or use the external connection string)
   ```bash
   # Connect using the External Database URL from the Render dashboard
   psql <EXTERNAL_DATABASE_URL>
   ```
   - Paste the contents of `database/schema.sql` to create the table
   - Paste the contents of `database/seed_tolls.sql` to load toll data
   - (Optional) Run `database/calibrate_tolls.js` locally against the external URL

6. **Verify**
   - Visit `https://maps-frontend.onrender.com` — the map should load
   - Health check: `https://maps-backend.onrender.com/health` should return `{"status":"ok"}`

---

## Option B: Manual Setup (service by service)

### Step 1: Create PostgreSQL Database
1. Render Dashboard → **New** → **PostgreSQL**
2. Name: `maps-postgres`, Plan: **Free**, DB Name: `route_toll_db`
3. After creation, copy the **Internal Database URL** (starts with `postgres://`)

### Step 2: Create Redis Instance
1. Render Dashboard → **New** → **Redis**
2. Name: `maps-redis`, Plan: **Free**
3. After creation, copy the **Internal Redis URL** (starts with `redis://`)

### Step 3: Deploy Backend
1. Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `maps-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   MAPBOX_ACCESS_TOKEN=pk.eyJ1...your_token
   DATABASE_URL=postgres://...  (Internal URL from Step 1)
   REDIS_URL=redis://...        (Internal URL from Step 2)
   FRONTEND_URL=https://maps-frontend.onrender.com
   ```
5. Add **Health Check Path**: `/health`

### Step 4: Deploy Frontend
1. Render Dashboard → **New** → **Static Site**
2. Connect same repo
3. Settings:
   - **Name**: `maps-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://maps-backend.onrender.com/api
   REACT_APP_MAPBOX_TOKEN=pk.eyJ1...your_token
   ```
5. Add a **Rewrite Rule**: `/*` → `/index.html` (for React Router/SPA)

### Step 5: Seed Database
Same as Blueprint Option step 5.

---

## Important Notes

### Free Tier Limitations
- **Spin-down**: Free web services spin down after 15 min of inactivity.
  First request after idle takes ~30-50s. Consider upgrading to Starter ($7/mo)
  to keep it always on.
- **PostgreSQL**: Free tier expires after 90 days. Export/reimport before expiry.
- **Redis**: Free tier = 25 MB max memory.

### Things to Watch
- After every push to `main`, Render auto-deploys both services.
- If the frontend shows CORS errors, double check `FRONTEND_URL` on the backend
  matches the exact Render URL (including https://).
- The cluster mode (`NUM_WORKERS`) is handled automatically —  Render free tier
  gives 1 CPU, so it runs 1 worker. On paid plans it scales with available CPUs.

### Custom Domain (Optional)
1. Go to the service → **Settings** → **Custom Domains**
2. Add your domain and set DNS CNAME to `<service>.onrender.com`
3. Update `FRONTEND_URL` and `REACT_APP_API_URL` to use the custom domain

---

## Quick Verification Checklist

```
✅ https://maps-backend.onrender.com/health → {"status":"ok"}
✅ https://maps-frontend.onrender.com → Map loads
✅ Calculate a route → tolls + fuel cost displayed
✅ https://maps-backend.onrender.com/admin/analytics → event counts
```
