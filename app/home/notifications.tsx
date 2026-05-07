import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
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

interface Notification {
  id: string;
  user_id: string;
  event_id?: string;
  title: string;
  body?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
  event_title?: string;
  event_image?: string;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.notifications.list();
      if (response?.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      // Mark notifications as read when screen is focused
      api.notifications.markRead().catch(console.error);
    }, [fetchNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (dateString: string) => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "event_joined":
        return "checkmark-circle";
      case "new_attendee":
        return "person-add";
      case "event_reminder":
        return "alarm";
      case "message":
        return "chatbubble";
      default:
        return "notifications";
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.event_id) {
      router.push({
        pathname: "/home/event-details",
        params: { id: notification.event_id },
      } as any);
    }
  };

  // Filter notifications based on search
  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.body?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const todayNotifications = filteredNotifications.filter((n) =>
    isToday(n.created_at)
  );
  const yesterdayNotifications = filteredNotifications.filter((n) =>
    isYesterday(n.created_at)
  );
  const olderNotifications = filteredNotifications.filter(
    (n) => !isToday(n.created_at) && !isYesterday(n.created_at)
  );

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.is_read && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      {notification.event_image ? (
        <Image
          source={{ uri: notification.event_image }}
          style={styles.notificationImage}
        />
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons
            name={getNotificationIcon(notification.type) as any}
            size={24}
            color="#3D1A66"
          />
        </View>
      )}
      <View style={styles.notificationContent}>
        <CText
          fontSize={14}
          weight={notification.is_read ? "regular" : "semibold"}
          style={styles.notificationText}
        >
          {notification.title}
        </CText>
        {notification.body && (
          <CText fontSize={13} style={styles.bodyText} numberOfLines={2}>
            {notification.body}
          </CText>
        )}
        <CText fontSize={12} style={styles.timeText}>
          {formatTime(notification.created_at)}
        </CText>
      </View>
      {!notification.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <CText fontSize={18} weight="semibold" style={styles.sectionTitle}>
          {title}
        </CText>
        {items.map(renderNotification)}
      </View>
    );
  };

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
            <CText fontSize={32} weight="semibold" style={{ color: "white" }}>
              Notifications
            </CText>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Notifications"
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
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D1A66" />
          <CText style={styles.loadingText}>Loading notifications...</CText>
        </View>
      ) : (
        <ScrollView
          style={styles.notificationsScroll}
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
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color="#ccc"
              />
              <CText style={styles.emptyText}>
                {searchQuery
                  ? "No notifications match your search"
                  : "No notifications yet"}
              </CText>
              <CText style={styles.emptySubtext}>
                {searchQuery
                  ? "Try a different search term"
                  : "You'll see notifications here when there's activity"}
              </CText>
            </View>
          ) : (
            <>
              {renderSection("Today", todayNotifications)}
              {renderSection("Yesterday", yesterdayNotifications)}
              {renderSection("Earlier", olderNotifications)}
            </>
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
    backgroundColor: "#F5F5F5",
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
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
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
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  notificationsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 15,
    color: "#333",
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    gap: 12,
    alignItems: "center",
  },
  unreadCard: {
    backgroundColor: "#F8F0FF",
    borderWidth: 1,
    borderColor: "#E8D5FF",
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#EDE4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  notificationText: {
    color: "#333",
    lineHeight: 20,
  },
  bodyText: {
    color: "#666",
    lineHeight: 18,
  },
  timeText: {
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3D1A66",
  },
});
