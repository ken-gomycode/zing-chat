# Firebase Chat Application

## Project Overview
A real-time chat application built with React and Firebase, featuring:
- User authentication (email/password)
- Real-time messaging
- Chat rooms (direct and group)
- File/image sharing
- Online/offline presence
- Read receipts

## Tech Stack
- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime Database)
- **Routing**: React Router DOM

## Project Structure
```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (Login, Register, Chat)
├── context/          # React Context providers (Auth, Chat)
├── hooks/            # Custom React hooks
├── services/         # Firebase service functions
├── utils/            # Helper functions
└── styles/           # CSS files
```

## Firebase Collections
- `users` - User profiles
- `rooms` - Chat rooms
- `rooms/{roomId}/messages` - Messages subcollection
- `/status/{userId}` - Presence (Realtime DB)

## Development Commands
```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
```

## Environment Variables
Create a `.env` file with your Firebase config:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
```

## Key Implementation Notes
- Messages use pagination (30 per load) with infinite scroll
- Presence system uses Realtime Database for reliability
- User search uses lowercase displayName for prefix matching
- Firestore offline persistence is enabled
