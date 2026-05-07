import CText from "@/components/CText";
import EventCard from "@/components/EventCard";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";
import { useApp } from "../lib/AppContext";

const HEADER_HEIGHT = 280;
const VIDEO_EXTRA_HEIGHT = 120; // Extra height to show more video initially
const MIN_HEADER_VISIBLE = 160; // Minimum header height to keep visible when scrolled up

interface EventData {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  category?: string;
  location: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  start_time: string;
  end_time: string;
  host_name: string;
  host_avatar?: string;
  attendee_count: number;
  attendee_avatars?: { id: string; avatar_url?: string }[];
  entry_type: string;
  visibility: string;
  is_host?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [myEvents, setMyEvents] = useState<EventData[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"nearby" | "all" | "trending">("nearby");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { hasSeenDisclaimer, setHasSeenDisclaimer } = useApp();
  const showDisclaimer = !hasSeenDisclaimer;

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsResponse, myEventsResponse] = await Promise.all([
        api.events.list(),
        api.events.my(),
      ]);

      console.log("[Home] Events response:", JSON.stringify(eventsResponse));
      console.log("[Home] My Events response:", JSON.stringify(myEventsResponse));

      if (eventsResponse?.events) {
        setEvents(eventsResponse.events);

        // Check which events are bookmarked
        if (eventsResponse.events.length > 0) {
          const eventIds = eventsResponse.events.map((e: EventData) => e.id);
          const bookmarkResponse = await api.bookmarks.check(eventIds);
          if (bookmarkResponse?.bookmarkedIds) {
            setBookmarkedIds(new Set(bookmarkResponse.bookmarkedIds));
          }
        }
      }

      if (myEventsResponse?.events) {
        // Filter out events whose end_time is in the past
        const now = new Date();
        const upcomingEvents = myEventsResponse.events.filter(
          (event: EventData) => {
            const eventEnd = new Date(event.end_time);
            return eventEnd >= now;
          }
        );
        setMyEvents(upcomingEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Refresh events when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      // Check for unread notifications
      api.notifications.list().then((response) => {
        if (response?.notifications) {
          const hasUnread = response.notifications.some((n: any) => !n.is_read);
          setHasUnreadNotifications(hasUnread);
        }
      }).catch(console.error);
    }, [fetchEvents])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleBookmark = async (eventId: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.has(eventId);

    // Optimistic update
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });

    try {
      if (isCurrentlyBookmarked) {
        await api.bookmarks.remove(eventId);
      } else {
        await api.bookmarks.add(eventId);
      }
    } catch (error) {
      // Revert on error
      setBookmarkedIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyBookmarked) {
          newSet.add(eventId);
        } else {
          newSet.delete(eventId);
        }
        return newSet;
      });
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleAddToEvent = async (eventId: string) => {
    try {
      await api.events.join(eventId);
      Alert.alert("Success", "You have joined this event!");
      fetchEvents(); // Refresh to update attendee count
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join event");
    }
  };

  const handleCardPress = (eventId: string) => {
    router.push(`/home/event-details?id=${eventId}` as any);
  };

  // Transform event data for EventCard component
  const transformEventForCard = (event: EventData) => ({
    id: event.id,
    title: event.title,
    imageUri:
      event.cover_image ||
      "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder.jpg",
    isTrending: event.attendee_count >= 5,
    isBookmarked: bookmarkedIds.has(event.id),
    attendees: {
      count: event.attendee_count,
      avatars:
        event.attendee_avatars
          ?.slice(0, 3)
          .map((a) => a.avatar_url || "https://i.pravatar.cc/40") || [],
    },
    location: {
      name: event.location,
      distance: "", // TODO: calculate distance
    },
  });

  // Format date for My Events card
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return { day, month };
  };

  // Filter events based on active filter
  const filteredEvents = (() => {
    switch (activeFilter) {
      case "trending":
        // Trending events: events with 5+ attendees, sorted by attendee count
        return [...events]
          .filter((event) => event.attendee_count >= 5)
          .sort((a, b) => b.attendee_count - a.attendee_count);
      case "all":
        // All events, no filtering
        return events;
      case "nearby":
      default:
        // For now, show all events (could add location-based filtering later)
        return events;
    }
  })();

  // Parallax effect for video when pulling down
  const videoScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: "clamp",
  });

  const videoTranslateY = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [-50, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 28,
              width: "80%",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <CText
              fontSize={20}
              weight="semibold"
              style={{
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Disclaimer
            </CText>
            <CText
              style={{
                fontSize: 15,
                color: "#444",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              1) PlusOne is currently an MVP (early trial version).
              Some features may be buggy or not work as expected. Please bear with us while we improve things.
              If you face any issues, feel free to DM us on Instagram and we’ll get back to you.
              {"\n\n"}
              2) PlusOne helps you find people for shared experiences, but your
              safety is always in your hands. Meet in public places, let someone
              you trust know your plans, and listen to your instincts. We don’t
              verify identities or run background checks, so please connect
              thoughtfully and responsibly.
            </CText>
            <TouchableOpacity
              style={{
                backgroundColor: "#D3A7FF",
                borderRadius: 9999,
                paddingVertical: 12,
                paddingHorizontal: 32,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderBottomWidth: 4,
                borderColor: "black",
                overflow: "hidden",
              }}
              onPress={() => setHasSeenDisclaimer(true)}
            >
              <CText fontSize={16} weight="medium" style={{ color: "#000" }}>
                Okay
              </CText>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Fixed Video Background */}
      <View style={styles.videoSection}>
        <Animated.View
          style={[
            styles.videoContainer,
            {
              transform: [
                { scale: videoScale },
                { translateY: videoTranslateY },
              ],
            },
          ]}
        >
          <Image
            source={require("@/assets/images/homescreen.png")}
            style={styles.videoBackground}
            resizeMode="cover"
          />
        </Animated.View>
        <LinearGradient
          colors={["rgba(61, 26, 102, 0.2)", "rgba(61, 26, 102, 0.5)"]}
          style={styles.videoOverlay}
        />
      </View>

      {/* Fixed Header Controls (location, notifications, search) */}
      <SafeAreaView edges={["top"]} style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <View style={styles.locationButton}>
            <View style={styles.locationIconWrapper}>
              <Ionicons name="location" size={18} color="#3D1A66" />
            </View>
            <CText
              fontSize={13}
              weight="semibold"
              style={styles.locationText}
            >
              Currently available only in Mumbai
            </CText>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/home/notifications" as any)}
          >
            <Ionicons name="notifications-outline" size={22} color="#3D1A66" />
            {hasUnreadNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push("/home/search")}
          activeOpacity={0.8}
        >
          <View style={styles.searchIconWrapper}>
            <Ionicons name="search" size={18} color="#3D1A66" />
          </View>
          <CText style={styles.searchPlaceholder}>
            Search events, places...
          </CText>
          <View style={styles.searchFilterButton}>
            <Ionicons name="options-outline" size={18} color="#3D1A66" />
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Scrollable Content - overlaps video when scrolling */}
      <Animated.ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Spacer to show video initially */}
        <View style={styles.videoSpacer} />

        {/* Content Card that overlaps video */}
        <View style={styles.contentCard}>
          {/* My Events Section */}
          {myEvents.length > 0 && (
            <View style={styles.myEventsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="calendar" size={20} color="#3D1A66" />
                  <CText
                    fontSize={18}
                    weight="semibold"
                    style={styles.sectionTitle}
                  >
                    My Events
                  </CText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/home/joined-events")}
                >
                  <CText style={styles.seeAllText}>See All</CText>
                </TouchableOpacity>
              </View>
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.myEventsScroll}
              >
                {myEvents.slice(0, 5).map((event) => {
                  const { day, month } = formatEventDate(event.start_time);
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.myEventCard}
                      onPress={() => handleCardPress(event.id)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{
                          uri:
                            event.cover_image ||
                            "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder.jpg",
                        }}
                        style={styles.myEventImage}
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.8)"]}
                        style={styles.myEventGradient}
                      />
                      {event.is_host && (
                        <View style={styles.hostBadge}>
                          <Ionicons name="star" size={10} color="#FFD700" />
                          <CText style={styles.hostBadgeText}>Host</CText>
                        </View>
                      )}
                      <View style={styles.myEventDateBadge}>
                        <CText style={styles.myEventDay}>{day}</CText>
                        <CText style={styles.myEventMonth}>{month}</CText>
                      </View>
                      <View style={styles.myEventInfo}>
                        <CText style={styles.myEventTitle} numberOfLines={2}>
                          {event.title}
                        </CText>
                        <View style={styles.myEventLocation}>
                          <Ionicons name="location" size={12} color="white" />
                          <CText
                            style={styles.myEventLocationText}
                            numberOfLines={1}
                          >
                            {event.location}
                          </CText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.ScrollView>
            </View>
          )}

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === "nearby" && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter("nearby")}
            >
              <Ionicons
                name="navigate"
                size={16}
                color={activeFilter === "nearby" ? "#3D1A66" : "#666"}
              />
              <CText
                style={[
                  styles.filterText,
                  activeFilter === "nearby" && styles.filterTextActive,
                ]}
              >
                Nearby
              </CText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === "all" && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter("all")}
            >
              <Ionicons
                name="globe-outline"
                size={16}
                color={activeFilter === "all" ? "#3D1A66" : "#666"}
              />
              <CText
                style={[
                  styles.filterText,
                  activeFilter === "all" && styles.filterTextActive,
                ]}
              >
                All Events
              </CText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === "trending" && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter("trending")}
            >
              <Ionicons
                name="flame-outline"
                size={16}
                color={activeFilter === "trending" ? "#3D1A66" : "#666"}
              />
              <CText
                style={[
                  styles.filterText,
                  activeFilter === "trending" && styles.filterTextActive,
                ]}
              >
                Trending
              </CText>
            </TouchableOpacity>
          </View>

          {/* Discover Section */}
          <View style={styles.discoverSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="compass" size={20} color="#3D1A66" />
                <CText style={styles.sectionTitle}>Discover Events</CText>
              </View>
              {/* <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="swap-vertical" size={16} color="#3D1A66" />
                <CText style={styles.sortText}>Sort</CText>
              </TouchableOpacity> */}
            </View>

            {/* Events List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3D1A66" />
                <CText style={styles.loadingText}>Discovering events...</CText>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons
                    name={activeFilter === "trending" ? "flame-outline" : "calendar-outline"}
                    size={48}
                    color="#3D1A66"
                  />
                </View>
                <CText style={styles.emptyTitle}>
                  {activeFilter === "trending"
                    ? "No trending events"
                    : "No events nearby"}
                </CText>
                <CText style={styles.emptyText}>
                  {activeFilter === "trending"
                    ? "Events with 5+ attendees will appear here. Check back soon!"
                    : "Be the first to create an event in your area and bring people together!"}
                </CText>
                {activeFilter !== "trending" && (
                  <TouchableOpacity
                    style={styles.createEventButton}
                    onPress={() => router.push("/home/create-event" as any)}
                  >
                    <ExpoImage
                      source={require("../../assets/svgs/logo.svg")}
                      style={{ width: 24, height: 24 }}
                      contentFit="contain"
                    />
                    <CText style={styles.createEventButtonText}>
                      Create Event
                    </CText>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredEvents.map((event) => {
                const cardData = transformEventForCard(event);
                return (
                  <EventCard
                    key={event.id}
                    {...cardData}
                    onBookmarkPress={() => handleBookmark(event.id)}
                    onAddPress={() => handleAddToEvent(event.id)}
                    onCardPress={() => handleCardPress(event.id)}
                  />
                );
              })
            )}
          </View>

          <View style={{ height: 150 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FA",
  },
  // Fixed video background
  videoSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + VIDEO_EXTRA_HEIGHT,
    zIndex: 0,
  },
  videoContainer: {
    width: "100%",
    height: "100%",
  },
  videoBackground: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Fixed header controls
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  locationLabel: {
    color: "rgba(235, 235, 235, 1)",
    fontSize: 11,
    fontWeight: "500",
  },
  locationText: {
    color: "white",
    display: "flex",
    flexDirection: "column",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    borderWidth: 1.5,
    borderColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 10,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#888",
  },
  searchFilterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
  },
  // Scrollable content
  scrollContent: {
    flex: 1,
    marginTop: MIN_HEADER_VISIBLE, // Limit how far up content can scroll
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  videoSpacer: {
    height: HEADER_HEIGHT + VIDEO_EXTRA_HEIGHT - MIN_HEADER_VISIBLE - 60, // Adjusted for marginTop
  },
  contentCard: {
    backgroundColor: "#F5F0FA",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 800,
    paddingTop: 8,
    // Shadow to give depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  // My Events Section
  myEventsSection: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#2D1A45",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3D1A66",
    fontWeight: "600",
  },
  myEventsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  myEventCard: {
    width: 160,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#fff",
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  myEventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  myEventGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  hostBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  hostBadgeText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "700",
  },
  myEventDateBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  myEventDay: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3D1A66",
    lineHeight: 20,
  },
  myEventMonth: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  myEventInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  myEventTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },
  myEventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  myEventLocationText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
  },
  // Filter Section
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: "#F0E6FA",
    borderColor: "#3D1A66",
  },
  filterText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#3D1A66",
    fontWeight: "600",
  },
  // Discover Section
  discoverSection: {
    paddingHorizontal: 20,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0E6FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sortText: {
    fontSize: 12,
    color: "#3D1A66",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 40,
    backgroundColor: "white",
    borderRadius: 24,
    marginTop: 8,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D1A45",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  createEventButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3D1A66",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  createEventButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
