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
