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
- Add new routes by editing `src/navConfig.js` and `src/App.jsx`.
- Replace the mock logic in `src/hooks/useInstallerData.js` with real API calls or Firebase queries.

## Production Checklist
- ✅ All components declare PropTypes for type safety
- ✅ Prettier formatting and ESLint linting scripts
- ✅ Tailwind integrated via PostCSS (no CDN usage)
- ✅ Mock data persisted to localStorage
- ✅ Routes and navigation centralized in `src/navConfig.js`

## Roadmap
- Swap mock data for backend integration (Firebase or REST APIs)
- Implement user authentication and persistent storage
- Expand the IFI dashboard with charts and analytics
