import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, clearAuthToken } from "../lib/api";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  language: string | null;
  location: string | null;
  interests?: string[];
}

interface Stats {
  events: number;
  plusOnes: number;
  bookmarks: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    events: 0,
    plusOnes: 0,
    bookmarks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const checkPermissions = useCallback(async () => {
    // Check notification permission
    const { status: notifStatus } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(notifStatus === "granted");
  }, []);

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    if (value) {
      // Request notification permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setNotificationsEnabled(true);
      } else {
        // Permission denied, open settings
        Alert.alert(
          "Notifications Needed",
          "Please enable notifications in your device settings to receive updates about events.",
          [
            { text: "Not Now", style: "cancel" },
            {
              text: "Settings",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } else {
      // User wants to disable - direct to settings
      Alert.alert(
        "Disable Notifications",
        "To disable notifications, please go to your device settings.",
        [
          { text: "Not Now", style: "cancel" },
          {
            text: "Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, statsRes, interestsRes] = await Promise.all([
        api.profile.get(),
        api.profile.stats(),
        api.profile.getInterests().catch(() => ({ interests: [] })),
      ]);
      setProfile(profileRes.profile);
      setStats(statsRes.stats);
      setInterests(interestsRes.interests || []);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    checkPermissions();
  }, [fetchProfile, checkPermissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
    checkPermissions();
  }, [fetchProfile, checkPermissions]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photo Access Needed",
        "To change your profile picture, please allow access to your photo library in Settings.",
        [
          { text: "Not Now", style: "cancel" },
          {
            text: "Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || "image/jpeg";

    setUploadingAvatar(true);
    try {
      const { avatarUrl: newAvatarUrl } =
        await api.uploads.uploadProfilePicture(asset.uri, mimeType);
      // Update local profile state with new avatar
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: newAvatarUrl } : prev,
      );
      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Failed to upload image:", err);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await api.logout();
            await clearAuthToken();
            router.replace("/onboarding" as any);
          } catch (err) {
            console.error("Logout failed:", err);
            // Clear token anyway on logout attempt
            await clearAuthToken();
            router.replace("/onboarding" as any);
          }
        },
      },
    ]);
  }, [router]);

  const handleDeleteAccount = useCallback(async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await api.profile.deleteAccount();
              await clearAuthToken();
              router.replace("/onboarding" as any);
            } catch (err) {
              console.error("Delete account failed:", err);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
              );
              setLoading(false);
            }
          },
        },
      ],
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <SafeAreaView edges={["top"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <CText style={styles.headerTitle}>Profile</CText>
            <View style={styles.editButton} />
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    profile?.avatar_url || "https://i.pravatar.cc/150?img=12",
                }}
                style={styles.avatar}
              />
              {uploadingAvatar && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="large" color="#FFF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handlePickImage}
                disabled={uploadingAvatar}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <CText style={styles.userName}>
              {profile?.full_name || "User"}
            </CText>
            {/* <CText style={styles.userEmail}>{profile?.email || ""}</CText>
            {profile?.phone && (
              <CText style={styles.userPhone}>{profile.phone}</CText>
            )} */}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <CText style={styles.statNumber}>{stats.events}</CText>
                <CText style={styles.statLabel}>Events</CText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <CText style={styles.statNumber}>{stats.plusOnes}</CText>
                <CText style={styles.statLabel}>PlusOnes</CText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <CText style={styles.statNumber}>{stats.bookmarks}</CText>
                <CText style={styles.statLabel}>Bookmarks</CText>
              </View>
            </View>

            {/* Interests Tags */}
            {interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {interests.map((interest) => (
                  <View key={interest} style={styles.interestChip}>
                    <CText style={styles.interestText}>
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </CText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </SafeAreaView>

        {/* Settings Sections */}
        <View style={styles.settingsContainer}>
          {/* Account Settings */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>Account</CText>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/edit-profile" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#E8D5FF" }]}
                >
                  <Ionicons name="person-outline" size={20} color="#3D1A66" />
                </View>
                <CText style={styles.settingText}>Edit Profile</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            {/* // ...existing code... */}

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/privacy-security" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#E8F5FF" }]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#0066FF"
                  />
                </View>
                <CText style={styles.settingText}>Privacy & Security</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/blocked-users" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FFE8E8" }]}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#FF4444"
                  />
                </View>
                <CText style={styles.settingText}>Blocked Users</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>Preferences</CText>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FFF4E8" }]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#FF9500"
                  />
                </View>
                <CText style={styles.settingText}>Push Notifications</CText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: "#E0E0E0", true: "#E8D5FF" }}
                thumbColor={notificationsEnabled ? "#3D1A66" : "#f4f3f4"}
              />
            </View>

            {/* <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/language" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FFE8F5" }]}
                >
                  <Ionicons name="language-outline" size={20} color="#FF0066" />
                </View>
                <CText style={styles.settingText}>Language</CText>
              </View>
              <View style={styles.settingRight}>
                <CText style={styles.settingValue}>
                  {profile?.language || "English"}
                </CText>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity> */}
          </View>

          {/* Support */}
          {/* <View style={styles.section}>
            <CText style={styles.sectionTitle}>Support</CText>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/help-support" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#E8F0FF" }]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#0066FF"
                  />
                </View>
                <CText style={styles.settingText}>Help & Support</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FFF8E8" }]}
                >
                  <Ionicons name="star-outline" size={20} color="#FFB800" />
                </View>
                <CText style={styles.settingText}>Rate Us</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#E8FFE8" }]}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color="#00CC00"
                  />
                </View>
                <CText style={styles.settingText}>Share App</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>  */}

          {/* About */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>About</CText>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/legal?type=terms" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#F0F0F0" }]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#666"
                  />
                </View>
                <CText style={styles.settingText}>Terms & Conditions</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/home/legal?type=privacy" as any)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#F0F0F0" }]}
                >
                  <Ionicons
                    name="document-lock-outline"
                    size={20}
                    color="#666"
                  />
                </View>
                <CText style={styles.settingText}>Privacy Policy</CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#F0F0F0" }]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#666"
                  />
                </View>
                <CText style={styles.settingText}>App Version</CText>
              </View>
              <CText style={styles.settingValue}>
                {Application.nativeApplicationVersion || "1.0.0"}
              </CText>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF4444" />
            <CText style={styles.logoutText}>Log Out</CText>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color="#FF4444" />
            <CText style={styles.logoutText}>Delete My Account</CText>
          </TouchableOpacity>

          <View style={{ height: 150 }} />
        </View>
      </ScrollView>
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
  header: {
    backgroundColor: "#340074",
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "white",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3D1A66",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#340074",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 15,
    padding: 15,
    width: "100%",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  settingsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 25,
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
    borderRadius: 15,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: "#999",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginTop: 10,
    gap: 10,
    borderWidth: 2,
    borderColor: "#FFE8E8",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4444",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 18,
    borderRadius: 15,
    marginTop: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 10,
  },
  interestChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  interestText: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
  },
});
