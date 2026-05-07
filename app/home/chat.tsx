import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface LastMessage {
  id: string;
  body: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

interface OtherMember {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  event_id?: string;
  event_title?: string;
  event_image?: string;
  last_message?: LastMessage;
  unread_count: number;
  member_count: number;
  other_members?: OtherMember[];
}

export default function Chat() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.chat.list();
      if (response?.conversations) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getConversationName = (item: Conversation) => {
    if (item.event_title) return item.event_title;
    if (item.other_members && item.other_members.length > 0) {
      return item.other_members.map((m) => m.full_name).join(", ");
    }
    return "Chat";
  };

  const getConversationAvatar = (item: Conversation) => {
    // For group chats (event-based), use the event cover image
    if (item.event_image) return item.event_image;
    // For group chats without image, use the placeholder
    if (item.event_id) {
      return "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder-chat.jpg";
    }
    // For direct messages, use the other person's avatar
    if (
      item.other_members &&
      item.other_members.length > 0 &&
      item.other_members[0].avatar_url
    ) {
      return item.other_members[0].avatar_url;
    }
    return "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder-chat.jpg";
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const renderConversation = ({ item }: { item: Conversation }) => {
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          hasUnread && styles.conversationItemUnread,
        ]}
        onPress={() =>
          router.push({
            pathname: "/home/chat-detail",
            params: {
              conversationId: item.id,
              name: getConversationName(item),
              avatar: getConversationAvatar(item),
              eventId: item.event_id || "",
            },
          } as any)
        }
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: getConversationAvatar(item) }}
            style={styles.avatar}
          />
          {item.member_count > 2 && (
            <View style={styles.groupBadge}>
              <Ionicons name="people" size={10} color="white" />
            </View>
          )}
          {hasUnread && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <CText
              style={[
                styles.conversationName,
                hasUnread && styles.conversationNameUnread,
              ]}
              numberOfLines={1}
            >
              {getConversationName(item)}
            </CText>
            <View style={styles.timestampContainer}>
              {hasUnread && <View style={styles.unreadDot} />}
              <CText
                style={[styles.timestamp, hasUnread && styles.timestampUnread]}
              >
                {formatTimestamp(item.last_message?.created_at)}
              </CText>
            </View>
          </View>
          <View style={styles.conversationFooter}>
            <CText
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {item.last_message
                ? `${(item.last_message.sender_name || "Someone").split(" ")[0]}: ${item.last_message.body}`
                : "No messages yet"}
            </CText>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <CText style={styles.unreadCount}>
                  {item.unread_count > 99 ? "99+" : item.unread_count}
                </CText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <View style={styles.headerCenter}>
            <CText style={styles.headerTitle}>Messages</CText>
            <CText style={styles.headerSubtitle}>
              {conversations.length > 0
                ? `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
                : "Stay connected"}
            </CText>
          </View>
          <View style={styles.headerRight} />
        </LinearGradient>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <Ionicons name="search" size={18} color="#3D1A66" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Conversations List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIconWrapper}>
              <ActivityIndicator size="large" color="#3D1A66" />
            </View>
            <CText style={styles.loadingText}>Loading conversations...</CText>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="chatbubbles-outline" size={48} color="#3D1A66" />
            </View>
            <CText style={styles.emptyTitle}>
              {searchQuery ? "No results found" : "No conversations yet"}
            </CText>
            <CText style={styles.emptyText}>
              {searchQuery
                ? "Try a different search term"
                : "Join an event to start chatting with other attendees!"}
            </CText>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/home")}
              >
                <Ionicons name="compass" size={20} color="white" />
                <CText style={styles.exploreButtonText}>Explore Events</CText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.conversationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#3D1A66"
              />
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
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
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
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
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D1A45",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3D1A66",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  conversationsList: {
    paddingTop: 4,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 18,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  conversationItemUnread: {
    backgroundColor: "#FDFBFF",
    borderWidth: 1.5,
    borderColor: "rgba(61, 26, 102, 0.15)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  groupBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#3D1A66",
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  onlineIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  conversationNameUnread: {
    fontWeight: "700",
    color: "#2D1A45",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3D1A66",
  },
  timestamp: {
    fontSize: 12,
    color: "#AAA",
  },
  timestampUnread: {
    color: "#3D1A66",
    fontWeight: "600",
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: "#888",
    marginRight: 10,
  },
  lastMessageUnread: {
    color: "#555",
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#3D1A66",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
});
