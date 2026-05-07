import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

type EntryType = "open" | "request" | "invite";

interface EntryTypeBadgeProps {
  type: EntryType;
}

export default function EntryTypeBadge({ type }: EntryTypeBadgeProps) {
  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "open":
        return "checkmark-circle";
      case "request":
        return "time-outline";
      case "invite":
        return "mail-outline";
    }
  };

  const getText = (): string => {
    switch (type) {
      case "open":
        return "Open Event - Join Instantly";
      case "request":
        return "Request Required - Host Approval Needed";
      case "invite":
        return "Invite Only - Access Restricted";
    }
  };

  return (
    <View style={styles.badge}>
      <Ionicons name={getIcon()} size={20} color="#3D1A66" />
      <CText style={styles.text}>{getText()}</CText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#E8D5FF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#3D1A66",
  },
});
