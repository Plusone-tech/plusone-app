import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

interface HostCardProps {
  name: string;
  avatar: string;
  eventsHosted: number;
}

export default function HostCard({
  name,
  avatar,
  eventsHosted,
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
});
