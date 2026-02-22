# IA 369 Admin Panel

The **IA 369 Admin Panel** is the official web-based administrative dashboard designed to manage the core operations, modules, and user base of the IA 369 mobile application ecosystem. Built for speed, high-end aesthetics, and robust content management.

## 🚀 Tech Stack

- **Framework**: Prevailing [Next.js v14](https://nextjs.org/) (App/Pages router framework based on React 18) ensuring Server-Side Rendering (SSR) capabilities and optimized performance.
- **UI Architecture**: Fully constructed using [Material-UI (MUI) v5](https://mui.com/) embracing a bespoke, dark-themed "Glassmorphism" design system tailored for institutional grade financial applications.
- **State & Data Handling**: Powered by **Firebase (Firestore & Storage)** for real-time NoSQL data synchronization and media asset management.
- **Styling**: `emotion` for advanced CSS-in-JS capabilities, deeply integrated with MUI's theming engine.

## 🏗 Features & Modules

### 1. 📊 Signals Management (Señales)
- Create, Read, Update, and Delete (CRUD) trading signals.
- Premium visualization cards with real-time status toggles (`Hit T.P 1`, `Hit Stop Loss`).
- Built-in `FormSignal` modal for attaching analytical charts and setting entry metrics (Entry Price, Take Profit, Stop Loss).

### 2. 🎥 Video Academy (Videos)
- Comprehensive video cataloging system mimicking premium streaming interfaces (e.g., Vimeo).
- Categories management for structured learning courses.
- Advanced `react-dropzone` integration for seamless drag-and-drop video uploads directly to Firebase Storage.

### 3. 👥 Subscriptions & User Management (CRM)
- Centralized Data Grid for managing the platform's client base.
- Fast tracking of user roles (`user`, `premium`, `admin`).
- Ability to manually extend subscriptions or modify access privileges instantly.

### 4. 🏷 Promotions Management
- Dynamic management of promotional banners and affiliate links.
- Image injection and redirect implementations.

## 🎨 Aesthetic Profile

The application utilizes a custom-built **Sleek Dark Theme** (`#050B14`, `#0D1117`, `#111827`). 
It features:
- **Glassmorphism Components**: Translucent panels (`backdropFilter: 'blur(12px)'`) blending backgrounds elegantly.
- **Institutional Typography**: Deep grays (`#6B7280`) contrasted with stark white values to guide the eye across critical financial data.
- **Intelligent Iconography**: Leveraging MUI's Outlined icon set for a minimalist, uncluttered feel.

## ⚙️ Local Development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (Firebase config) if applicable via `.env.local`.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or 3001 depending on port availability) with your browser to see the result.

## 🛡 Authentication & Security
The platform uses Firebase Auth logic combined with Next.js API routes (if applicable) for securing notification triggers and admin-only panel routes.
