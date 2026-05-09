import { setAuthToken } from "@/app/lib/api";
import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConnectGoogle() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

  const handleGoogleConnect = useCallback(async () => {
    try {
      setIsLoading(true);

      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

      console.log(
        "========== GOOGLE SIGN-IN DEBUG (connectGoogle.tsx) ==========",
      );
      console.log("[1/8] Environment variables:");
      console.log("  webClientId:", webClientId || "❌ MISSING");
      console.log("  webClientId length:", webClientId?.length);
      console.log("  iosClientId:", iosClientId || "❌ MISSING");
      console.log("  androidClientId:", androidClientId || "❌ MISSING");
      console.log("  API_BASE:", API_BASE);
      console.log("  Platform:", Platform.OS);
      console.log("  Params:", JSON.stringify(params));

      if (!webClientId) {
        Alert.alert("Config Error", "Google Web Client ID is not configured");
        return;
      }

      // Configure Google Sign-In
      console.log("[2/8] Configuring GoogleSignin with:");
      console.log("  webClientId:", webClientId);
      console.log("  iosClientId:", iosClientId);
      console.log("  offlineAccess: true");
      GoogleSignin.configure({
        webClientId,
        iosClientId,
        offlineAccess: true,
      });
      console.log("  ✅ GoogleSignin.configure() completed");

      // hasPlayServices is Android-only
      if (Platform.OS === "android") {
        console.log("[3/8] Checking Google Play Services...");
        await GoogleSignin.hasPlayServices();
        console.log("  ✅ Play Services available");
      }

      console.log("[4/8] Signing out previous session...");
      await GoogleSignin.signOut();
      console.log("  ✅ Previous session signed out");

      console.log(
        "[5/8] Calling GoogleSignin.signIn() — THIS IS WHERE DEVELOPER_ERROR TYPICALLY HAPPENS...",
      );
      const userInfo = await GoogleSignin.signIn();
      console.log("  ✅ signIn() returned successfully!");
      console.log("  User email:", userInfo.data?.user?.email || "N/A");
      console.log("  User name:", userInfo.data?.user?.name || "N/A");
      console.log("  Has idToken:", !!userInfo.data?.idToken);
      console.log("  idToken length:", userInfo.data?.idToken?.length || 0);
      console.log("  Has serverAuthCode:", !!userInfo.data?.serverAuthCode);

      if (userInfo.data?.idToken) {
        console.log(
          "[6/8] Sending idToken to backend:",
          `${API_BASE}/auth/google/mobile`,
        );
        console.log(
          "  Payload: { idToken: [present], phone:",
          params.phone,
          ", full_name:",
          params.full_name,
          "}",
        );

        const response = await fetch(`${API_BASE}/auth/google/mobile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            idToken: userInfo.data.idToken,
            phone: params.phone,
            full_name: params.full_name,
          }),
        });

        console.log("[7/8] Backend response:");
        console.log("  Status:", response.status);
        console.log("  Status text:", response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("  ❌ Backend error body:", errorText);
          throw new Error(
            `Backend authentication failed (${response.status}): ${errorText}`,
          );
        }

        const data = await response.json();
        console.log(
          "[8/8] Backend response data:",
          JSON.stringify(data, null, 2),
        );

        // Store the JWT token for subsequent API calls
        if (data.token) {
          await setAuthToken(data.token);
          console.log("  ✅ Auth token stored");
        }

        // Check if account already exists and onboarding is completed
        if (!data.needsOnboarding) {
          console.log("  → Account exists, navigating to home");
          Alert.alert(
            "Welcome Back!",
            "Your account is already set up. Taking you to the home page.",
            [{ text: "OK", onPress: () => router.replace("/home") }],
          );
          return;
        }

        console.log("  → Navigating to profile-setup");
        router.push({
          pathname: "/onboarding/profile-setup",
          params: {
            ...params,
            email: data.user?.email || userInfo.data?.user?.email,
            name: data.user?.full_name || "",
            avatar_url: data.user?.avatar_url || "",
          },
        });
      } else {
        console.error("  ❌ No idToken in signIn response!");
        console.log("  Full userInfo:", JSON.stringify(userInfo, null, 2));
        Alert.alert("Error", "No authentication token received from Google");
      }
    } catch (err: any) {
      console.error(
        "========== GOOGLE SIGN-IN ERROR (connectGoogle.tsx) ==========",
      );
      console.error("Error name:", err?.name);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);
      console.error(
        "Full error:",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      );

      if (err?.code === "SIGN_IN_CANCELLED") {
        console.log("  User cancelled sign-in");
        setIsLoading(false);
        return;
      }

      Alert.alert(
        "Google Sign-In Failed",
        `Code: ${err?.code || "Unknown"}\n\nMessage: ${err?.message || "No message"}\n\nCheck Metro console for full details.`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, router, params]);

  const handleAppleConnect = useCallback(async () => {
    try {
      setIsLoading(true);
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        Alert.alert("Error", "Apple Sign-In is not available on this device.");
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const response = await fetch(`${API_BASE}/auth/apple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identityToken: credential.identityToken,
            authorizationCode: credential.authorizationCode,
            fullName: credential.fullName,
            email: credential.email,
            phone: params.phone,
            full_name: params.full_name,
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
        if (data.token) await setAuthToken(data.token);

        if (!data.needsOnboarding) {
          Alert.alert("Welcome Back!", "Your account is already set up.", [
            { text: "OK", onPress: () => router.replace("/home") },
          ]);
          return;
        }

        router.push({
          pathname: "/onboarding/profile-setup",
          params: {
            ...params,
            email: data.user?.email || credential.email,
            name:
              data.user?.full_name && data.user.full_name !== "Apple User"
                ? data.user.full_name
                : "",
            avatar_url: data.user?.avatar_url || "",
          },
        });
      }
    } catch (err: any) {
      if (err?.code !== "ERR_CANCELED") {
        Alert.alert(
          "Login failed",
          err.message || "Could not complete Apple sign-in.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, router, params]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/grid-fill-warp.svg")}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.5 }}
        contentFit="cover"
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#000" />
        </TouchableOpacity>
        <CText weight="medium" fontSize={38}>
          Connect your{"\n"}Account
        </CText>
      </View>

      <View style={styles.whiteViewContainer}>
        <SafeAreaView style={styles.whiteSafeArea}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={40} color="#3D1A66" />
            </View>
          </View>

          {/* Button Section */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="logo-google" size={20} color="#000" />
              )}
              <CText style={styles.googleButtonText}>
                {isLoading ? "Connecting..." : "Connect with Google"}
              </CText>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[
                  styles.googleButton,
                  { backgroundColor: "#000", borderColor: "#000" },
                ]}
                onPress={handleAppleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                )}
                <CText style={[styles.googleButtonText, { color: "#fff" }]}>
                  {isLoading ? "Connecting..." : "Connect with Apple"}
                </CText>
              </TouchableOpacity>
            )}

            <CText style={styles.privacyText}>
              We only use this for authentication.{"\n"}Your data stays private.
            </CText>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8EFFF",
    paddingTop: 80,
  },
  header: {
    marginLeft: 35,
    marginBottom: 15,
    gap: 15,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 9999,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -5,
  },
  whiteViewContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 25,
  },
  whiteSafeArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  infoSection: {
    alignItems: "center",
    paddingTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#340074",
    marginBottom: 20,
  },
  benefitsList: {
    gap: 12,
    width: "100%",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 10,
  },
  benefitText: {
    fontSize: 15,
    color: "#444",
    flex: 1,
  },
  buttonSection: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  googleButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: "black",
    flexDirection: "row",
    gap: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  privacyText: {
    fontSize: 12,
    color: "#A2A2A2",
    textAlign: "center",
    lineHeight: 18,
  },
});
