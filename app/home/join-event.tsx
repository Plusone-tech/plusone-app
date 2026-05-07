import AvailabilitySpots from "@/components/common/AvailabilitySpots";
import EntryTypeBadge from "@/components/common/EntryTypeBadge";
import EventPreviewCard from "@/components/common/EventPreviewCard";
import TicketSelector from "@/components/common/TicketSelector";
import CText from "@/components/CText";
import EventRules from "@/components/event-details/EventRules";
import TextInputBubble from "@/components/TextInputBubble";
import type { EntryType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface EventData {
  id: string;
  title: string;
  imageUri: string;
  entryType: EntryType;
  price: string;
  maxAttendees: number | null;
  currentAttendees: number;
  host: {
    name: string;
    avatar: string;
  };
  rules: string[];
}

export default function JoinEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [agreeToRules, setAgreeToRules] = useState(false);
  const [joining, setJoining] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageBubbleVisible, setMessageBubbleVisible] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.events.detail(String(params.id));
        const e = data.event;
        const attendees = data.attendees || [];

        // Parse rules if stored as string
        let rules: string[] = [];
        if (e.rules) {
          try {
            rules = typeof e.rules === "string" ? JSON.parse(e.rules) : e.rules;
          } catch {
            rules = e.rules.split("\n").filter((r: string) => r.trim());
          }
        }
        if (rules.length === 0) {
          rules = ["Be respectful to all attendees"];
        }

        setEvent({
          id: e.id,
          title: e.title,
          imageUri:
            e.cover_image ||
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
          entryType: (e.entry_type as EntryType) || "open",
          price: "Free", // For now, all events are free
          maxAttendees: e.max_attendees,
          currentAttendees: attendees.length,
          host: {
            name: e.host_name || "Host",
            avatar: e.host_avatar || "https://i.pravatar.cc/100",
          },
          rules,
        });
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  const priceValue =
    event?.price !== "Free"
      ? parseInt(event?.price.replace(/\D/g, "") || "0")
      : 0;

  const handleJoin = async () => {
    if (!event) return;

    if (!agreeToRules) {
      Alert.alert("Agreement Required", "Please agree to the event rules");
      return;
    }

    setJoining(true);
    try {
      const result = await api.events.join(event.id);
      console.log("Join result:", result);

      if (event.entryType === "request") {
        router.push({
          pathname: "/home/join-success",
          params: {
            type: "request",
            eventTitle: event.title,
            conversationId: result.conversationId,
          },
        } as any);
      } else {
        router.push({
          pathname: "/home/join-success",
          params: {
            type: "joined",
            eventTitle: event.title,
            conversationId: result.conversationId,
          },
        } as any);
      }
    } catch (err: any) {
      console.error("Failed to join event:", err);
      Alert.alert("Error", err.message || "Failed to join event. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#3D1A66" />
        <CText style={styles.loadingText}>Loading event...</CText>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
          <CText style={styles.headerTitle}>Join Event</CText>
          <View style={styles.headerSpacer} />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <CText style={styles.errorText}>Event not found</CText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Text Input Bubble for Message */}
      <TextInputBubble
        visible={messageBubbleVisible}
        label="Message to Host"
        value={message}
        placeholder="Introduce yourself and tell the host why you'd like to join..."
        multiline
        onConfirm={(val) => { setMessage(val); setMessageBubbleVisible(false); }}
        onCancel={() => setMessageBubbleVisible(false)}
      />

      {/* Gradient Header */}
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
          <CText style={styles.headerTitle}>Join Event</CText>
          <View style={styles.headerSpacer} />
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Preview Card */}
        <View style={styles.sectionCard}>
          <EventPreviewCard
            title={event.title}
            imageUri={event.imageUri}
            hostName={event.host.name}
            hostAvatar={event.host.avatar}
          />
        </View>

        {/* Entry Type & Availability Row */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="key-outline" size={18} color="#3D1A66" />
              <CText style={styles.infoCardLabel}>Entry Type</CText>
            </View>
            <EntryTypeBadge type={event.entryType} />
          </View>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="people-outline" size={18} color="#3D1A66" />
              <CText style={styles.infoCardLabel}>Availability</CText>
            </View>
            <AvailabilitySpots
              current={event.currentAttendees}
              max={event.maxAttendees}
            />
          </View>
        </View>

        {/* Ticket Selection (if paid) */}
        {event.price !== "Free" && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ticket-outline" size={20} color="#3D1A66" />
              <CText style={styles.sectionTitle}>Select Tickets</CText>
            </View>
            <TicketSelector
              selected={selectedTickets}
              max={(event.maxAttendees ?? 100) - event.currentAttendees}
              pricePerTicket={priceValue}
              onIncrement={() => setSelectedTickets(selectedTickets + 1)}
              onDecrement={() => setSelectedTickets(selectedTickets - 1)}
            />
          </View>
        )}

        {/* Message to Host (for request type) */}
        {event.entryType === "request" && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-outline" size={20} color="#3D1A66" />
              <CText style={styles.sectionTitle}>
                Message to Host
                <CText style={styles.optional}> (Optional)</CText>
              </CText>
            </View>
            <TouchableOpacity
              style={styles.messageInput}
              onPress={() => setMessageBubbleVisible(true)}
              activeOpacity={0.7}
            >
              <CText style={{ fontSize: 15, color: message ? "#333" : "#999", minHeight: 80 }} numberOfLines={4}>
                {message || "Introduce yourself and tell the host why you'd like to join..."}
              </CText>
            </TouchableOpacity>
            <View style={styles.hintContainer}>
              <Ionicons name="bulb-outline" size={16} color="#F9A825" />
              <CText style={styles.messageHint}>
                A personalized message increases your chances of approval
              </CText>
            </View>
          </View>
        )}

        {/* Event Rules */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#3D1A66" />
            <CText style={styles.sectionTitle}>Event Rules</CText>
          </View>
          <EventRules
            rules={event.rules}
            showAgreement
            agreed={agreeToRules}
            onAgreeToggle={() => setAgreeToRules(!agreeToRules)}
          />
        </View>

        {/* Payment Info (if paid) */}
        {event.price !== "Free" && (
          <View style={styles.paymentInfo}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <CText style={styles.paymentText}>
              Secure payment processing. Refund available up to 24 hours before
              event.
            </CText>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomAction}>
        <View style={styles.priceInfo}>
          <View>
            <CText style={styles.bottomPriceLabel}>
              {event.price === "Free" ? "Entry Fee" : "Total Amount"}
            </CText>
            <CText style={styles.bottomPrice}>
              {event.price === "Free"
                ? "Free"
                : `₹${priceValue * selectedTickets}`}
            </CText>
          </View>
          <View style={styles.joinButtonContainer}>
            <TouchableOpacity
              onPress={handleJoin}
              style={[
                styles.joinButton,
                (!agreeToRules || joining) && styles.disabledButton,
              ]}
              disabled={!agreeToRules || joining}
              activeOpacity={0.8}
            >
              {joining ? (
                <View style={styles.joiningContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <CText style={styles.buttonText}>Joining...</CText>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons
                    name={
                      event.entryType === "request"
                        ? "paper-plane"
                        : "checkmark-circle"
                    }
                    size={20}
                    color="#fff"
                  />
                  <CText style={styles.buttonText}>
                    {event.entryType === "request"
                      ? "Send Request"
                      : event.price === "Free"
                      ? "Join Event"
                      : "Proceed to Pay"}
                  </CText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0FA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F0FA",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#3D1A66",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E6FA",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2D1A45",
  },
  optional: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999",
  },
  messageInput: {
    backgroundColor: "#F8F6FA",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#333",
    minHeight: 120,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(61, 26, 102, 0.1)",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFDE7",
    padding: 12,
    borderRadius: 12,
  },
  messageHint: {
    flex: 1,
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 18,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E8F5E9",
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  paymentText: {
    flex: 1,
    fontSize: 13,
    color: "#2E7D32",
    lineHeight: 18,
  },
  bottomAction: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomPriceLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3D1A66",
  },
  joinButtonContainer: {
    flex: 1,
    marginLeft: 20,
  },
  joinButton: {
    backgroundColor: "#3D1A66",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  joiningContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
