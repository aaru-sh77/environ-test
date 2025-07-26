# Firebase Setup Guide for Environ App

## 🔥 Firebase Services Used
- **Firebase Authentication** - User login/signup with email/password
- **Cloud Firestore** - NoSQL database for storing user projects and analysis data
- **Firebase Hosting** (Optional) - For deployment

## 📋 Step 1: Firebase Project Creation

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `environ-geospatial-app`
4. Choose whether to enable Google Analytics (recommended: Yes)
5. Select or create a Google Analytics account
6. Click "Create project"

### 1.2 Register Web App
1. In your Firebase project dashboard, click the web icon `</>`
2. Enter app nickname: `Environ Web App`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this later)

## 🔐 Step 2: Authentication Setup

### 2.1 Enable Authentication
1. In Firebase Console, go to "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Toggle "Email link (passwordless sign-in)" to OFF (unless needed)
   - Click "Save"

### 2.2 Configure Authentication Settings
1. Go to "Settings" tab in Authentication
2. Under "Authorized domains", add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `environ-app.vercel.app`)

## 🗄️ Step 3: Firestore Database Setup

### 3.1 Create Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll configure security rules later)
3. Select a location (choose closest to your users)
4. Click "Done"

### 3.2 Configure Security Rules
1. Go to "Rules" tab in Firestore
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own projects
    match /projects/{projectId} {
      allow read, write, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can read/write their own user profile
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

### 3.3 Create Indexes (if needed)
For better query performance, create these composite indexes:
1. Go to "Indexes" tab
2. Create composite index for projects:
   - Collection ID: `projects`
   - Fields: `userId` (Ascending), `updatedAt` (Descending)
   - Query scope: Collection

## 🔧 Step 4: Environment Configuration

### 4.1 Update .env.local
Replace the existing `.env.local` with your Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API Key (for mapping functionality)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4.2 Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Elevation API
   - Distance Matrix API
4. Create API credentials (API Key)
5. Restrict the API key to your domains
6. Add the key to your `.env.local` file

## 📦 Step 5: Dependencies Installation

All required dependencies are already included in the project. If you need to install them manually:

```bash
# Core Firebase dependencies
npm install firebase@latest

# Google Maps integration
npm install @react-google-maps/api@latest

# Three.js for 3D visualization
npm install three@latest @types/three@latest @googlemaps/three@latest

# UI and utility libraries
npm install next-themes@latest sonner@latest date-fns@latest

# Development dependencies (if not already installed)
npm install -D @types/node@latest @types/react@latest @types/react-dom@latest
```

## 🏗️ Step 6: Project Structure Verification

Your project should have this structure:
```
src/
├── lib/
│   ├── firebase/
│   │   ├── config.ts          # Firebase initialization
│   │   ├── auth.ts            # Authentication functions
│   │   └── firestore.ts       # Database operations
│   └── utils/
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── map/
│   └── ui/
├── hooks/
│   └── useAuth.ts             # Authentication hook
└── app/
    ├── auth/
    ├── dashboard/
    ├── project/
    └── layout.tsx
```

## 🧪 Step 7: Testing Your Setup

### 7.1 Test Authentication
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try creating a new account
4. Verify login/logout functionality
5. Check Firebase Console → Authentication → Users to see registered users

### 7.2 Test Firestore
1. Create a new project in the app
2. Check Firebase Console → Firestore Database → Data
3. Verify that project data is being saved correctly
4. Test project deletion and updates

### 7.3 Test Security Rules
1. Try accessing another user's data (should fail)
2. Test unauthenticated access (should fail)
3. Verify proper user isolation

## 🚀 Step 8: Deployment Setup (Optional)

### 8.1 Firebase Hosting
If you chose Firebase Hosting during setup:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting in your project
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### 8.2 Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔒 Step 9: Security Best Practices

### 9.1 API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Restrict API keys to specific domains/IPs
- Regularly rotate API keys

### 9.2 Firestore Security
- Always use security rules to protect data
- Test security rules thoroughly
- Use Firebase Auth for user identification
- Validate data on both client and server side

### 9.3 Authentication Security
- Implement proper password requirements
- Consider enabling multi-factor authentication
- Monitor authentication logs for suspicious activity
- Implement rate limiting for auth attempts

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase App not initialized"
**Solution**: Ensure Firebase config is properly imported and initialized before use.

### Issue 2: "Permission denied" errors
**Solution**: Check Firestore security rules and ensure user is authenticated.

### Issue 3: "API key not valid" for Google Maps
**Solution**: Verify API key is correct and required APIs are enabled.

### Issue 4: Environment variables not loading
**Solution**: Restart development server after adding new environment variables.

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Setup Checklist

- [] Firebase project created
- [] Web app registered in Firebase
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Environment variables set
- [ ] Google Maps API key obtained and configured
- [ ] Dependencies installed
- [ ] Authentication tested
- [ ] Database operations tested
- [ ] Security rules tested
- [ ] Application deployed (optional)

Your Firebase setup is now complete! The Environ application should be fully functional with user authentication and data persistence.