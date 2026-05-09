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

  const title = type === "privacy" ? "Privacy Policy" : "Terms & Conditions";

  useEffect(() => {
    const loadContent = async () => {
      try {
        let text = "";
        if (type === "privacy") {
          text = await api.legal.privacy() || "Privacy Policy could not be loaded.";
        } else {
          text = await api.legal.terms() || "Terms could not be loaded.";
        }
        setContent(text);
      } catch (error) {
        console.error("Failed to load legal document:", error);
        setContent("An error occurred while loading the document.");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [type]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>{title}</CText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D1A66" />
        </View>
      ) : (
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentPadding}>
          <CText style={styles.text}>{content}</CText>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FA",
  },
  header: {
    backgroundColor: "#3D1A66",
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
    paddingBottom: 200,
  },
  text: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
  },
});
