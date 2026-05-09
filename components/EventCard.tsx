import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { useState } from "react";
import api from "@/app/lib/api";
import CText from "./CText";
import ReportModal from "./ReportModal";

interface EventCardProps {
  id: string;
  title: string;
  imageUri: string;
  isTrending?: boolean;
  isBookmarked?: boolean;
  attendees: {
    count: number;
    avatars: string[];
  };
  location: {
    name: string;
    distance: string;
  };
  onBookmarkPress?: () => void;
  onAddPress?: () => void;
  onCardPress?: () => void;
}

export default function EventCard({
  title,
  imageUri,
  isTrending = false,
  isBookmarked = false,
  attendees,
  location,
  onBookmarkPress,
  onCardPress,
}: EventCardProps) {
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const handleReportSubmit = async (reason: string, details: string) => {
    try {
      await api.reports.create({ targetEventId: id, reason, details });
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={onCardPress}
      activeOpacity={0.95}
    >
      <View style={styles.eventImageContainer}>
        <Image source={{ uri: imageUri }} style={styles.eventImage} />

        {/* Gradient overlay for better text visibility */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradientOverlay}
        />

        {/* Badges and buttons overlay */}
        <View style={styles.topOverlay}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={(e) => {
                e.stopPropagation();
                setReportModalVisible(true);
              }}
            >
              <Ionicons name="flag-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={(e) => {
                e.stopPropagation();
                onBookmarkPress?.();
              }}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
          {isTrending && (
            <View style={styles.trendingBadge}>
              <Ionicons name="flame" size={14} color="#FF6B35" />
              <CText fontSize={12} weight="medium" style={styles.trendingText}>Trending</CText>
            </View>
          )}

        </View>

        {/* Bottom overlay with info */}
        <View style={styles.bottomOverlay}>
          <CText fontSize={22} weight="medium" style={styles.eventTitle}>{title}</CText>

          <View style={styles.locationRow}>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={12} color="#3D1A66" />
              <CText fontSize={12} weight="medium" style={styles.locationText}>{location.name}</CText>
            </View>

            {/* For When we have location enabled */}
            {/* <View style={styles.distanceBadge}>
              <CText style={styles.distanceText}>{location.distance}</CText>
            </View> */}
          </View>
        </View>
      </View>

      {/* Attendees info bar */}
      <View style={styles.attendeesBar}>
        <View style={styles.avatarGroup}>
          {attendees.avatars.slice(0, 4).map((avatar, index) => (
            <Image
              key={index}
              source={{ uri: avatar }}
              style={[
                styles.avatar,
                {
                  zIndex: 4 - index,
                  marginLeft: index > 0 ? -12 : 0,
                },
              ]}
            />
          ))}
          {attendees.count > 4 && (
            <View
              style={[styles.avatar, styles.moreAvatar, { marginLeft: -12 }]}
            >
              <CText style={styles.moreText}>+{attendees.count - 3}</CText>
            </View>
          )}
        </View>
        <CText style={styles.attendeesText}>
          {attendees.count} {attendees.count === 1 ? "person" : "people"}{" "}
          interested
        </CText>
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportSubmit}
        targetName={title}
        type="event"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  eventImageContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 15,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingText: {
    color: "#FF6B35",
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  eventTitle: {
    color: "white",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  locationText: {
    color: "#3D1A66",
  },
  distanceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  attendeesBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 12,
    backgroundColor: "#F8F5FF",
  },
  avatarGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
  },
  moreAvatar: {
    backgroundColor: "#3D1A66",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  attendeesText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
});
