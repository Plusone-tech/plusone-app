import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CText from "../../components/CText";
import PrivacyPolicy from "../home/privacy-policy";
import TermsConditions from "../home/terms-conditions";

export default function LegalScreen() {
  const { type } = useLocalSearchParams();

  if (type === "terms") {
    return <TermsConditions />;
  }

  if (type === "privacy") {
    return <PrivacyPolicy />;
  }

  return <EulaView />;
}

function EulaView() {
  const [eulaText, setEulaText] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadEula() {
      try {
        const HOST =
          process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.29.76:4000";
        const response = await fetch(`${HOST}/legal/eula`);
        if (!response.ok) throw new Error("Failed to fetch EULA");
        const text = await response.text();
        setEulaText(text);
      } catch (err) {
        console.error("Failed to load EULA:", err);
        setError("Could not load legal documents at this time.");
      }
    }
    loadEula();
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#3D1A66" />
        </TouchableOpacity>
        <CText style={styles.title}>End User License Agreement</CText>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <CText style={styles.errorText}>{error}</CText>
        ) : (
          <CText style={styles.eulaText}>{eulaText || "Loading..."}</CText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#3D1A66",
  },
  scrollContent: {
    padding: 20,
  },
  eulaText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 24,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
});
