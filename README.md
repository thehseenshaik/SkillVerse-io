<p align="center">
  <h1 align="center">🚀 SkillVerse</h1>
  <p align="center"><strong>Your Complete Career Operating System</strong></p>
  <p align="center">
    One profile · One dashboard · Your entire career
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
</p>

---

## 📖 About

**SkillVerse** is an AI-powered career platform that unifies your professional presence across LinkedIn, GitHub, LeetCode, and 7+ coding platforms into a single intelligent dashboard. It guides students and developers from profile building to placement-ready — with AI-powered resume analysis, mock interviews, career roadmaps, and skill-gap identification.

> **Status:** Currently in Beta 🟢

---

## ✨ Key Features

### 🎯 Career Command Center (Dashboard)
- **AI Career Score** — A single number (out of 100) that reflects your overall career readiness
- **Coding Streaks** — Track daily coding consistency across platforms
- **Weekly Goals** — Set and monitor personalized career goals
- **Activity Feed** — Real-time feed of your progress across all connected platforms
- **Achievements & Badges** — Gamified milestones to keep you motivated

### 🔗 Platform Integrations (Identity Hub)
Connect and sync data from **10+ platforms**:

| Platform | Data Synced |
|----------|-------------|
| **GitHub** | Repos, contributions, languages, stars |
| **LinkedIn** | Profile data, connections |
| **LeetCode** | Problems solved, contest ratings, streaks |
| **GeeksforGeeks** | Practice problems, scores |
| **HackerRank** | Badges, certifications |
| **CodeChef** | Ratings, contests |
| **Codeforces** | Ratings, problem stats |
| **Kaggle** | Competitions, datasets |
| **Dev.to** | Articles, followers |
| **Medium** | Blog posts, engagement |

### 🤖 AI-Powered Tools (Gemini AI)
- **Resume Analyzer** — Get instant ATS compatibility scores and improvement suggestions
- **Resume Generator** — Auto-generate tailored resumes from your profile data
- **Cover Letter Writer** — AI-crafted cover letters for specific job applications
- **Mock Interview Coach** — Practice with AI interviewer for behavioral & technical rounds
- **Career Roadmap** — Personalized learning paths based on your target role
- **Skill Gap Analysis** — Compare your skills against target companies (Google, Microsoft, Amazon, etc.)
- **Company Match** — Find companies that best match your current skill set
- **Portfolio Review** — Get AI feedback on your project portfolio
- **Project Review** — Code-level review and improvement suggestions
- **AI Career Assistant** — Chat-based career guidance on demand

### 📄 Resume Builder
- Multiple professional templates
- Real-time preview with PDF export
- Auto-populated from your SkillVerse profile
- ATS-optimized formatting

### 📊 Analytics & Statistics
- Platform-wise performance tracking
- Progress over time visualizations (Recharts)
- Contribution heatmaps
- Career score breakdown

### 🏗️ Connections & Networking
- Discover and connect with other SkillVerse users
- Premium networking features
- Collaboration opportunities

### 👤 Professional Profile
- Unified career identity page
- Education, experience & project sections
- Shareable public profile (`/u/username`)
- Portfolio editor

### 🔐 Authentication & Security
- Email/password sign-up with email verification
- Google & GitHub OAuth login
- Password reset & change
- Session management with auto-logout
- Role-based access (User / Moderator / Admin)
- Rate limiting & Firestore security rules

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **TypeScript 5.8** | Type safety |
| **Vite 8** | Build tool & dev server |
| **TanStack Router** | File-based routing |
| **TanStack Query** | Server state management |
| **Zustand** | Client state management |
| **Tailwind CSS 4** | Utility-first styling |
| **Radix UI** | Accessible component primitives |
| **Lucide + React Icons** | Icon system |
| **Recharts** | Data visualization charts |
| **Sonner** | Toast notifications |
| **React Hook Form + Zod** | Form handling & validation |
| **jsPDF + html2canvas** | PDF generation |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express 5** | API server |
| **Firebase Auth** | Authentication |
| **Cloud Firestore** | Database |
| **Firebase Storage** | File storage |
| **Firebase Admin SDK** | Server-side Firebase |
| **Google Gemini AI** | AI features (gemini-2.5-flash / pro) |
| **Helmet** | Security headers |

---

## 📁 Project Structure

```
SkillVerse-io/
├── public/                    # Static assets
├── server/                    # Express backend API
│   ├── routes/                # API routes (GitHub, LeetCode, etc.)
│   ├── database.js            # Firebase Admin database helpers
│   └── index.js               # Server entry point
├── src/
│   ├── assets/                # Images & media
│   ├── components/
│   │   ├── ui/                # Reusable UI components (shadcn/ui)
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── analytics/         # Analytics components
│   │   ├── identity-hub/      # Platform integration components
│   │   └── resume/            # Resume builder components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── connectors/        # Platform API connectors (11 platforms)
│   │   ├── services/          # Business logic services
│   │   ├── validation/        # Zod schemas
│   │   ├── auth-context.tsx   # Auth state provider
│   │   ├── profile-context.tsx # Profile state provider
│   │   ├── firebase.ts        # Firebase client config
│   │   ├── platform-store.ts  # Zustand store for platforms
│   │   └── session.ts         # Session management
│   ├── routes/                # TanStack file-based routes (50+ pages)
│   ├── services/              # Auth service layer
│   ├── types/                 # TypeScript type definitions
│   ├── client.tsx             # App entry point
│   ├── router.tsx             # Router configuration
│   └── styles.css             # Global styles & design tokens
├── firestore.rules            # Firestore security rules
├── storage.rules              # Firebase Storage security rules
├── firebase.json              # Firebase project config
├── vite.config.ts             # Vite configuration
└── package.json               # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ — [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js) or **Bun**
- A **Firebase** project (free tier works)
- A **Google Gemini API** key (for AI features)

### 1. Clone the Repository

```bash
git clone https://github.com/thehseenshaik/SkillVerse-io.git
cd SkillVerse-io
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

Copy the example environment files and fill in your values:

```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp server/.env.example server/.env
```

#### Frontend `.env` (key variables):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

#### Backend `server/.env` (key variables):
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
PORT=3001
```

### 4. Set Up Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password, Google, GitHub providers)
3. Create a **Firestore** database
4. Enable **Storage**
5. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

### 5. Run the Application

```bash
# Run frontend only
npm run dev

# Run frontend + backend together
npm run dev:server
```

The app will be available at **http://localhost:5173** and the API server at **http://localhost:3001**.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:server` | Start frontend + backend concurrently |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run server` | Start backend only |

---

## 🔒 Security

- **Firestore Rules** — Row-level security with owner-only access, admin overrides, and role checks
- **Storage Rules** — File type validation and size limits per user
- **Rate Limiting** — Both client-side and server-side rate limiting
- **Helmet.js** — Security headers on the API server
- **Session Management** — Auto-logout on inactivity, persistent sessions with "Remember Me"
- **Input Validation** — Zod schemas on all forms

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👨‍💻 Author

**Shaik Thehseen** — [@thehseenshaik](https://github.com/thehseenshaik)

---

<p align="center">
  Built with ❤️ for students and developers who want to take control of their career journey.
</p>
