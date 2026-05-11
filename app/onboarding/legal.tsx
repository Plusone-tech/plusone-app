import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CText from "@/components/CText";
import { api } from "../lib/api";

export default function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getTitle = () => {
    if (type === "privacy") return "Privacy Policy";
    if (type === "terms") return "Terms of Use";
    if (type === "eula") return "End User License Agreement";
    return "Legal";
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        let text = "";
        if (type === "privacy") {
          text = await api.legal.privacy();
        } else if (type === "terms") {
          text = await api.legal.terms();
        } else if (type === "eula") {
          text = await api.legal.eula();
        } else {
          text = "Document not found.";
        }
        setContent(text || `${getTitle()} could not be loaded.`);
      } catch (err) {
        console.error("Failed to load legal document:", err);
        setError("Could not load legal documents at this time.");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [type]);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#3D1A66" />
        </TouchableOpacity>
        <CText style={styles.title}>{getTitle()}</CText>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D1A66" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {error ? (
            <CText style={styles.errorText}>{error}</CText>
          ) : (
            <CText style={styles.text}>{content}</CText>
          )}
        </ScrollView>
      )}
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
  text: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
