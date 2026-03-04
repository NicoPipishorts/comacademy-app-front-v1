# ComAcademy - Educational App

ComAcademy is an educational app built with React Native and Expo that provides access to professional knowledge, citations, and commandments with a subscription-based model.

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Test Subscription Feature

```bash
# 1. Start the app
npm start

# 2. In the app:
# - Go to "Dico" tab
# - Tap on item #11 or higher (locked content)
# - Modal appears → Tap "Passer à Premium"
# - Subscription screen opens with plans
```

## Project Structure

```
comacademy-app-front-v1/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── dico/          # Dictionary/vocabulary
│   │   ├── metiers/       # Professions
│   │   ├── citations/     # Citations
│   │   ├── commandements/ # Commandments
│   │   └── subscription/  # Subscription screen
│   └── auth/              # Authentication screens
├── components/            # Reusable components
├── src/
│   ├── services/         # API and IAP services
│   └── hooks/            # Custom React hooks
├── auth/                 # Auth context
└── constants/            # App constants (colors, fonts)
```

## Features

### Subscription System
- **Free Tier**: Limited access (first 10 items per section)
- **Monthly Premium**: Full access at 4,99 €/month
- **Yearly Premium**: Full access at 29,99 €/year (recommended)

### Content Sections
- **Dico**: Professional vocabulary and definitions
- **Métiers**: Career paths and job descriptions
- **Citations**: Inspirational quotes
- **Commandements**: Professional principles
- **Secrets**: Hidden content for premium users

### Key Features
- In-app purchases (iOS & Android)
- Content limiting for free users
- Subscription status detection
- Platform-specific features
- French language UI

## Development

### Testing in Expo Go

The app automatically uses a mock IAP service in Expo Go:
- All UI features work
- Purchase flow simulated
- No native build required
- Perfect for UI development

You'll see this warning when running in Expo Go:
```
⚠️ Using MOCK IAP service for UI testing
⚠️ Build a development build for real IAP
```

### Testing Real Purchases

For actual IAP testing, create a development build:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Or use EAS for physical devices
eas build --profile development --platform ios
```

## Documentation

- **[SUBSCRIPTION_GUIDE.md](SUBSCRIPTION_GUIDE.md)** - Complete subscription implementation guide
  - Quick start instructions
  - Architecture overview
  - Implementation steps
  - Testing checklist
  - Production requirements
  - Troubleshooting

- **[DEVELOPMENT_NOTES.md](DEVELOPMENT_NOTES.md)** - Technical notes for developers
  - Expo Go limitations
  - Mock IAP service details
  - Dependency fixes
  - Development build guide
  - Common issues and solutions

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based)
- **State Management**: React Context API
- **In-App Purchases**: react-native-iap
- **UI Components**: Custom components with React Native
- **Styling**: StyleSheet API

## Environment Setup

### Required Tools
- Node.js 18+
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- EAS CLI (for cloud builds)

### Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PUBLIC_IAP_ENV=sandbox
EXPO_PUBLIC_TERMS_OF_SERVICE_URL=https://comacademy.fr/conditions-generales-d-utilisation
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://comacademy.fr/politique-de-confidentialite
```

## Scripts

```bash
# Development
npm start              # Start Metro bundler
npm run ios           # Run on iOS
npm run android       # Run on Android

# Building
eas build             # Cloud build
npx expo run:ios      # Local iOS build
npx expo run:android  # Local Android build

# Maintenance
npm install           # Install dependencies
npm start -- --clear  # Clear Metro cache
```

## API Integration

The app connects to a backend API for:
- User authentication
- Subscription management
- Content delivery
- Receipt verification

See [SUBSCRIPTION_GUIDE.md](SUBSCRIPTION_GUIDE.md) for backend endpoint requirements.

## Current Status

### ✅ Completed
- Core app structure
- Authentication system
- Content limiting system
- Subscription UI
- Mock IAP for testing
- Navigation flow
- French localization

### 🚧 In Progress
- App Store Connect configuration
- Google Play Console configuration
- Backend receipt verification
- Production testing

## Contributing

This is a private project for ComAcademy. For questions or issues, contact the development team.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native IAP](https://react-native-iap.dooboolab.com/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Apple In-App Purchase](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)

---

**Version**: 1.2.4
**Last Updated**: 2025-10-16
