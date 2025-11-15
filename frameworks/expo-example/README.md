# Expo + Integrate SDK Example 👋

This is an [Expo](https://expo.dev) project demonstrating OAuth integration with GitHub using the [Integrate SDK](https://integrate.dev).

## Features

- 🔐 GitHub OAuth authentication
- 📱 React Native implementation with deep linking support
- 🔄 Real-time auth state management with event listeners
- 📊 GitHub repository listing example
- 🎨 Beautiful, modern UI with ThemedComponents

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Configure Deep Linking

   The app uses the scheme `expoexample://` for OAuth callbacks. This is already configured in `app.json`:

   ```json
   "scheme": "expoexample"
   ```

   Make sure your OAuth redirect URI is set to: `expoexample://oauth/callback`

3. Start the app

   ```bash
   bun start
   ```

In the output, you'll find options to open the app in a:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## How it works

### OAuth Flow

1. User taps "Connect GitHub" button
2. App calls `client.authorize('github')` which opens authentication in a web browser
3. User completes OAuth flow in the browser
4. Browser redirects back to the app with the OAuth callback
5. Deep linking listener catches the callback URL: `expoexample://oauth/callback`
6. Integrate SDK automatically handles the token exchange
7. Auth state is updated via event listeners (`auth:complete`)

### Key Files

- **`lib/integrate.ts`** - Client-side Integrate SDK configuration
- **`app/(tabs)/index.tsx`** - Main screen with OAuth UI and deep linking

### Deep Linking

The app uses `expo-linking` to handle OAuth callbacks:

```typescript
const handleUrl = ({ url }: { url: string }) => {
  const { path, queryParams } = Linking.parse(url);
  
  if (path === 'oauth/callback') {
    // Handle OAuth callback
    console.log('OAuth callback:', queryParams);
  }
};

Linking.addEventListener('url', handleUrl);
```

## Learn more

- [Integrate SDK Documentation](https://docs.integrate.dev)
- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Linking](https://docs.expo.dev/guides/linking/)
