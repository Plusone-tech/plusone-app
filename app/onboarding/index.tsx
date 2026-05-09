import { setAuthToken } from "@/app/lib/api";
import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function OnBoarding() {
  const router = useRouter();
  const API_BASE =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.29.76:4000";
  const APPLE_AUTH_URL = `${API_BASE}/auth/apple`;

  const handleGoogleLogin = useCallback(async () => {
    try {
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

      console.log("========== GOOGLE SIGN-IN DEBUG (index.tsx) ==========");
      console.log("[1/7] Environment variables:");
      console.log("  webClientId:", webClientId || "❌ MISSING");
      console.log("  iosClientId:", iosClientId || "❌ MISSING");
      console.log("  androidClientId:", androidClientId || "❌ MISSING");
      console.log("  API_BASE:", API_BASE);
      console.log("  Platform:", Platform.OS);

      if (!webClientId) {
        console.error(
          "❌ FATAL: webClientId is undefined! Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env",
        );
        Alert.alert(
          "Config Error",
          "Google Web Client ID is not set in environment variables.",
        );
        return;
      }

      // Configure Google Sign-In
      console.log("[2/7] Configuring GoogleSignin...");
      GoogleSignin.configure({
        webClientId,
        iosClientId,
        offlineAccess: true,
      });
      console.log("  ✅ GoogleSignin.configure() completed");

      // hasPlayServices is Android-only
      if (Platform.OS === "android") {
        console.log("[3/7] Checking Google Play Services...");
        await GoogleSignin.hasPlayServices();
        console.log("  ✅ Play Services available");
      }

      console.log("[4/7] Signing out previous session...");
      await GoogleSignin.signOut();
      console.log("  ✅ Previous session signed out");

      console.log("[5/7] Calling GoogleSignin.signIn()...");
      const userInfo = await GoogleSignin.signIn();
      console.log("  ✅ signIn() returned successfully");
      console.log("  User email:", userInfo.data?.user?.email || "N/A");
      console.log("  Has idToken:", !!userInfo.data?.idToken);
      console.log("  Has serverAuthCode:", !!userInfo.data?.serverAuthCode);

      if (userInfo.data?.idToken) {
        console.log(
          "[6/7] Sending idToken to backend:",
          `${API_BASE}/auth/google/mobile`,
        );
        const response = await fetch(`${API_BASE}/auth/google/mobile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: userInfo.data.idToken }),
        });

        console.log("  Backend response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("  ❌ Backend error body:", errorText);
          throw new Error(
            `Backend auth failed (${response.status}): ${errorText}`,
          );
        }

        const data = await response.json();
        console.log(
          "[7/7] Backend response data:",
          JSON.stringify(data, null, 2),
        );

        if (data.token) {
          await setAuthToken(data.token);
          console.log("  ✅ Auth token stored");
        }

        if (data.needsOnboarding) {
          console.log("  → Navigating to profile-setup");
          router.push({
            pathname: "/onboarding/profile-setup",
            params: {
              name: data.user?.full_name || "",
              avatar_url: data.user?.avatar_url || "",
            },
          } as any);
        } else {
          console.log("  → Navigating to home");
          router.push("/home" as any);
        }
      } else {
        console.error("  ❌ No idToken in signIn response!");
        console.log("  Full userInfo:", JSON.stringify(userInfo, null, 2));
        Alert.alert(
          "Error",
          "Google Sign-In succeeded but no ID token was returned.",
        );
      }
    } catch (err: any) {
      console.error("========== GOOGLE SIGN-IN ERROR ==========");
      console.error("Error name:", err?.name);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);
      console.error(
        "Full error:",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      );
      if (err?.code === "SIGN_IN_CANCELLED") return;
      Alert.alert(
        "Google Sign-In Failed",
        `Code: ${err?.code || "unknown"}\nMessage: ${err?.message || "No details"}`,
      );
    }
  }, [API_BASE, router]);

  const handleAppleLogin = useCallback(async () => {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Apple Sign-In not available",
          "This device does not support Sign in with Apple.",
        );
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        console.log("[AppleAuth] Sending token to backend...");
        const response = await fetch(APPLE_AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identityToken: credential.identityToken,
            authorizationCode: credential.authorizationCode,
            fullName: credential.fullName,
            email: credential.email,
          }),
        });

        if (!response.ok) {
          let errorText = "Unknown error";
          try {
            const errorData = await response.json();
            errorText = errorData.error || errorText;
          } catch {
            errorText = await response.text();
          }
          throw new Error(errorText);
        }

        const data = await response.json();

        if (data.token) {
          await setAuthToken(data.token);
        }

        if (data.needsOnboarding) {
          router.push({
            pathname: "/onboarding/profile-setup",
            params: {
              name:
                data.user?.full_name && data.user.full_name !== "Apple User"
                  ? data.user.full_name
                  : "",
              avatar_url: data.user?.avatar_url || "",
            },
          } as any);
        } else {
          router.push("/home" as any);
        }
      } else {
        Alert.alert(
          "Error",
          "Apple Sign-In succeeded but no ID token was returned.",
        );
      }
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED") return;
      console.warn("Apple login failed", err);
      Alert.alert(
        "Login failed",
        err.message || "Could not complete Apple sign-in.",
      );
    }
  }, [APPLE_AUTH_URL, router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/grid-fill-warp.svg")}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.7 }}
        contentFit="cover"
      />

      <Image
        source={require("../../assets/svgs/onboarding-text.svg")}
        style={{ width: 312, height: 220 }}
        contentFit="contain"
      />

      <View style={styles.whiteViewContainer}>
        <View style={styles.whiteViewSafeArea}>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleGoogleLogin}
            >
              <Ionicons name="logo-google" size={20} color="#000" />
              <CText>Continue with Google</CText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonContainer,
                { backgroundColor: "#F8EFFF", borderColor: "#3D1A66" },
              ]}
              onPress={() => router.push("/onboarding/waitlist")}
            >
              <Ionicons name="hourglass" size={20} color="#3D1A66" />
              <CText style={{ color: "#3D1A66" }}>From the Waitlist</CText>
            </TouchableOpacity>
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[
                  styles.buttonContainer,
                  { backgroundColor: "#000", borderColor: "#000" },
                ]}
                onPress={handleAppleLogin}
              >
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <CText style={{ color: "#fff" }}>Continue with Apple</CText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 30,
  },
  buttonGroup: {
    width: "100%",
    gap: 15,
  },
  whiteViewContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "35%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  whiteViewSafeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 20,
    paddingBottom: 60,
    paddingHorizontal: 25,
    paddingTop: 15,
  },
  tcText: {
    color: "#A2A2A2",
    textAlign: "center",
    marginTop: 12,
  },
  buttonContainer: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: "black",
    overflow: "hidden",
    flexDirection: "row",
    gap: 10,
  },
});
