import CText from "@/components/CText";
import TextInputBubble from "@/components/TextInputBubble";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Text Input Bubble state
  const [textBubble, setTextBubble] = useState<{
    visible: boolean;
    label: string;
    value: string;
    field: string;
    placeholder: string;
    multiline: boolean;
  }>({
    visible: false,
    label: "",
    value: "",
    field: "",
    placeholder: "",
    multiline: false,
  });

  const openTextBubble = (field: string, label: string, value: string, placeholder: string, multiline = false) => {
    setTextBubble({ visible: true, label, value, field, placeholder, multiline });
  };

  const handleTextBubbleConfirm = (newValue: string) => {
    switch (textBubble.field) {
      case "name": setName(newValue); break;
      case "phone": setPhone(newValue); break;
      case "location": setLocation(newValue); break;
      case "bio": setBio(newValue); break;
    }
    setTextBubble(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { profile } = await api.profile.get();
        setName(profile?.full_name || "");
        setEmail(profile?.email || "");
        setPhone(profile?.phone || "");
        setBio(profile?.bio || "");
        setLocation(profile?.location || "");
        setAvatarUrl(profile?.avatar_url || null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePickImage = useCallback(async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your profile picture."
      );
      return;
    }

    // Pick image
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

    setUploading(true);
    try {
      const { avatarUrl: newAvatarUrl } =
        await api.uploads.uploadProfilePicture(asset.uri, mimeType);
      setAvatarUrl(newAvatarUrl);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Failed to upload image:", err);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name is required.");
      return;
    }

    setSaving(true);
    try {
      await api.profile.update({
        full_name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
      });
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Failed to update profile:", err);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [name, phone, bio, location, router]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#340074" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Text Input Bubble */}
      <TextInputBubble
        visible={textBubble.visible}
        label={textBubble.label}
        value={textBubble.value}
        placeholder={textBubble.placeholder}
        multiline={textBubble.multiline}
        keyboardType={textBubble.field === "phone" ? "phone-pad" : undefined}
        onConfirm={handleTextBubbleConfirm}
        onCancel={() => setTextBubble(prev => ({ ...prev, visible: false }))}
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#3D1A66" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>Edit Profile</CText>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#3D1A66" />
            ) : (
              <CText style={styles.saveButtonText}>Save</CText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: avatarUrl || "https://i.pravatar.cc/150?img=12",
                }}
                style={styles.avatar}
              />
              {uploading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="large" color="#FFF" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <Ionicons name="camera" size={20} color="#3D1A66" />
              <CText style={styles.changePhotoText}>
                {uploading ? "Uploading..." : "Change Photo"}
              </CText>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Full Name</CText>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openTextBubble("name", "Full Name", name, "Enter your name")}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={20} color="#999" />
                <CText style={{ flex: 1, fontSize: 16, color: name ? "#333" : "#999" }}>
                  {name || "Enter your name"}
                </CText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <CText style={styles.label}>Email</CText>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Ionicons name="mail-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  value={email}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>
              <CText style={styles.helperText}>Email cannot be changed</CText>
            </View>

            <View style={styles.inputGroup}>
              <CText style={styles.label}>Phone Number</CText>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openTextBubble("phone", "Phone Number", phone, "Enter your phone")}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={20} color="#999" />
                <CText style={{ flex: 1, fontSize: 16, color: phone ? "#333" : "#999" }}>
                  {phone || "Enter your phone"}
                </CText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <CText style={styles.label}>Location</CText>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openTextBubble("location", "Location", location, "Enter your location")}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={20} color="#999" />
                <CText style={{ flex: 1, fontSize: 16, color: location ? "#333" : "#999" }}>
                  {location || "Enter your location"}
                </CText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <CText style={styles.label}>Bio</CText>
              <TouchableOpacity
                style={[styles.inputContainer, styles.textAreaContainer]}
                onPress={() => openTextBubble("bio", "Bio", bio, "Tell us about yourself", true)}
                activeOpacity={0.7}
              >
                <CText style={{ flex: 1, fontSize: 16, color: bio ? "#333" : "#999", minHeight: 80 }} numberOfLines={4}>
                  {bio || "Tell us about yourself"}
                </CText>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#EDE4F6",
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
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D1A66",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E8D5FF",
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D1A66",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D1A66",
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  textAreaContainer: {
    alignItems: "flex-start",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
});
