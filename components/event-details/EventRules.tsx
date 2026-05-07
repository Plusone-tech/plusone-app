import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface EventRulesProps {
  rules: string[];
  showAgreement?: boolean;
  agreed?: boolean;
  onAgreeToggle?: () => void;
}

export default function EventRules({
  rules,
  showAgreement = false,
  agreed = false,
  onAgreeToggle,
}: EventRulesProps) {
  return (
    <View style={styles.rulesCard}>
      <CText style={styles.sectionTitle}>Event Rules</CText>
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleItem}>
          <Ionicons name="checkmark-circle" size={20} color="#3D1A66" />
          <CText style={styles.ruleText}>{rule}</CText>
        </View>
      ))}

      {showAgreement && onAgreeToggle && (
        <TouchableOpacity style={styles.agreeCheckbox} onPress={onAgreeToggle}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={18} color="white" />}
          </View>
          <CText style={styles.agreeText}>
            I agree to follow all event rules and guidelines
          </CText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rulesCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  agreeCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#3D1A66",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3D1A66",
  },
  agreeText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
});
