# Zing

A real-time chat application built with React and Firebase.

**Live demo**: https://zing-chat.onrender.com/

## Features
- User authentication (email/password)
- Real-time messaging with Firestore
- Chat rooms (direct messages and group chats)
- File/image sharing with upload progress
- Online/offline presence system
- Read receipts
- User search and invite

## Tech Stack
- **Frontend**: React 19 + Vite
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime Database)
- **Routing**: React Router DOM

## Project Structure
```
src/
├── components/
│   ├── ConfirmDialog.jsx   # Confirmation dialog
│   ├── MessageInput.jsx    # Message input with file upload
│   ├── MessageList.jsx     # Real-time message display
│   ├── NewRoomModal.jsx    # Create room dialog
│   ├── ProtectedRoute.jsx  # Auth route guard
│   ├── RoomList.jsx        # Chat room list
│   └── UserSearch.jsx      # User search modal
├── context/
│   ├── AuthContext.jsx     # Authentication state
│   └── ChatContext.jsx     # Chat/room state
├── pages/
│   ├── Chat.jsx            # Main chat interface
│   ├── Login.jsx           # Login page
│   └── Register.jsx        # Registration page
├── services/
│   ├── auth.js             # Authentication functions
│   ├── firebase.js         # Firebase initialization
│   ├── messages.js         # Message CRUD operations
│   ├── presence.js         # Online/offline tracking
│   ├── rooms.js            # Room management
│   ├── storage.js          # File upload handling
│   └── users.js            # User search/profile
├── styles/
│   ├── Auth.css            # Auth page styles
│   └── Chat.css            # Chat layout styles
└── utils/
    └── dateUtils.js        # Date formatting helpers
```

## Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable these services:
   - Authentication > Email/Password
   - Cloud Firestore
   - Realtime Database
   - Storage

## Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /rooms/{roomId} {
      allow read: if request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.members;
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.members;
        allow create: if request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.members;
      }
    }
  }
}
```

## Development Commands
```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
```

## Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase config:
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
- Messages use pagination (30 per load) with real-time updates
- Presence system uses Realtime Database for reliable online/offline tracking
- User search uses lowercase displayName field for case-insensitive prefix matching
- Firestore offline persistence is enabled for offline support
- File uploads show progress indicator
- Auto-scroll to bottom on new messages (only if already at bottom)
