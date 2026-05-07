import CText from "@/components/CText";
import TextInputBubble from "@/components/TextInputBubble";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WaitlistPhone() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [phoneBubbleVisible, setPhoneBubbleVisible] = useState(false);

  const digitsOnly = phone.replace(/\D/g, "");
  const showDismiss = digitsOnly.length >= 10 && isFocused;

  const dismissKeyboard = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    setError("");
    const digitsOnlyPhone = phone.replace(/\D/g, "");
    if (!phone.trim() || digitsOnlyPhone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setIsSubmitting(true);
    try {
      // Call backend to check if phone exists in waitlist
      const res = await apiFetchWaitlist(phone);
      if (res && res.exists) {
        // Route to connectGoogle with waitlist data
        router.push({
          pathname: "/onboarding/connectGoogle",
          params: { ...res.data, phone },
        });
      } else {
        setError("You are not in the waitlist");
      }
    } catch (err: any) {
      setError(err?.message || "You are not in the waitlist");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to call waitlist lookup API
  async function apiFetchWaitlist(phone: string) {
    try {
      const res = await apiFetch(
        `/waitlist/lookup?phone=${encodeURIComponent(phone)}`
      );
      return res;
    } catch {
      return null;
    }
  }

  // Use the same apiFetch as in lib/api.ts
  async function apiFetch(path: string, options: RequestInit = {}) {
    const API_BASE =
      process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      // Try to get error message from response
      try {
        const errorData = await res.json();
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        if (errorData.error) {
          throw new Error(errorData.error);
        }
      } catch (parseError) {
        // If parsing fails, just return null
      }
      return null;
    }
    return await res.json();
  }

  return (
    <View style={styles.container}>
      {/* Text Input Bubble for Phone */}
      <TextInputBubble
        visible={phoneBubbleVisible}
        label="Phone Number"
        value={phone}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        maxLength={15}
        onConfirm={(val) => { setPhone(val); setPhoneBubbleVisible(false); }}
        onCancel={() => setPhoneBubbleVisible(false)}
      />

      <Image
        source={require("../../assets/images/grid-fill-warp.svg")}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.5 }}
        contentFit="cover"
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            borderRadius: 9999,
            width: 50,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            marginTop: -5,
          }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#000" />
        </TouchableOpacity>
        <CText weight="medium" fontSize={42}>
          Let&apos;s get you in
        </CText>
      </View>
      <View style={styles.whiteViewContainer}>
        <SafeAreaView style={styles.WhiteSafeArea}>
          <View
            style={{
              width: "100%",
              alignItems: "flex-start",
              gap: 5,
              marginTop: -10,
            }}
          >
            <CText style={{ paddingLeft: 5, color: "#340074" }}>
              Enter Your Phone Number{" "}
            </CText>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.input, { flex: 1, marginBottom: 0, justifyContent: "center" }]}
                onPress={() => setPhoneBubbleVisible(true)}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 18, color: phone ? "#333" : "#999" }}>
                  {phone || "Phone Number"}
                </CText>
              </TouchableOpacity>
            </View>
            {!!error && (
              <CText
                style={{
                  color: "#E53935",
                  marginTop: -16,
                  marginBottom: 8,
                  paddingLeft: 5,
                }}
              >
                {error}
              </CText>
            )}
          </View>
          <View style={{ width: "100%", alignItems: "center", gap: 10 }}>
            <CText
              weight="light"
              fontSize={13}
              style={{ color: "#A2A2A2", textAlign: "center" }}
            >
              Write the number you used in the waitlist
            </CText>
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#3D1A66" />
              ) : (
                <CText>Continue</CText>
              )}
            </TouchableOpacity>
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
    gap: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00000028",
    backgroundColor: "#fff",
    fontSize: 18,
    marginBottom: 24,
  },
  dismissButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
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
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
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
  WhiteSafeArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
});
