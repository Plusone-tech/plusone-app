import CText from "@/components/CText";
import TextInputBubble from "@/components/TextInputBubble";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Text Input Bubble state
  const [textBubble, setTextBubble] = useState<{
    visible: boolean;
    label: string;
    value: string;
    field: string;
    placeholder: string;
  }>({
    visible: false,
    label: "",
    value: "",
    field: "",
    placeholder: "",
  });

  const openTextBubble = (field: string, label: string, value: string, placeholder: string) => {
    setTextBubble({ visible: true, label, value, field, placeholder });
  };

  const handleTextBubbleConfirm = (newValue: string) => {
    switch (textBubble.field) {
      case "currentPassword": setCurrentPassword(newValue); break;
      case "newPassword": setNewPassword(newValue); break;
      case "confirmPassword": setConfirmPassword(newValue); break;
    }
    setTextBubble(prev => ({ ...prev, visible: false }));
  };

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      await api.profile.changePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert("Success", "Password changed successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error("Failed to change password:", err);
      const message =
        err.message === "Current password incorrect"
          ? "Current password is incorrect"
          : "Failed to change password. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, router]);

  return (
    <View style={styles.container}>
      {/* Text Input Bubble */}
      <TextInputBubble
        visible={textBubble.visible}
        label={textBubble.label}
        value={textBubble.value}
        placeholder={textBubble.placeholder}
        secureTextEntry
        autoCapitalize="none"
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
          <CText style={styles.headerTitle}>Change Password</CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#0066FF" />
            <CText style={styles.infoText}>
              Make sure your password is at least 8 characters long and includes
              a mix of letters and numbers
            </CText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Current Password</CText>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openTextBubble("currentPassword", "Current Password", currentPassword, "Enter current password")}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#999" />
                <CText style={{ flex: 1, fontSize: 16, color: currentPassword ? "#333" : "#999" }}>
                  {currentPassword ? "••••••••" : "Enter current password"}
                </CText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <CText style={styles.label}>New Password</CText>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openTextBubble("newPassword", "New Password", newPassword, "Enter new password")}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#999" />
                <CText style={{ flex: 1, fontSize: 16, color: newPassword ? "#333" : "#999" }}>
                  {newPassword ? "••••••••" : "Enter new password"}
                </CText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <CText style={styles.label}>Confirm New Password</CText>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => openTextBubble("confirmPassword", "Confirm New Password", confirmPassword, "Confirm new password")}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#999" />
                <CText style={{ flex: 1, fontSize: 16, color: confirmPassword ? "#333" : "#999" }}>
                  {confirmPassword ? "••••••••" : "Confirm new password"}
                </CText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changeButton, saving && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <CText style={styles.changeButtonText}>Change Password</CText>
            )}
          </TouchableOpacity>

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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0FF",
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0066FF",
    lineHeight: 18,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  changeButton: {
    backgroundColor: "#3D1A66",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
