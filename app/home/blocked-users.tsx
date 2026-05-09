import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../lib/api";

interface BlockedUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const response = await api.blocks.list();
      if (response?.blockedUsers) {
        setBlockedUsers(response.blockedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch blocked users:", error);
      Alert.alert("Error", "Could not load blocked users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = useCallback((userId: string, userName: string) => {
    Alert.alert(
      "Unblock User",
      `Are you sure you want to unblock ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          style: "destructive",
          onPress: async () => {
            try {
              setBlockedUsers(prev => prev.filter(u => u.id !== userId)); // Optimistic UI
              await api.blocks.unblock(userId);
            } catch (err) {
              console.error("Failed to unblock user:", err);
              Alert.alert("Error", "Failed to unblock user.");
              fetchBlockedUsers(); // Revert
            }
          },
        },
      ]
    );
  }, [fetchBlockedUsers]);

  const renderItem = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <Image
        source={{ uri: item.avatar_url || "https://i.pravatar.cc/100" }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <CText style={styles.userName}>{item.full_name}</CText>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.id, item.full_name)}
      >
        <CText style={styles.unblockText}>Unblock</CText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>Blocked Users</CText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#340074" />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-checkmark-outline" size={60} color="#D0C0E0" />
              <CText style={styles.emptyTitle}>No Blocked Users</CText>
              <CText style={styles.emptySubtitle}>
                When you block a user, they will appear here.
              </CText>
            </View>
          }
        />
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  unblockButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3D1A66",
  },
  unblockText: {
    color: "#3D1A66",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
