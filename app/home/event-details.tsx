import TagsList from "@/components/common/TagsList";
import CText from "@/components/CText";
import AttendeesList from "@/components/event-details/AttendeesList";
import EventHeaderImage from "@/components/event-details/EventHeaderImage";
import EventInfoCard from "@/components/event-details/EventInfoCard";
import EventRules from "@/components/event-details/EventRules";
import HostCard from "@/components/event-details/HostCard";
import type { Event } from "@/types";
import { Ionicons } from "@expo/vector-icons";
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

export default function EventDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string>("pending");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.events.detail(String(params.id));
        const e = data.event;
        const attendees = data.attendees || [];

        // Format date and time from start_time/end_time
        const startDate = new Date(e.start_time);
        const endDate = new Date(e.end_time);

        const startDateStr = startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const endDateStr = endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const startTimeStr = startDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        const endTimeStr = endDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        // Show both dates if they differ, otherwise just show one
        const dateStr = startDateStr === endDateStr
          ? startDateStr
          : `${startDateStr} - ${endDateStr}`;

        // Combined date + time strings
        const startDateTimeStr = `${startDateStr}, ${startTimeStr}`;
        const endDateTimeStr = `${endDateStr}, ${endTimeStr}`;

        const timeStr = `${startTimeStr} - ${endTimeStr}`;

        // Parse rules if stored as string
        let rules: string[] = [];
        if (e.rules) {
          try {
            rules = typeof e.rules === "string" ? JSON.parse(e.rules) : e.rules;
          } catch {
            rules = e.rules.split("\n").filter((r: string) => r.trim());
          }
        }

        // Parse tags
        let tags: string[] = [];
        if (e.tags) {
          tags = Array.isArray(e.tags) ? e.tags : [];
        }

        // Get current user once
        const meResp = await api.me();
        const me = meResp?.user;

        setEvent({
          id: e.id,
          title: e.title,
          imageUri:
            e.cover_image ||
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
          description: e.description || "",
          date: dateStr,
          startDate: startDateTimeStr,
          endDate: endDateTimeStr,
          time: timeStr,
          category: e.category || "Event",
          attendees: {
            count: attendees.length,
            avatars: attendees
              .slice(0, 5)
              .map((a: any) => a.avatar_url || "https://i.pravatar.cc/40"),
          },
          location: {
            name: e.location || "Location TBD",
            address: e.location_address || "",
            distance: "",
          },
          host: {
            name: e.host_name || "Host",
            avatar: e.host_avatar || "https://i.pravatar.cc/100",
            eventsHosted: e.host_events_count || 0,
          },
          price: "Free",
          tags,
          rules: rules.length > 0 ? rules : ["Be respectful to all attendees"],
          entryType: e.entry_type || "open",
          maxAttendees: e.max_attendees,
          currentAttendees: attendees.length,
        });
        // Check if user has joined (assume API returns attendees as array of user objects with id)
        const joined = attendees.some(
          (a: any) => a.id && me?.id && String(a.id) === String(me.id)
        );
        setHasJoined(joined);

        // Check if current user is host
        const isUserHost = Boolean(
          me?.id && e.host_id && String(me.id) === String(e.host_id)
        );
        setIsHost(isUserHost);
        setApprovalStatus(e.approval_status || "pending");
        setRejectionReason(e.rejection_reason || null);
        // Debug log
        console.log(
          "me.id",
          me?.id,
          "e.host_id",
          e.host_id,
          "isHost",
          isUserHost
        );
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [params.id]);
  const handleDeleteEvent = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      await api.events.delete(event.id);
      router.replace("/home");
    } catch (err: any) {
      Alert.alert("Error", "Failed to delete event. " + (err?.message || ""));
    } finally {
      setDeleting(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!event) return;
    console.log("Joining event:", event.id);
    await router.push({
      pathname: "/home/join-event",
      params: {
        id: event.id,
        entryType: event.entryType,
        price: event.price,
      },
    } as any);
    // After join, refetch event to update hasJoined
    setLoading(true);
    try {
      const data = await api.events.detail(String(event.id));
      const attendees = data.attendees || [];
      const meResp = await api.me();
      const me = meResp?.user;
      const joined = attendees.some(
        (a: any) => a.id && me?.id && String(a.id) === String(me.id)
      );
      setHasJoined(joined);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    router.push("/home/chat" as any);
  };

  const handleLeaveEvent = async () => {
    if (!event || leaving) return;
    setLeaving(true);
    try {
      await api.events.leave(event.id);
      setHasJoined(false);
      Alert.alert("Success", "You have left the event.");
    } catch (err: any) {
      Alert.alert("Error", "Failed to leave event. " + (err?.message || ""));
    } finally {
      setLeaving(false);
    }
  };

  const handleShare = () => {
    console.log("Share event");
  };

  const handleBookmark = async () => {
    if (!event || bookmarking) return;

    const wasBookmarked = event.isBookmarked;

    // Optimistic update - update UI immediately
    setEvent({ ...event, isBookmarked: !wasBookmarked });
    setBookmarking(true);

    try {
      if (wasBookmarked) {
        await api.bookmarks.remove(event.id);
      } else {
        await api.bookmarks.add(event.id);
      }
    } catch (err: any) {
      // Revert on error
      setEvent({ ...event, isBookmarked: wasBookmarked });
      Alert.alert("Error", "Failed to update bookmark. " + (err?.message || ""));
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#3D1A66" />
      </View>
    );
  }

  if (!event) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <CText style={{ fontSize: 18, color: "#666" }}>Event not found</CText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <CText style={{ color: "#3D1A66", fontSize: 16 }}>Go Back</CText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <EventHeaderImage
        imageUri={event.imageUri}
        price={event.price}
        onBack={() => router.back()}
        onBookmark={handleBookmark}
        isBookmarked={event.isBookmarked}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title & Category */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <CText style={styles.title}>{event.title}</CText>
            {isHost && approvalStatus !== "approved" && (
              <TouchableOpacity
                style={styles.deleteIconButton}
                onPress={handleDeleteEvent}
                disabled={deleting}
                accessibilityLabel="Delete Event"
              >
                <Ionicons name="trash" size={22} color="#D7263D" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag-outline" size={16} color="#3D1A66" />
            <CText style={styles.categoryText}>{event.category}</CText>
          </View>
        </View>

        {/* Date, Time & Location Info */}
        <View style={[styles.section, styles.infoCard]}>
          <EventInfoCard
            icon="calendar-outline"
            label="Start"
            value={event.startDate || event.date}
          />
          <EventInfoCard
            icon="calendar-outline"
            label="End"
            value={event.endDate || event.date}
          />
          <EventInfoCard
            icon="location-outline"
            label="Location"
            value={event.location.name}
            subtext={event.location.distance ? `${event.location.distance} away` : undefined}
          />
        </View>

        {/* Attendees */}
        <View style={styles.section}>
          <AttendeesList
            count={event.attendees.count}
            avatars={event.attendees.avatars}
            onSeeAll={() => router.push({
              pathname: "/home/event-attendees",
              params: { eventId: event.id, eventTitle: event.title }
            } as any)}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <CText style={styles.sectionTitle}>About Event</CText>
          <CText style={styles.description}>{event.description}</CText>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <TagsList tags={event.tags} />
        </View>

        {/* Host */}
        <View style={styles.section}>
          <HostCard
            name={event.host.name}
            avatar={event.host.avatar}
            eventsHosted={event.host.eventsHosted}
          />
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <EventRules rules={event.rules} />
        </View>

        {/* Rejection Reason - Only show for host when event is rejected */}
        {isHost && approvalStatus === "rejected" && rejectionReason && (
          <View style={styles.rejectionCard}>
            <View style={styles.rejectionIconContainer}>
              <Ionicons name="close-circle" size={32} color="#D7263D" />
            </View>
            <CText style={styles.rejectionTitle}>Your event was not approved</CText>
            <CText style={styles.rejectionSubtitle}>Our team has reviewed your event and found the following issue:</CText>
            <View style={styles.rejectionReasonBox}>
              <CText style={styles.rejectionReasonText}>{rejectionReason}</CText>
            </View>
            <CText style={styles.rejectionHelpText}>
              You can delete this event and create a new one with the suggested changes.
            </CText>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomActions}>
        {isHost ? (
          // Host view
          approvalStatus === "approved" ? (
            // Approved event - show Chat and Delete
            <>
              <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
                <Ionicons name="chatbubbles" size={22} color="#3D1A66" />
                <CText style={styles.chatButtonText}>Chat</CText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleDeleteEvent}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={22} color="#D7263D" />
                    <CText style={styles.leaveButtonText}>Delete Event</CText>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Pending or rejected - show status
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                approvalStatus === "rejected" ? styles.statusRejected : styles.statusPending
              ]}>
                <Ionicons
                  name={approvalStatus === "rejected" ? "close-circle" : "time-outline"}
                  size={20}
                  color={approvalStatus === "rejected" ? "#D7263D" : "#F5A623"}
                />
                <CText style={[
                  styles.statusText,
                  approvalStatus === "rejected" ? styles.statusTextRejected : styles.statusTextPending
                ]}>
                  {approvalStatus === "rejected" ? "Event Rejected" : "Pending Approval"}
                </CText>
              </View>
              {approvalStatus === "pending" && (
                <CText style={styles.statusSubtext}>
                  Your event is being reviewed by our team
                </CText>
              )}
            </View>
          )
        ) : hasJoined ? (
          // Non-host who has joined - show Chat and Leave
          <>
            <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
              <Ionicons name="chatbubbles" size={22} color="#3D1A66" />
              <CText style={styles.chatButtonText}>Chat</CText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={handleLeaveEvent}
              disabled={leaving}
            >
              {leaving ? (
                <ActivityIndicator size="small" color="#D7263D" />
              ) : (
                <>
                  <Ionicons name="exit-outline" size={22} color="#D7263D" />
                  <CText style={styles.leaveButtonText}>Leave</CText>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          // Non-host who hasn't joined - show Join
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
            <Ionicons name="add-circle" size={24} color="white" />
            <CText style={styles.joinButtonText}>Join Event</CText>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  deleteIconButton: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D7263D",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  section: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8D5FF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    color: "#3D1A66",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    gap: 12,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8D5FF",
    paddingVertical: 16,
    borderRadius: 15,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D1A66",
  },
  joinButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3D1A66",
    paddingVertical: 16,
    borderRadius: 15,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  leaveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F0",
    paddingVertical: 16,
    borderRadius: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: "#D7263D",
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D7263D",
  },
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 15,
    gap: 10,
  },
  statusPending: {
    backgroundColor: "#FFF8E6",
    borderWidth: 1,
    borderColor: "#F5A623",
  },
  statusRejected: {
    backgroundColor: "#FFEEEE",
    borderWidth: 1,
    borderColor: "#D7263D",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusTextPending: {
    color: "#F5A623",
  },
  statusTextRejected: {
    color: "#D7263D",
  },
  statusSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: "#888",
  },
  rejectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 0,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#D7263D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  rejectionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFEEEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  rejectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  rejectionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  rejectionReasonBox: {
    backgroundColor: "#FFF8F8",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: "#D7263D",
    marginBottom: 16,
  },
  rejectionReasonText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    fontStyle: "italic",
  },
  rejectionHelpText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
});
