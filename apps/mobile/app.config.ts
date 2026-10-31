import { ExpoConfig } from "expo/config";
import pkg from "./package.json";

const IS_DEV = process.env.APP_VARIANT === "development";

const config: ExpoConfig = {
  name: IS_DEV ? "Game Shelf (Dev)" : "Game Shelf",
  slug: "game-shelf",
  version: pkg.version,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: IS_DEV ? "game-shelf-dev" : "game-shelf",
  userInterfaceStyle: "automatic",
  ios: {
    buildNumber: "4",
    icon: "./assets/expo.icon",
    backgroundColor: "#ffffff",
    bundleIdentifier: IS_DEV
      ? "com.gameshelf.gameshelf.dev"
      : "com.gameshelf.gameshelf",
    infoPlist: {
      UIBackgroundModes: [],
    },
  },
  android: {
    versionCode: 4,
    package: IS_DEV ? "com.gameshelf.gameshelf.dev" : "com.gameshelf.gameshelf",
    predictiveBackGestureEnabled: false,
    permissions: ["REQUEST_INSTALL_PACKAGES"],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#080808",
    },
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
