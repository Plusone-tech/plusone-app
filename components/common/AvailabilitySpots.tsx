import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface AvailabilitySpotsProps {
  current: number;
  max: number | null;
}

export default function AvailabilitySpots({
  current,
  max,
}: AvailabilitySpotsProps) {
  const hasLimit = max !== null && max > 0;
  const spotsLeft = hasLimit ? max - current : null;
  const progressPercentage = hasLimit ? (current / max) * 100 : 0;

  return (
    <View style={styles.spotsCard}>
      <View style={styles.spotsHeader}>
        <Ionicons name="people-outline" size={24} color="#3D1A66" />
        <CText style={styles.spotsTitle}>Availability</CText>
      </View>
      <View style={styles.spotsInfo}>
        <CText style={styles.spotsNumber}>{hasLimit ? spotsLeft : "∞"}</CText>
        <CText style={styles.spotsLabel}>
          {hasLimit ? "spots left" : "unlimited spots"}
        </CText>
      </View>
      {hasLimit && (
        <>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercentage}%` }]}
            />
          </View>
          <CText style={styles.spotsSubtext}>
            {current} of {max} spots filled
          </CText>
        </>
      )}
      {!hasLimit && (
        <CText style={styles.spotsSubtext}>
          {current} {current === 1 ? "person" : "people"} attending
        </CText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  spotsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
  },
  spotsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  spotsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  spotsInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 15,
  },
  spotsNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#3D1A66",
  },
  spotsLabel: {
    fontSize: 16,
    color: "#666",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3D1A66",
  },
  spotsSubtext: {
    fontSize: 13,
    color: "#999",
  },
});
