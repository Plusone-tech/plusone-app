import CText from "@/components/CText";
import ReportModal from "@/components/ReportModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  full_name: string;
  avatar_url?: string;
  body: string;
  created_at: string;
}

interface UserInfo {
  id: string;
}

export default function ChatDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId: string;
    name: string;
    avatar: string;
    eventId?: string;
  }>();
  const { conversationId, name, avatar, eventId } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEventEnded, setIsEventEnded] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Keyboard listeners for Android
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const response = await api.chat.messages(conversationId);
      if (response?.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.me();
      if (response?.user) {
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      fetchCurrentUser();
      // Mark conversation as read when opened
      if (conversationId) {
        api.chat.markRead(conversationId).catch(console.error);
      }
      // Check if event has ended
      if (eventId) {
        api.events.detail(eventId).then((response) => {
          if (response?.event?.end_time) {
            const endTime = new Date(response.event.end_time);
            setIsEventEnded(endTime < new Date());
          }
        }).catch(console.error);
      }
    }, [fetchMessages, fetchCurrentUser, conversationId, eventId])
  );

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId || isSending) return;

    const messageText = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUser?.id || "",
      full_name: "You",
      body: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await api.chat.send(conversationId, messageText);
      if (response?.message) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id
              ? { ...response.message, full_name: "You" }
              : m
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setInputText(messageText); // Restore input
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const shouldShowDateHeader = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentDate = new Date(
      messages[currentIndex].created_at
    ).toDateString();
    const prevDate = new Date(
      messages[currentIndex - 1].created_at
    ).toDateString();
    return currentDate !== prevDate;
  };

  const isOwnMessage = (senderId: string) => {
    return currentUser?.id === senderId;
  };

  const handleMessagePress = (item: Message) => {
    if (isOwnMessage(item.sender_id)) return;
    if (selectedMessageId === item.id) {
      setSelectedMessageId(null);
    } else {
      setSelectedMessageId(item.id);
    }
  };

  const handleBlockPrompt = (item: Message) => {
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
              await api.blocks.block(item.sender_id);
              Alert.alert("Blocked", `You have blocked ${item.full_name}.`);
              fetchMessages(); // Refresh messages to filter out the blocked user
            } catch (err: any) {
              Alert.alert("Error", "Could not block user.");
            }
          }
        }
      ]
    );
  };

  const handleReportSubmit = async (reason: string, details: string) => {
    if (!reportTarget) return;
    try {
      await api.reports.create({ targetMessageId: reportTarget.id, reason, details });
    } catch (err: any) {
      throw err;
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = isOwnMessage(item.sender_id);
    const showDateHeader = shouldShowDateHeader(index);
    const showAvatar =
      !isOwn &&
      (index === 0 || messages[index - 1].sender_id !== item.sender_id);
    const isSelected = selectedMessageId === item.id;

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeaderLine} />
            <CText style={styles.dateHeaderText}>
              {formatDateHeader(item.created_at)}
            </CText>
            <View style={styles.dateHeaderLine} />
          </View>
        )}
        <View
          style={[
            styles.messageRow,
            isOwn ? styles.ownMessageRow : styles.otherMessageRow,
          ]}
        >
          {!isOwn && (
            <View style={styles.avatarSpace}>
              {showAvatar ? (
                <Image
                  source={{
                    uri: item.avatar_url || "https://i.pravatar.cc/40",
                  }}
                  style={styles.messageAvatar}
                />
              ) : null}
            </View>
          )}
          <TouchableOpacity
            activeOpacity={isOwn ? 1 : 0.7}
            onPress={() => handleMessagePress(item)}
            onLongPress={!isOwn ? () => handleBlockPrompt(item) : undefined}
            style={[
              styles.messageBubble,
              isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
              isSelected && !isOwn ? { backgroundColor: "#F5EEFC", borderColor: "#3D1A66", borderWidth: 1 } : null
            ]}
          >
            {!isOwn && showAvatar && (
              <CText style={styles.senderName}>{item.full_name}</CText>
            )}
            <CText
              style={[
                styles.messageText,
                isOwn ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {item.body}
            </CText>
            <View style={styles.messageFooter}>
              <CText
                style={[
                  styles.messageTime,
                  isOwn ? styles.ownMessageTime : styles.otherMessageTime,
                ]}
              >
                {formatTime(item.created_at)}
              </CText>
              {isOwn && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color="rgba(255,255,255,0.6)"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </TouchableOpacity>

          {isSelected && !isOwn && (
            <TouchableOpacity
              style={styles.reportIconWrapper}
              onPress={() => {
                setReportTarget({ id: item.id, name: item.body.substring(0, 50) + (item.body.length > 50 ? "..." : "") });
                setReportModalVisible(true);
                setSelectedMessageId(null);
              }}
            >
              <View style={styles.reportIconCircle}>
                <Ionicons name="flag" size={16} color="#FF4444" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
          <TouchableOpacity
            style={styles.headerContent}
            activeOpacity={0.8}
            onPress={() => {
              if (eventId) {
                router.push(`/home/event-details?id=${eventId}` as any);
              }
            }}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: avatar || "https://i.pravatar.cc/100" }}
                style={styles.headerAvatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.headerInfo}>
              <CText style={styles.headerName} numberOfLines={1}>
                {name || "Group Chat"}
              </CText>
              <CText style={styles.headerStatus}>
                {eventId ? "Tap to view event" : `${messages.length} messages`}
              </CText>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity> */}
        </LinearGradient>
      </SafeAreaView>

      {/* Messages */}
      <View style={styles.messagesArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIconWrapper}>
              <ActivityIndicator size="large" color="#3D1A66" />
            </View>
            <CText style={styles.loadingText}>Loading messages...</CText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="chatbubbles" size={40} color="#3D1A66" />
                </View>
                <CText style={styles.emptyTitle}>No messages yet</CText>
                <CText style={styles.emptyText}>
                  Start the conversation! Say hello 👋
                </CText>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        {isEventEnded ? (
          <View
            style={[
              styles.inputWrapper,
              styles.inputWrapperLocked,
              {
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            <View style={styles.lockedContainer}>
              <Ionicons name="lock-closed" size={18} color="#999" />
              <CText style={styles.lockedText}>This event has ended. Chat is now locked.</CText>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.inputWrapper,
              {
                paddingBottom:
                  keyboardHeight > 0 ? keyboardHeight + 60 : insets.bottom + 12,
              },
            ]}
          >
            {/* <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add-circle" size={28} color="#3D1A66" />
            </TouchableOpacity> */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={2000}
              />
              {/* <TouchableOpacity style={styles.emojiButton}>
                <Ionicons name="happy-outline" size={24} color="#999" />
              </TouchableOpacity> */}
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => {
          setReportModalVisible(false);
          setReportTarget(null);
        }}
        onSubmit={handleReportSubmit}
        targetName={reportTarget?.name}
        type="message"
      />
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
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  avatarWrapper: {
    position: "relative",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#5E35A0",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  headerStatus: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesArea: {
    flex: 1,
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
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D1A45",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(61, 26, 102, 0.1)",
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    backgroundColor: "#F5F0FA",
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 6,
    maxWidth: "85%",
  },
  ownMessageRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  otherMessageRow: {
    alignSelf: "flex-start",
  },
  avatarSpace: {
    width: 32,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: "100%",
  },
  ownMessageBubble: {
    backgroundColor: "#3D1A66",
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 6,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3D1A66",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  ownMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "#333",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: "rgba(255,255,255,0.6)",
  },
  otherMessageTime: {
    color: "#999",
  },
  reportIconWrapper: {
    justifyContent: "center",
    marginLeft: 8,
  },
  reportIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(61, 26, 102, 0.06)",
    gap: 8,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F0FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(61, 26, 102, 0.08)",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: "#2D2D2D",
    paddingVertical: 4,
  },
  emojiButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3D1A66",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: "#D0D0D0",
    shadowOpacity: 0,
    elevation: 0,
  },
  inputWrapperLocked: {
    backgroundColor: "#F0F0F0",
  },
  lockedContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  lockedText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
});
