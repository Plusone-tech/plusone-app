import CText from "@/components/CText";
import EventCard from "@/components/EventCard";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface EventData {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  category?: string;
  location: string;
  location_address?: string;
  start_time: string;
  end_time: string;
  host_name: string;
  host_avatar?: string;
  attendee_count: number;
  attendee_avatars?: { id: string; avatar_url?: string }[];
}

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "today" | "tomorrow" | "weekend"
  >("all");

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.events.list();
      if (response?.events) {
        setEvents(response.events);

        // Check which events are bookmarked
        if (response.events.length > 0) {
          const eventIds = response.events.map((e: EventData) => e.id);
          const bookmarkResponse = await api.bookmarks.check(eventIds);
          if (bookmarkResponse?.bookmarkedIds) {
            setBookmarkedIds(new Set(bookmarkResponse.bookmarkedIds));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  // Filter events based on search query and date filter
  const filteredEvents = events.filter((event) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    const eventDate = new Date(event.start_time);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekendStart = new Date(today);
    weekendStart.setDate(today.getDate() + (6 - today.getDay())); // Saturday
    const weekendEnd = new Date(weekendStart);
    weekendEnd.setDate(weekendStart.getDate() + 1); // Sunday

    let matchesDate = true;
    if (selectedFilter === "today") {
      matchesDate = eventDate.toDateString() === today.toDateString();
    } else if (selectedFilter === "tomorrow") {
      matchesDate = eventDate.toDateString() === tomorrow.toDateString();
    } else if (selectedFilter === "weekend") {
      matchesDate =
        eventDate.toDateString() === weekendStart.toDateString() ||
        eventDate.toDateString() === weekendEnd.toDateString();
    }

    return matchesSearch && matchesDate;
  });

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
      distance: "",
    },
  });

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
      fetchEvents();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join event");
    }
  };

  const handleCardPress = (eventId: string) => {
    router.push(`/home/event-details?id=${eventId}` as any);
  };

  const handleBack = () => {
    router.back();
  };

  const filters = [
    { key: "all" as const, label: "All Events" },
    { key: "today" as const, label: "Today" },
    { key: "tomorrow" as const, label: "Tomorrow" },
    { key: "weekend" as const, label: "This Weekend" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#3D1A66" />
        </TouchableOpacity>
        <CText style={styles.headerTitle}>Search Events</CText>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for events, places, or activities..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScrollView}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <CText
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </CText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {(searchQuery.length > 0 || selectedFilter !== "all") && (
        <View style={styles.resultsHeader}>
          <CText style={styles.resultsText}>
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "result" : "results"} found
          </CText>
        </View>
      )}

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D1A66" />
          <CText style={styles.loadingText}>Loading events...</CText>
        </View>
      ) : (
        /* Events List */
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const cardData = transformEventForCard(item);
            return (
              <EventCard
                {...cardData}
                onBookmarkPress={() => handleBookmark(item.id)}
                onAddPress={() => handleAddToEvent(item.id)}
                onCardPress={() => handleCardPress(item.id)}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={64}
                color="#CCC"
                style={styles.emptyIcon}
              />
              <CText style={styles.emptyTitle}>
                {searchQuery.length > 0 || selectedFilter !== "all"
                  ? "No events found"
                  : "Start searching for events"}
              </CText>
              <CText style={styles.emptySubtitle}>
                {searchQuery.length > 0 || selectedFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Enter keywords to find events near you"}
              </CText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3D1A66",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filtersScrollView: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 15,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: {
    backgroundColor: "#E8D5FF",
    borderColor: "#3D1A66",
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "#3D1A66",
    fontWeight: "600",
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
