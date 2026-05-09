import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  targetName?: string;
  type: "event" | "user" | "message";
}

const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Inappropriate Content",
  "Fake Event",
  "Violence",
  "Other",
];

export default function ReportModal({
  visible,
  onClose,
  onSubmit,
  targetName,
  type,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedReason, details);
      Alert.alert(
        "Report Submitted",
        "Thank you for your report. Our moderation team will review it shortly.",
        [{ text: "OK", onPress: handleClose }]
      );
    } catch (err) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>
            Report {type === "event" ? "Event" : type === "user" ? "User" : "Message"}
          </CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <CText style={styles.subtitle}>
              Why are you reporting {targetName ? `"${targetName}"` : "this"}?
            </CText>

            <View style={styles.reasonsContainer}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.reasonButtonSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <CText
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </CText>
                  {selectedReason === reason && (
                    <Ionicons name="checkmark-circle" size={20} color="#3D1A66" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <CText style={styles.detailsLabel}>Additional Details (Optional)</CText>
            <TextInput
              style={styles.textInput}
              placeholder="Please provide more context..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={details}
              onChangeText={setDetails}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                !selectedReason && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <CText style={styles.submitButtonText}>Submit Report</CText>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#340074",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F5FF",
    borderWidth: 1,
    borderColor: "#E8D5FF",
    borderRadius: 16,
    padding: 16,
  },
  reasonButtonSelected: {
    borderColor: "#3D1A66",
    backgroundColor: "#E8D5FF",
  },
  reasonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  reasonTextSelected: {
    color: "#3D1A66",
    fontWeight: "700",
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: "#F8F5FF",
    borderWidth: 1,
    borderColor: "#E8D5FF",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 30,
    color: "#333",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#340074",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#A594B8",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
