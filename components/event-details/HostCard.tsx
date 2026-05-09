import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface HostCardProps {
  name: string;
  avatar: string;
  eventsHosted: number;
  onReport?: () => void;
  onBlock?: () => void;
}

export default function HostCard({
  name,
  avatar,
  eventsHosted,
  onReport,
  onBlock,
}: HostCardProps) {
  return (
    <View style={styles.hostCard}>
      <CText style={styles.sectionTitle}>Hosted By</CText>
      <View style={styles.hostInfo}>
        <Image source={{ uri: avatar }} style={styles.hostAvatar} />
        <View style={styles.hostDetails}>
          <CText style={styles.hostName}>{name}</CText>
          <View style={styles.hostStats}>
            <Ionicons name="calendar-outline" size={14} color="#3D1A66" />
            <CText style={styles.hostEvents}>{eventsHosted} events hosted</CText>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {onBlock && (
            <TouchableOpacity onPress={onBlock} style={styles.blockButton}>
              <Ionicons name="ban-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          )}
          {onReport && (
            <TouchableOpacity onPress={onReport} style={styles.reportButton}>
              <Ionicons name="flag-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hostCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  hostAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  hostStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hostEvents: {
    fontSize: 14,
    color: "#666",
  },
  reportButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFE8E8",
  },
  blockButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFE8E8",
  },
});
