# SentientZone Installer App

This is a mobile-first web application for SentientZone-certified installers to manage their appointments, inventory, and feedback in the field.

## Features
- Appointment Summary with status indicators
- Inventory Activity Log with confirmation workflow
- Installer Feedback and IFI submission
- Mobile-friendly interface styled with Tailwind CSS

## Stack
- React + Vite
- Tailwind CSS (PostCSS integration, no CDN)
- Mock data hooks (swap for Firebase or REST APIs)
- Designed for progressive enhancement into a native app

## Setup
Clone the repo and install dependencies:
```bash
npm install
```

Start the dev server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

The calendar component relies on styles from `react-big-calendar`; ensure
`react-big-calendar/lib/css/react-big-calendar.css` is loaded (imported in
`JobCalendar.tsx`).

Lint the project:
```bash
npm run lint
```

Format all files with Prettier:
```bash
npm run format
```

## Project Structure
```
src/
  components/          // shared UI components
  hooks/               // mock data hooks
  pages/               // route pages
  App.jsx              // router with page routes
  main.jsx             // ReactDOM entry
index.html             // Vite HTML entry
```

## Running Locally
- Install dependencies with `npm install`.
- Run `npm run dev` and open the shown localhost URL.

## Extending the App
- Components live under `src/components` and pages under `src/pages`.
- Add new routes by editing `src/routes.ts` and wiring them in `src/App.jsx`.
- Replace the mock logic in `src/hooks/useInstallerData.js` with real API calls or Firebase queries.

## Production Checklist
- ✅ All components declare PropTypes for type safety
- ✅ Prettier formatting and ESLint linting scripts
- ✅ Tailwind integrated via PostCSS (no CDN usage)
- ✅ Mock data persisted to localStorage
- ✅ Routes and navigation centralized using `src/routes.ts`

## Roadmap
- Swap mock data for backend integration (Firebase or REST APIs)
- Implement user authentication and persistent storage
- Expand the IFI dashboard with charts and analytics

### Environment Variables

Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_API_KEY` or `VITE_SUPABASE_ANON_KEY`

Optional (for compatibility only; values fall back automatically):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
