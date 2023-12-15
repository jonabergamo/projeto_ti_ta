import { Text, useColorScheme } from "react-native";
import { useSession } from "../../context/AuthContext";
import { Redirect, Tabs } from "expo-router";
import Login from "./login";

export default function AuthLayout() {
  const sessionInfo = useSession();
  const colorScheme = useColorScheme();

  if (!sessionInfo) {
    // Lidar com o caso em que sessionInfo é null
    return <Text>Session info not available</Text>;
  }

  const { session, isLoading } = sessionInfo;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/(user-routes)" />;
  }

  return <Login />;
}
