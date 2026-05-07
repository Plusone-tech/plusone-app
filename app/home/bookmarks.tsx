import CText from "@/components/CText";
import EventCard from "@/components/EventCard";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface BookmarkEvent {
  id: string;
  title: string;
  cover_image?: string;
  location: string;
  attendee_count: number;
  attendee_avatars?: { id: string; avatar_url?: string }[];
}

export default function Bookmarks() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await api.bookmarks.list();
      if (response?.bookmarks) {
        setBookmarks(response.bookmarks);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [fetchBookmarks])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemoveBookmark = async (eventId: string) => {
    // Optimistic update - remove from list immediately
    setBookmarks((prev) => prev.filter((b) => b.id !== eventId));

    try {
      await api.bookmarks.remove(eventId);
    } catch (error) {
      // Revert on error - refetch bookmarks
      console.error("Error removing bookmark:", error);
      fetchBookmarks();
    }
  };

  const handleCardPress = (eventId: string) => {
    router.push(`/home/event-details?id=${eventId}` as any);
  };

  // Filter bookmarks by search query
  const filteredBookmarks = bookmarks.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform event data for EventCard component
  const transformEventForCard = (event: BookmarkEvent) => ({
    id: event.id,
    title: event.title,
    imageUri:
      event.cover_image ||
      "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder.jpg",
    isTrending: event.attendee_count >= 5,
    isBookmarked: true, // All items in bookmarks are bookmarked
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#3D1A66" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>Bookmarks</CText>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Bookmarks"
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
      </SafeAreaView>

      {/* Bookmarked Events List */}
      <ScrollView
        style={styles.eventsScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3D1A66" />
            <CText style={styles.loadingText}>Loading bookmarks...</CText>
          </View>
        ) : filteredBookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#999" />
            <CText style={styles.emptyTitle}>
              {searchQuery ? "No results found" : "No bookmarks yet"}
            </CText>
            <CText style={styles.emptyText}>
              {searchQuery
                ? "Try a different search term"
                : "Bookmark events you're interested in to find them here"}
            </CText>
          </View>
        ) : (
          filteredBookmarks.map((event) => {
            const cardData = transformEventForCard(event);
            return (
              <EventCard
                key={event.id}
                {...cardData}
                onBookmarkPress={() => handleRemoveBookmark(event.id)}
                onCardPress={() => handleCardPress(event.id)}
              />
            );
          })
        )}
        <View style={{ height: 150 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  header: {
    backgroundColor: "#EDE4F6",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D1A66",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eventsScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
