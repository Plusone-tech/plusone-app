import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface Event {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  location: string;
  start_time: string;
  end_time: string;
  attendee_count: number;
  is_host?: boolean;
}

export default function JoinedEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.events.my();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isUpcoming = (event: Event) => {
    return new Date(event.end_time) >= new Date();
  };

  // Filter and categorize events
  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(isUpcoming);
  const pastEvents = filteredEvents.filter((e) => !isUpcoming(e));

  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const renderEventCard = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() =>
        router.push({
          pathname: "/home/event-details",
          params: { id: event.id },
        } as any)
      }
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            event.cover_image ||
            "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder.jpg",
        }}
        style={styles.eventImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.eventGradient}
      />

      {/* Host Badge */}
      {event.is_host && (
        <View style={styles.hostBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <CText style={styles.hostBadgeText}>Host</CText>
        </View>
      )}

      {/* Date Badge */}
      <View style={styles.dateBadge}>
        <CText style={styles.dateDay}>
          {new Date(event.start_time).getDate()}
        </CText>
        <CText style={styles.dateMonth}>
          {new Date(event.start_time).toLocaleDateString("en-US", {
            month: "short",
          })}
        </CText>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <CText style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </CText>
        <View style={styles.eventMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
            <CText style={styles.metaText} numberOfLines={1}>
              {event.location}
            </CText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
            <CText style={styles.metaText}>
              {formatTime(event.start_time)}
            </CText>
          </View>
        </View>
        <View style={styles.attendeeRow}>
          <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
          <CText style={styles.attendeeText}>
            {event.attendee_count} {event.attendee_count === 1 ? "person" : "people"} going
          </CText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <CText fontSize={32} weight="semibold" letterSpacing="-1.92">
              My Events
            </CText>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your events..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={activeTab === "upcoming" ? "#3D1A66" : "#666"}
              />
              <CText
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.tabTextActive,
                ]}
              >
                Upcoming ({upcomingEvents.length})
              </CText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.tabActive]}
              onPress={() => setActiveTab("past")}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={activeTab === "past" ? "#3D1A66" : "#666"}
              />
              <CText
                style={[
                  styles.tabText,
                  activeTab === "past" && styles.tabTextActive,
                ]}
              >
                Past ({pastEvents.length})
              </CText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Events List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrapper}>
            <ActivityIndicator size="large" color="#3D1A66" />
          </View>
          <CText style={styles.loadingText}>Loading your events...</CText>
        </View>
      ) : (
        <ScrollView
          style={styles.eventsScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3D1A66"]}
              tintColor="#3D1A66"
            />
          }
        >
          {displayedEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons
                  name={activeTab === "upcoming" ? "calendar-outline" : "time-outline"}
                  size={48}
                  color="#3D1A66"
                />
              </View>
              <CText style={styles.emptyTitle}>
                {searchQuery
                  ? "No events found"
                  : activeTab === "upcoming"
                    ? "No upcoming events"
                    : "No past events"}
              </CText>
              <CText style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try a different search term"
                  : activeTab === "upcoming"
                    ? "Join or create an event to see it here!"
                    : "Events you've attended will appear here"}
              </CText>
              {activeTab === "upcoming" && !searchQuery && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push("/home/create-event" as any)}
                >
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <CText style={styles.createButtonText}>Create Event</CText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.eventsList}>
              {displayedEvents.map(renderEventCard)}
            </View>
          )}

          <View style={{ height: 150 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FA",
  },
  header: {
    backgroundColor: "#340074",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    marginBottom: 20,
    gap: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  tabActive: {
    backgroundColor: "white",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  tabTextActive: {
    color: "#3D1A66",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  eventsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsList: {
    paddingTop: 20,
    gap: 16,
  },
  eventCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 200,
    backgroundColor: "#E0E0E0",
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  eventGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  hostBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  hostBadgeText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
  },
  dateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D1A66",
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  eventInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendeeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D1A45",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3D1A66",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
