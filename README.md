# AI Mock Interview App

An AI-powered mock interview preparation platform built with React and Supabase. AI Mock Interview App helps users practice behavioral, technical, system design, and mixed interviews with real-time AI feedback and performance analytics.

## Features

- **AI Mock Interviews** -- Practice with AI-generated questions across multiple interview types (Behavioral, Technical, System Design, Mixed)
- **Real-Time Feedback** -- Get AI-powered scoring and feedback on each response
- **Follow-Up Questions** -- Dynamic follow-up questions based on your answers
- **Session History** -- Track past interviews with scores and summaries
- **Question Bank** -- Browse and filter practice questions by type and difficulty
- **Performance Dashboard** -- View your recent activity and progress at a glance
- **PDF Resume Parsing** -- Upload your resume to tailor interview questions

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend/Database:** Supabase (PostgreSQL + Auth)
- **AI:** Google Gemini API
- **Routing:** React Router v7
- **Styling:** CSS

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/ENSF-FINAL-PROJECT.git
cd ENSF-FINAL-PROJECT
```

### 2. Install dependencies

```bash
cd app
npm install
```

### 3. Set up environment variables

Create a `.env` file inside the `app/` directory with the following variables:

```env
VITE_SUPABASE_URL=https://cebxudadkixqvqwnmvlo.supabase.co/
VITE_SUPABASE_ANON_KEY=sb_publishable_gUwWW_xyijfETIpfIfCneA_vVtWMz3e
VITE_GEMINI_API_KEY=AIzaSyAmuinIdmCfAthgEknWAtdA1xCVEyo-ua0
```

**Environment variable details:**

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | The Supabase project URL. Use the value provided above -- it points to our shared project instance. |
| `VITE_SUPABASE_ANON_KEY` | The Supabase anonymous/public key. Use the value provided above. |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI-powered interview questions and feedback. A free-tier key is provided above for convenience so you do not need to create your own. |

> **Note:** These keys are intentionally included in the README to make it easy for TAs to run the project during evaluation. The Supabase key is a publishable (anon) key and the Gemini key is on the free tier.

### 4. Run the development server

```bash
cd app
npm run dev
```

The app will be available at **http://localhost:5173** (default Vite port).

### 5. Build for production (optional)

```bash
cd app
npm run build
npm run preview
```

## Project Structure

```
ENSF-FINAL-PROJECT/
  app/
    src/
      components/    # Reusable UI components (Layout, Navbar, ProtectedRoute, etc.)
      contexts/      # React context providers (AuthContext)
      pages/         # Page components (Dashboard, Auth, Interview, History, etc.)
      lib/           # Supabase client and utility modules
      App.jsx        # Root component with routing
      App.css        # Global styles
    supabase/
      schema.sql     # Database schema
    index.html       # Entry point
    vite.config.js   # Vite configuration
    package.json     # Dependencies and scripts
```

## Usage

1. **Sign Up / Log In** -- Create an account or log in on the auth page.
2. **Set Up an Interview** -- Choose interview type, difficulty, and optionally upload a resume.
3. **Practice** -- Answer AI-generated questions and receive real-time feedback.
4. **Review** -- View session summaries with per-question scores and overall performance.
5. **Track Progress** -- Check the dashboard and history page to monitor improvement over time.
