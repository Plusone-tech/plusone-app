import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];

export default function Language() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const { profile } = await api.profile.get();
        // Map language name to code
        const langCode =
          languages.find(
            (l) =>
              l.name.toLowerCase() === profile?.language?.toLowerCase() ||
              l.code === profile?.language
          )?.code || "en";
        setSelectedLanguage(langCode);
      } catch (err) {
        console.error("Failed to fetch language:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguage();
  }, []);

  const handleSelectLanguage = useCallback(
    async (code: string) => {
      if (code === selectedLanguage) return;

      const language = languages.find((l) => l.code === code);
      if (!language) return;

      setSaving(true);
      try {
        await api.profile.update({ language: language.name });
        setSelectedLanguage(code);
        Alert.alert("Success", `Language changed to ${language.name}`);
      } catch (err) {
        console.error("Failed to update language:", err);
        Alert.alert("Error", "Failed to update language. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [selectedLanguage]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#340074" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#3D1A66" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>Language</CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <CText style={styles.subtitle}>
            Select your preferred language for the app
          </CText>

          {saving && (
            <View style={styles.savingOverlay}>
              <ActivityIndicator size="small" color="#3D1A66" />
              <CText style={styles.savingText}>Saving...</CText>
            </View>
          )}

          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code &&
                    styles.selectedLanguageItem,
                ]}
                onPress={() => handleSelectLanguage(language.code)}
                disabled={saving}
              >
                <View style={styles.languageInfo}>
                  <CText style={styles.languageName}>{language.name}</CText>
                  <CText style={styles.languageNative}>
                    {language.nativeName}
                  </CText>
                </View>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#3D1A66" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 150 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  savingOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    marginBottom: 10,
  },
  savingText: {
    fontSize: 14,
    color: "#3D1A66",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D1A66",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  languageList: {
    gap: 10,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedLanguageItem: {
    borderColor: "#E8D5FF",
    backgroundColor: "#F8F5FF",
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    color: "#999",
  },
});
