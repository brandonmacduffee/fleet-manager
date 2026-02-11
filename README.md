# 🚛 Roofing Pros USA — Fleet Manager v2.0

Project Manager Truck Assignment System with **cloud sync via Supabase**.

---

## ⚡ Quick Setup (15 minutes)

### Step 1: Create Supabase Project (free)

1. Go to **[supabase.com](https://supabase.com)** and sign up / log in
2. Click **"New Project"**
3. Name it `fleet-manager`, set a database password (save it), pick region **US East**
4. Wait ~60 seconds for it to spin up

### Step 2: Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from this project
4. **Copy the entire contents** and paste it into the SQL editor
5. Click **"Run"** — you should see "Success. No rows returned"
6. Go to **"Table Editor"** to verify you see 3 tables: `teams`, `members`, `app_users`

### Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings → API** (left sidebar, gear icon)
2. Copy these two values:
   - **Project URL** — looks like `https://abcdefg.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`

### Step 4: Deploy to Vercel

1. **Push this project to GitHub:**
   ```bash
   cd fleet-manager-v2
   git init
   git add .
   git commit -m "fleet manager v2 with supabase"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/fleet-manager.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** → "Add New Project" → Import your repo

3. **Before clicking Deploy**, expand **"Environment Variables"** and add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

4. Click **Deploy** — done! 🎉

Your app is now live at `your-project.vercel.app`

---

## 🔑 Login Credentials

| Username  | Password       | Role    |
|-----------|---------------|---------|
| admin     | roofpro2026   | Admin   |
| manager   | manager2026   | Manager |

---

## ✅ Features

- ☁️ **Cloud synced** — edits save to Supabase, visible on all devices
- 🔄 **Auto-refresh** — data refreshes every 30 seconds
- 📊 Dashboard with all 5 teams and PM/truck assignments
- ✏️ Edit mode — reassign PMs, change truck numbers, add/remove members
- 🚛 Vacant trucks tracking
- 🖨️ Print report matching original Excel spreadsheet layout
- 🔐 User login with role display
- 🎨 Neo-retro terminal UI

---

## 🛠️ Local Development

```bash
# Copy the env template and fill in your Supabase keys
cp .env.local.example .env.local

# Install & run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
fleet-manager-v2/
├── app/
│   ├── globals.css        # Neo-retro styles
│   ├── layout.js          # Root layout
│   └── page.js            # Entry point
├── components/
│   └── FleetManager.js    # Main app component
├── lib/
│   └── supabase.js        # Supabase client
├── public/
│   └── logo.png           # Company logo
├── supabase-schema.sql    # Database setup (run once)
├── .env.local.example     # Environment vars template
└── package.json
```
