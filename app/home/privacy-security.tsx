import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function PrivacySecurity() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { privacy_settings, security_settings } =
          await api.profile.getPrivacy();
        setProfileVisibility(privacy_settings?.profileVisibility ?? true);
        setShowOnlineStatus(privacy_settings?.showOnlineStatus ?? true);
        setAllowMessages(privacy_settings?.allowMessages ?? true);
        setTwoFactorAuth(security_settings?.twoFactorAuth ?? false);
      } catch (err) {
        console.error("Failed to fetch privacy settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updatePrivacy = useCallback(
    async (key: string, value: boolean) => {
      try {
        await api.profile.updatePrivacy({
          privacy_settings: {
            profileVisibility,
            showOnlineStatus,
            allowMessages,
            [key]: value,
          },
        });
      } catch (err) {
        console.error("Failed to update privacy settings:", err);
        Alert.alert("Error", "Failed to update settings. Please try again.");
        // Revert the toggle
        if (key === "profileVisibility") setProfileVisibility(!value);
        if (key === "showOnlineStatus") setShowOnlineStatus(!value);
        if (key === "allowMessages") setAllowMessages(!value);
      }
    },
    [profileVisibility, showOnlineStatus, allowMessages]
  );

  const updateSecurity = useCallback(
    async (key: string, value: boolean) => {
      try {
        await api.profile.updatePrivacy({
          security_settings: {
            twoFactorAuth,
            [key]: value,
          },
        });
      } catch (err) {
        console.error("Failed to update security settings:", err);
        Alert.alert("Error", "Failed to update settings. Please try again.");
        // Revert the toggle
        if (key === "twoFactorAuth") setTwoFactorAuth(!value);
      }
    },
    [twoFactorAuth]
  );

  const handleToggle = useCallback(
    (key: string, value: boolean, type: "privacy" | "security") => {
      // Update local state immediately for responsive UI
      if (key === "profileVisibility") setProfileVisibility(value);
      if (key === "showOnlineStatus") setShowOnlineStatus(value);
      if (key === "allowMessages") setAllowMessages(value);
      if (key === "twoFactorAuth") setTwoFactorAuth(value);

      // Persist to backend
      if (type === "privacy") {
        updatePrivacy(key, value);
      } else {
        updateSecurity(key, value);
      }
    },
    [updatePrivacy, updateSecurity]
  );

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Second confirmation for extra safety
            Alert.alert(
              "Final Confirmation",
              "This will permanently delete your account and all associated data. Are you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete My Account",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await api.profile.deleteAccount();
                      Alert.alert(
                        "Account Deleted",
                        "Your account has been successfully deleted.",
                        [
                          {
                            text: "OK",
                            onPress: () => router.replace("/onboarding" as any),
                          },
                        ]
                      );
                    } catch (err) {
                      console.error("Failed to delete account:", err);
                      Alert.alert(
                        "Error",
                        "Failed to delete account. Please try again."
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [router]);

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
          <CText style={styles.headerTitle}>Privacy & Security</CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Privacy Settings */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>Privacy</CText>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="eye-outline" size={20} color="#3D1A66" />
                <View style={styles.settingTextContainer}>
                  <CText style={styles.settingText}>Profile Visibility</CText>
                  <CText style={styles.settingSubtext}>
                    Make your profile visible to others
                  </CText>
                </View>
              </View>
              <Switch
                value={profileVisibility}
                onValueChange={(v) =>
                  handleToggle("profileVisibility", v, "privacy")
                }
                trackColor={{ false: "#E0E0E0", true: "#E8D5FF" }}
                thumbColor={profileVisibility ? "#3D1A66" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="radio-button-on-outline"
                  size={20}
                  color="#00AA00"
                />
                <View style={styles.settingTextContainer}>
                  <CText style={styles.settingText}>Show Online Status</CText>
                  <CText style={styles.settingSubtext}>
                    Let others see when you&apos;re online
                  </CText>
                </View>
              </View>
              <Switch
                value={showOnlineStatus}
                onValueChange={(v) =>
                  handleToggle("showOnlineStatus", v, "privacy")
                }
                trackColor={{ false: "#E0E0E0", true: "#E8D5FF" }}
                thumbColor={showOnlineStatus ? "#3D1A66" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="chatbubble-outline" size={20} color="#0066FF" />
                <View style={styles.settingTextContainer}>
                  <CText style={styles.settingText}>Allow Messages</CText>
                  <CText style={styles.settingSubtext}>
                    Receive messages from other users
                  </CText>
                </View>
              </View>
              <Switch
                value={allowMessages}
                onValueChange={(v) =>
                  handleToggle("allowMessages", v, "privacy")
                }
                trackColor={{ false: "#E0E0E0", true: "#E8D5FF" }}
                thumbColor={allowMessages ? "#3D1A66" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>Security</CText>

            <View style={[styles.settingItem, { opacity: 0.5 }]}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#999"
                />
                <View style={styles.settingTextContainer}>
                  <CText style={[styles.settingText, { color: "#999" }]}>
                    Two-Factor Authentication (Coming Soon)
                  </CText>
                  <CText style={styles.settingSubtext}>
                    Add an extra layer of security
                  </CText>
                </View>
              </View>
              <Switch
                value={false}
                disabled={true}
                trackColor={{ false: "#E0E0E0", true: "#E8D5FF" }}
                thumbColor="#f4f3f4"
              />
            </View>

          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>Data Management</CText>

            <View style={[styles.settingItem, { opacity: 0.5 }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="download-outline" size={20} color="#999" />
                <CText style={[styles.settingText, { color: "#999" }]}>Download My Data (Coming Soon)</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>

            <TouchableOpacity
              style={[styles.settingItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={20} color="#FF4444" />
                <CText style={[styles.settingText, styles.dangerText]}>
                  Delete Account
                </CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF4444" />
            </TouchableOpacity>
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
  section: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3D1A66",
    marginBottom: 12,
    marginLeft: 5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  settingSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  dangerItem: {
    borderWidth: 2,
    borderColor: "#FFE8E8",
  },
  dangerText: {
    color: "#FF4444",
  },
});
