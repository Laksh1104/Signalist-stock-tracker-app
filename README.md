# 📈 Signalist – Stock Market Watchlist & Alert Platform

## 📋 Table of Contents
- Introduction  
- Tech Stack  
- Features  
- Live Deployment  
- Optional: Run Locally  
---

## ✨ Introduction

**Signalist** is an AI-powered, modern stock market platform built with **Next.js, TypeScript, Better Auth, shadcn/ui, and Inngest**.  
It enables users to track real-time stock prices, manage personalized watchlists, configure price alerts, and explore in-depth company insights—such as profile and financials.

The platform uses **event-driven workflows** to power real-time price alerts, AI-generated daily market summaries, and earnings notifications.  
Signalist is **production-deployed on Vercel**, but developers can also run it locally if they wish to explore or extend the codebase.

---

## ⚙️ Tech Stack

- **Next.js (App Router)** – Full-stack React framework with Server Actions  
- **TypeScript** – Type-safe development and improved maintainability  
- **Better Auth** – Secure authentication (email/password, OAuth-ready)  
- **MongoDB** – NoSQL database for users, watchlists, alerts, and events  
- **Inngest** – Event-driven workflows and background jobs  
- **Finnhub API** – Real-time stock market and financial data  
- **Nodemailer** – Transactional emails and notifications  
- **shadcn/ui + Tailwind CSS** – Accessible, responsive UI components  
- **CodeRabbit** – AI-powered code review and quality enforcement  
- **Vercel** – Production deployment and hosting  

---

## 🔋 Features

 **Real-Time Stock Dashboard**  
Track live stock prices with interactive line and candlestick charts, including historical data and performance trends.

 **Powerful Search**  
Quickly search up stock details.

 **Watchlists & Alerts**  
Create personalized watchlists, set price alerts, and receive instant email notifications when targets are hit.

 **Company Insights**  
View detailed financial metrics such as PE ratio, EPS, revenue, analyst ratings, sentiment scores, filings, and news.

 **Event-Driven Workflows**  
Automate price monitoring, alert scheduling, background jobs, and AI workflows using Inngest.

 **AI-Powered Digests & Alerts**  
Receive personalized daily market summaries, earnings alerts, and performance insights via email.

 **Customizable Notifications**  
Fine-tune alerts based on user preferences and watchlist behavior.

 **Analytics & Insights**  
Monitor engagement, stock trends, and user activity for data-driven decisions.

---

## 🌐 Live Deployment

🚀 **Live App (Vercel):**  
[https://signalist-stock-tracker-app-pink-mu.vercel.app/]

---

## Optional: Run Locally

If you’d like to run Signalist on your local machine:

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/Laksh1104/Signalist-stock-tracker-app.git
cd signalist-stock-tracker-app
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY=
FINNHUB_BASE_URL=https://finnhub.io/api/v1

# MONGODB
MONGODB_URI=

# BETTER AUTH
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# GEMINI
GEMINI_API_KEY=

#NODEMAILER
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

Replace the placeholder values with your real credentials. You can get these by signing up at: [**MongoDB**](https://www.mongodb.com/products/platform/atlas-database), [**Gemini**](https://aistudio.google.com/prompts/new_chat?utm_source=chatgpt.com), [**Inngest**](https://jsm.dev/stocks-inggest), [**Finnhub**](https://finnhub.io).

**Running the Project**

```bash
npm run dev
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

