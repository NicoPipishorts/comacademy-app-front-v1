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
yarn start             # Start Metro bundler
yarn ios               # Run on iOS
yarn android           # Run on Android

# Building
yarn eas build        # Cloud build
yarn expo run:ios     # Local iOS build
yarn expo run:android # Local Android build

# Release helpers
yarn build:testflight:ios
yarn build:production:ios
yarn build:production:android
yarn submit:testflight:ios
yarn submit:production:ios

# Maintenance
yarn install          # Install dependencies
yarn start --clear    # Clear Metro cache
```

## EAS Release Flow

### Build profiles

- `preview`
  - Internal distribution only
  - `EXPO_PUBLIC_ENABLE_PARCOURS=false`
- `testflight`
  - Store iOS build intended for TestFlight
  - `EXPO_PUBLIC_ENABLE_PARCOURS=true`
  - `channel=testflight`
- `production`
  - Store builds intended for App Store / Play production
  - `EXPO_PUBLIC_ENABLE_PARCOURS=false`
  - `channel=production`

### Submit profiles

`eas.json` now contains explicit `submit` profiles for:

- `testflight`
- `production`

Both iOS submit profiles already include the Apple team id `3XTT8L97BP`.

### One-time App Store Connect setup still required

To make iOS submission fully non-interactive, add the missing App Store Connect app id to `eas.json`:

```json
"submit": {
  "testflight": {
    "ios": {
      "appleTeamId": "3XTT8L97BP",
      "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
    }
  }
}
```

If you also configure an App Store Connect API key for EAS Submit, TestFlight submission can run without Apple ID / 2FA prompts.

### Recommended iOS release commands

Create a TestFlight build:

```bash
yarn build:testflight:ios
```

Submit an already finished iOS build to TestFlight:

```bash
yarn submit:testflight:ios
```

Or submit a specific build id:

```bash
yarn eas submit --platform ios --profile testflight --id <eas-build-id>
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
