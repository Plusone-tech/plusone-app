import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface Attendee {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export default function EventAttendees() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId: string; eventTitle: string }>();
  const { eventId, eventTitle } = params;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendees = useCallback(async () => {
    if (!eventId) return;
    try {
      const response = await api.events.detail(eventId);
      if (response?.attendees) {
        setAttendees(response.attendees);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const handleBlockUser = (item: Attendee) => {
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${item.full_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Block", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.blocks.block(item.id);
              Alert.alert("Blocked", `You have blocked ${item.full_name}.`);
              fetchAttendees(); // refresh to remove the blocked user
            } catch (err: any) {
              if (err.message && err.message.includes("Cannot block yourself")) {
                Alert.alert("Notice", "You cannot block yourself.");
              } else {
                Alert.alert("Error", "Could not block user.");
              }
            }
          }
        }
      ]
    );
  };

  const renderAttendee = ({ item }: { item: Attendee }) => (
    <View style={styles.attendeeCard}>
      <Image
        source={{ uri: item.avatar_url || "https://i.pravatar.cc/100" }}
        style={styles.avatar}
      />
      <View style={styles.attendeeInfo}>
        <CText style={styles.attendeeName}>{item.full_name}</CText>
      </View>
      <TouchableOpacity onPress={() => handleBlockUser(item)} style={styles.blockButton}>
        <Ionicons name="ban-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#3D1A66" }}>
        <LinearGradient
          colors={["#3D1A66", "#5E35A0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <CText style={styles.headerTitle}>PlusOnes Going</CText>
            <CText style={styles.headerSubtitle} numberOfLines={1}>
              {eventTitle || "Event"}
            </CText>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3D1A66" />
            <CText style={styles.loadingText}>Loading attendees...</CText>
          </View>
        ) : attendees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="people-outline" size={48} color="#3D1A66" />
            </View>
            <CText style={styles.emptyTitle}>No attendees yet</CText>
            <CText style={styles.emptyText}>
              Be the first to join this event!
            </CText>
          </View>
        ) : (
          <FlatList
            data={attendees}
            renderItem={renderAttendee}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              <CText style={styles.countText}>
                {attendees.length} {attendees.length === 1 ? "person" : "people"} going
              </CText>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 120,
  },
  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  attendeeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#E8D5FF",
  },
  attendeeInfo: {
    flex: 1,
    marginLeft: 14,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  blockButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFE8E8",
  },
});
