# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

Navigation

The app uses expo-router. Make sure your development environment supports it. The main screen is the timer list; navigate to history via the top-right button.

Assumptions
The environment supports React Native with Expo.

The user has Node.js and npm or yarn installed.

AsyncStorage (@react-native-async-storage/async-storage) is properly linked by Expo.

Timers durations are entered in seconds.

Categories are user-defined strings; timers are grouped accordingly.

The timer remaining value decrements every second only if running.

Only one instance of the app is modifying AsyncStorage at a time to avoid race conditions.

The device has persistent storage available for AsyncStorage.

Navigation is handled by expo-router.

UI uses basic React Native components and @expo/vector-icons.

Completed timers are stored in a simple array with timestamps in local string format.

The timer completion modal appears for each timer when it finishes counting down.

Features
Create timers with name, duration (seconds), and category.

Start, pause, reset, and delete individual timers.

Start, pause, reset all timers within a category.

Collapse/expand categories.

Persist timers and completed history in AsyncStorage.

Show a modal when a timer completes.

Navigate to history view (assumed implemented in another screen).

