# 🔖 SmartBookmark — Intelligent Cloud Bookmark Manager

SmartBookmark is a full-stack web application that allows users to securely save, manage, and access their bookmarks from anywhere using Google authentication and a cloud database.

The project demonstrates a real SaaS-style architecture including OAuth login, protected routes, real-time updates, and deployment.

---

## 🌐 Live Website
https://smart-bookmark-two-iota.vercel.app

---

## 📌 Problem Statement

Users today work across multiple devices (college systems, laptops, mobile phones).  
Browser bookmarks are stored locally and are not always accessible everywhere. They also lack searchability and tracking.

SmartBookmark solves this by providing:

- A centralized bookmark storage
- Secure login
- Access from any device
- Visit tracking
- Realtime updates

---

## ✨ Features

### 🔐 Authentication
- Google OAuth Login
- Secure session management
- Automatic login persistence
- Protected dashboard

### 📚 Bookmark Management
- Add new bookmarks
- Auto-generate website title
- Website favicon detection
- Delete bookmarks
- Copy link to clipboard
- Open links directly

### 🔎 Smart Search
- Instant search filtering
- Search by URL or title

### 🕒 Visit Tracking
- Records last visited time
- Displays “Never visited” or timestamp

### ⚡ Realtime Sync
- Bookmark updates appear instantly
- No page refresh required

### ☁️ Cloud Access
- Accessible from any device
- Data stored in PostgreSQL cloud database

---

## ⚠️ Challenges Faced & How They Were Solved

### 1. OAuth Redirect Loop (Production Login Failed)
**Problem:**  
After deployment, Google login succeeded but the browser showed `localhost refused to connect` or redirected incorrectly.

**Cause:**  
Supabase authentication was still using the localhost URL as the Site URL, so after Google authentication it redirected users to the wrong location.

**Solution:**  
Updated the Supabase Authentication settings:
- Set the Site URL to the deployed Vercel domain
- Configured correct redirect URL `/auth/callback`
- Corrected Google OAuth redirect URI to point only to Supabase callback


### 2. Login Worked Locally but Failed on Vercel
**Problem:**  
Authentication worked on localhost but failed in production.

**Cause:**  
The OAuth session token returned by Supabase was not being exchanged for a user session in Next.js App Router.

**Solution:**  
Implemented a custom callback route:
```
src/app/auth/callback/route.ts
```
This route exchanges the OAuth authorization code using:
```
supabase.auth.exchangeCodeForSession()
```

which creates a valid login session cookie.


### 3. Automatic Logout / Session Not Persisting
**Problem:**  
Users were logged out after refresh or stuck on the login page.

**Cause:**  
The login page only checked the session once using `getSession()` and did not listen for authentication state changes after OAuth redirect.

**Solution:**  
Used Supabase auth listener:
```
supabase.auth.onAuthStateChange()
```
to detect successful login and redirect users to the dashboard.


### 4. Realtime Updates Not Working
**Problem:**  
Bookmarks did not update automatically across multiple tabs.

**Cause:**  
The bookmarks table was not properly registered in Supabase realtime publication.

**Solution:**  
Enabled realtime subscriptions and added the `bookmarks` table to the `supabase_realtime` publication so database updates trigger UI refresh.


### 5. Visit Tracking Did Not Update
**Problem:**  
“Last visited” timestamp never changed after opening a bookmark.

**Cause:**  
Opening the link immediately navigated away before the database update completed.

**Solution:**  
Intercepted the click event, updated `last_visited` in database first, then opened the website.  
Also implemented optimistic UI update to instantly reflect changes.


### 6. Next.js Cookie Handling Error
**Problem:**  
Production build failed with cookie handling errors in Next.js 16.

**Cause:**  
`cookies()` in Next.js 16 is asynchronous, but the authentication route used synchronous access.

**Solution:**  
Updated the callback route to use:
```
const cookieStore = await cookies();
```
and passed it to the Supabase server client.

---


## 🏗️ System Architecture

```
User
↓
Google OAuth
↓
Supabase Authentication
↓
Next.js Server (Session Handling)
↓
Supabase PostgreSQL Database
↓
Realtime Subscription
↓
Dashboard UI
```


---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

### Backend / Cloud
- Supabase (PostgreSQL + Authentication + Realtime)

### Authentication
- Google OAuth 2.0

### Deployment
- Vercel

---

## 🗄️ Database Schema

### `bookmarks` table

| Column | Type | Description |
|------|------|------|
| id | uuid | Unique bookmark ID |
| user_id | uuid | Owner user |
| title | text | Bookmark title |
| url | text | Website URL |
| favicon | text | Website icon |
| created_at | timestamp | Created time |
| last_visited | timestamp | Last opened time |

Row Level Security ensures users can only see their own bookmarks.

---

## 🔐 Security

- OAuth authentication (no password storage)
- Row Level Security (RLS)
- Protected routes
- Server-side session cookies
- User-scoped queries

---

## 🧪 Running Locally

### 1. Clone repository
```
git clone https://github.com/komallbaid/smart-bookmark.git

cd smart-bookmark
```


### 2. Install dependencies
```
npm install
```


### 3. Create `.env.local`
Create a file named `.env.local` and add:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```


### 4. Run project
```
npm run dev
```

Open in browser:
```
http://localhost:3000
```


---

## 🚀 Deployment

The project is deployed using **Vercel**.

Steps:
1. Push code to GitHub
2. Import repository into Vercel
3. Add environment variables
4. Configure Supabase OAuth redirect URLs
5. Deploy

---

## 🎯 Learning Outcomes

Through this project I learned:

- Implementing OAuth authentication
- Handling redirect URIs
- Managing user sessions
- Protected routing
- Using a cloud PostgreSQL database
- Realtime subscriptions
- Local vs production configuration
- Debugging production authentication issues
- Full-stack deployment

---

## 👩‍💻 Author

**Komal Baid**  
Computer Science Engineering Student

GitHub: https://github.com/komallbaid

---

## 📄 License
This project is for educational and portfolio purposes.
