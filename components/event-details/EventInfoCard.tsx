import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface EventInfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtext?: string;
}

export default function EventInfoCard({
  icon,
  label,
  value,
  subtext,
}: EventInfoCardProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color="#3D1A66" />
      </View>
      <View style={styles.infoText}>
        <CText style={styles.infoLabel}>{label}</CText>
        <CText style={styles.infoValue}>{value}</CText>
        {subtext && <CText style={styles.infoSubtext}>{subtext}</CText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
