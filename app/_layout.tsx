import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { getAuthToken } from "./lib/api";
import { AppProvider } from "./lib/AppContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGroteskVF: require("../assets/fonts/BricolageGrotesque.ttf"),
    fontMainExtraLight: require("../assets/fonts/BricolageGrotesque-ExtraLight.ttf"),
    fontMainLight: require("../assets/fonts/BricolageGrotesque-Light.ttf"),
    fontMainRegular: require("../assets/fonts/BricolageGrotesque-Regular.ttf"),
    fontMainMedium: require("../assets/fonts/BricolageGrotesque-Medium.ttf"),
    fontMainSemiBold: require("../assets/fonts/BricolageGrotesque-SemiBold.ttf"),
    fontMainExtraBold: require("../assets/fonts/BricolageGrotesque-ExtraBold.ttf"),
  });

  const router = useRouter();
  const hasNavigated = useRef(false);
  const [updateCheckComplete, setUpdateCheckComplete] = useState(false);

  // Mandatory OTA update check - runs first before anything else
  useEffect(() => {
    const checkForUpdates = async () => {
      // Skip update check in development
      if (!Updates.isEnabled) {
        console.log("Updates not enabled (development mode)");
        setUpdateCheckComplete(true);
        return;
      }

      try {
        console.log("Checking for updates...");
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          console.log("Update available, downloading...");
          // Download the update
          await Updates.fetchUpdateAsync();

          // Show dialog and force restart
          Alert.alert(
            "Update Available",
            "A new version of PlusOne has been downloaded. The app will now restart to apply the update.",
            [
              {
                text: "Restart Now",
                onPress: async () => {
                  await Updates.reloadAsync();
                },
              },
            ],
            { cancelable: false }
          );
          // Don't set updateCheckComplete - keep app frozen until restart
          return;
        } else {
          console.log("App is up to date");
        }
      } catch (error) {
        console.log("Update check failed:", error);
        // On error, continue with app - don't block the user
      }

      setUpdateCheckComplete(true);
    };

    checkForUpdates();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && updateCheckComplete) {
      // Add a small delay to show splash for minimum time
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, updateCheckComplete]);

  // Auth check - only runs after update check is complete
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      // Wait until fonts loaded, update check complete, and not already navigated
      if (!fontsLoaded || !updateCheckComplete || hasNavigated.current) return;

      try {
        // Get stored JWT token
        const token = await getAuthToken();

        // Check if user is already authenticated with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data?.user) {
            hasNavigated.current = true;
            // User is authenticated - check if onboarding is complete
            if (data.user.onboarding_completed) {
              router.replace("/home" as any);
            } else {
              router.replace("/onboarding/profile-setup" as any);
            }
            return;
          }
        }
      } catch (error) {
        console.log("Auth check failed, redirecting to onboarding:", error);
      }

      // Not authenticated or error - go to onboarding
      hasNavigated.current = true;
      router.replace("/onboarding" as any);
    };

    checkAuthAndNavigate();
  }, [fontsLoaded, updateCheckComplete]);

  // Don't render until fonts loaded AND update check complete
  if (!fontsLoaded || !updateCheckComplete) {
    return null;
  }

  return (
    <AppProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </AppProvider>
  );
}
