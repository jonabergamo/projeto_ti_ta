import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Button, Platform, View, useColorScheme } from "react-native";
import { SessionProvider } from "../context/AuthContext";
import { RootSiblingParent } from "react-native-root-siblings";
import Background from "../components/Background";
import { theme } from "../core/theme";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth-routes)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <RootSiblingParent>
      <SessionProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DarkTheme}>
          <Stack>
            <Stack.Screen
              name="(user-routes)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth-routes)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="new_device_setting"
              options={{
                presentation: "card",
                headerTitle: "Criar Pré-definição",
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="new_device"
              options={{
                presentation: "card",
                headerTitle: "Criar Dispositivo",
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="edit_device"
              options={{
                presentation: "card",
                headerTitle: "Editar dispositivo",
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="edit_device_setting"
              options={{
                presentation: "card",
                headerTitle: "Editar Pré-definição",
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              }}
            />
          </Stack>
        </ThemeProvider>
      </SessionProvider>
    </RootSiblingParent>
  );
}
