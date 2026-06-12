# 👁 Wisdom Eye — VOICE Publication

> A full-stack Next.js web application for the **Wisdom Eye** book by Radheshyam Das, published by VOICE (Vaishnava Institute for Culture and Education), ISKCON Pune.

The platform handles online course enrollment, physical book orders with Razorpay payment integration, automated email notifications, shipment tracking, and an admin dashboard.

---

## 🌐 Live Demo

- **Website:** [https://wisdom-eye.vercel.app](https://wisdom-eye.vercel.app)
- **Course Platform:** [Ongraphy Course Page](https://coursesradheshyamdas.ongraphy.com/courses/Wisdom-Eye-689c419d8fb8275d3690dac1)

---

## ✨ Features

### 🛒 Payments & Orders
- **Razorpay** payment gateway integration (UPI, Cards, Net Banking)
- Server-side payment signature verification using HMAC-SHA256 — tamper-proof
- Webhook support for Ongraphy (Graphy) enrollment events
- Order success redirects to a personalized Thank You page

### 📦 Shipment Tracking
- Public tracking portal at `/track` — search by email or mobile number
- Supports multiple courier partners: Speed Post, DTDC, Delhivery, Blue Dart, Amazon Shipping
- **Custom courier support** — admin can enter any courier name, tracking ID, and portal URL
- Deep-link to courier tracking websites directly

### 📧 Email Notifications
- Beautiful HTML enrollment confirmation emails via SMTP (Nodemailer)
- Shipment dispatch emails with tracking details and direct courier portal links
- Graceful fallback — app continues working even if SMTP is misconfigured

### 🔐 Admin Dashboard (`/admin`)
- Password-protected admin panel (session cookie-based)
- View all registrations with payment status, delivery type, and shipping status
- Update shipping details per order (courier + tracking ID)
- Custom courier option with name, tracking number, and portal URL
- Retry failed Graphy enrollment API calls
- Paginated registration list

### 📖 Content Pages
- Home page with book details, course curriculum, and YouTube embed
- Contact, Privacy Policy, Terms & Conditions, Refund Policy, Shipping Policy

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Payments | [Razorpay](https://razorpay.com/) |
| Email | [Nodemailer](https://nodemailer.com/) (SMTP) |
| Hosting | [Vercel](https://vercel.com/) |
| Styling | Vanilla CSS (custom design system) |

---

## 📁 Project Structure

```
wisdom-eye/
├── public/
│   └── images/              # Book cover and course-related images
├── src/
│   ├── app/
│   │   ├── page.js          # Homepage
│   │   ├── admin/page.js    # Admin dashboard
│   │   ├── track/page.js    # Public shipment tracker
│   │   ├── thank-you/       # Post-payment success page
│   │   ├── contact/         # Contact page
│   │   ├── privacy/         # Privacy policy
│   │   ├── terms/           # Terms & conditions
│   │   ├── refund-policy/   # Refund policy
│   │   ├── shipping-policy/ # Shipping policy
│   │   └── api/
│   │       ├── create-order/       # Razorpay order creation
│   │       ├── verify-payment/     # Razorpay signature verification
│   │       ├── track/              # Tracking lookup endpoint
│   │       ├── admin/
│   │       │   ├── auth/           # Admin login/logout
│   │       │   ├── registrations/  # Manage shipping
│   │       │   └── settings/       # Admin settings
│   │       └── webhooks/
│   │           └── graphy/         # Ongraphy enrollment webhook
│   ├── components/
│   │   └── checkout-modal.js  # Razorpay checkout modal component
│   └── lib/
│       ├── mail.js            # Email sending (enrollment + shipment)
│       └── supabase.js        # Supabase client
├── database_schema.sql        # SQL schema for Supabase setup
├── .gitignore
└── README.md
```

---

## 🗄 Database Setup

Run [`database_schema.sql`](./database_schema.sql) in your **Supabase SQL Editor** to create the required tables:

- `registrations` — stores all orders, payment status, delivery type, and shipping info

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory. **Never commit this file.**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx

# SMTP (Email)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password
SMTP_FROM_EMAIL=manager@voicepune.com
SMTP_FROM_NAME=Wisdom Eye VOICE

# Admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SESSION_SECRET=your-session-secret

# App
NEXT_PUBLIC_WEBSITE_URL=https://your-domain.vercel.app

# Graphy / Ongraphy Webhook
GRAPHY_API_KEY=your-graphy-api-key
GRAPHY_COURSE_ID=your-course-id
GRAPHY_WEBHOOK_SECRET=your-webhook-secret
```

---

## 🚀 Getting Started (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/smvd-rns/wisdom-eye.git
cd wisdom-eye

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local
# Fill in all values in .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment (Vercel)

1. Push your code to GitHub (`.env.local` is automatically excluded by `.gitignore`)
2. Connect the repository to [Vercel](https://vercel.com/)
3. Add all environment variables in **Vercel → Project → Settings → Environment Variables**
4. Deploy — Vercel handles the rest automatically

---

## 🔒 Security Notes

- **Payment verification** is done server-side using Razorpay's HMAC-SHA256 signature — frontend tampering is not possible
- **Admin panel** is protected by a server-side session cookie
- **`.env.local`** is excluded via `.gitignore` — secrets never reach GitHub
- **Supabase Service Role Key** is only used server-side in API routes, never exposed to the client

---

## 📬 Contact & Support

For technical queries, contact:

- **Email:** manager@voicepune.com
- **Phone:** +91 8605036000
- **Organization:** VOICE — Vaishnava Institute for Culture and Education, ISKCON Pune

---

## 📄 License

This project is proprietary software developed for VOICE Publication, ISKCON Pune.  
© 2025 Wisdom Eye / VOICE Publication. All rights reserved.
