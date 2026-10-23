import { ExpoConfig } from "expo/config";
import pkg from "./package.json";

const config: ExpoConfig = {
  name: "Game Shelf",
  slug: "game-shelf",
  version: pkg.version,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "game-shelf",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
    buildNumber: "1",
    backgroundColor: "#ffffff",
    bundleIdentifier: "com.gameshelf.gameshelf",
    infoPlist: {
      UIBackgroundModes: [],
    },
  },
  android: {
    versionCode: 1,
    package: "com.gameshelf.gameshelf",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#080808",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        dark: {
          image: "./assets/images/splash-icon-dark.png",
          backgroundColor: "#000000",
        },
      },
    ],
    "@react-native-community/datetimepicker",
    "expo-build-properties",
    "expo-font",
    "expo-image",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "69795815-8ab8-4f0f-932d-640e92d250df",
    },
  },
};

export default config;
