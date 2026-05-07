import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JoinSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const type = params.type; // "joined" or "request"
  const eventTitle = params.eventTitle;
  const conversationId = params.conversationId;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleJoinChat = () => {
    router.push({
      pathname: "/home/chat-detail",
      params: {
        conversationId: conversationId,
        name: eventTitle,
        avatar: "https://plusone-app.s3.ap-south-1.amazonaws.com/placeholder/placeholder.jpg",
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#3D1A66", "#5E35A0", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.content}>
          {/* Success Icon with Animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons
                  name={type === "joined" ? "checkmark" : "hourglass-outline"}
                  size={60}
                  color="#3D1A66"
                />
              </View>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <CText style={styles.title}>
              {type === "joined" ? "You're In! 🎉" : "Request Sent! ⏳"}
            </CText>

            <CText style={styles.eventName}>"{eventTitle}"</CText>

            <CText style={styles.message}>
              {type === "joined"
                ? "Get ready for an amazing experience! Connect with other attendees and stay updated."
                : "The host will review your request within 24 hours. We'll notify you once they respond."}
            </CText>
          </Animated.View>

          {/* Info Cards */}
          {/* <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
            {type === "joined" ? (
              <>
                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <Ionicons name="chatbubbles" size={22} color="#3D1A66" />
                  </View>
                  <View style={styles.infoContent}>
                    <CText style={styles.infoTitle}>Group Chat Ready</CText>
                    <CText style={styles.infoText}>
                      Connect with other attendees now
                    </CText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <Ionicons name="notifications" size={22} color="#3D1A66" />
                  </View>
                  <View style={styles.infoContent}>
                    <CText style={styles.infoTitle}>Reminders On</CText>
                    <CText style={styles.infoText}>
                      You'll be notified before the event
                    </CText>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <Ionicons name="calendar" size={22} color="#3D1A66" />
                  </View>
                  <View style={styles.infoContent}>
                    <CText style={styles.infoTitle}>Added to Calendar</CText>
                    <CText style={styles.infoText}>
                      Find it in your My Events section
                    </CText>
                  </View>
                </View> 
              </>
            ) : (
              <>
                <View style={styles.infoCard}>
                  <View style={[styles.infoIconWrapper, { backgroundColor: "#FFF3E0" }]}>
                    <Ionicons name="time" size={22} color="#F57C00" />
                  </View>
                  <View style={styles.infoContent}>
                    <CText style={styles.infoTitle}>Pending Approval</CText>
                    <CText style={styles.infoText}>
                      Usually responds within 24 hours
                    </CText>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <Ionicons name="notifications" size={22} color="#3D1A66" />
                  </View>
                  <View style={styles.infoContent}>
                    <CText style={styles.infoTitle}>Get Notified</CText>
                    <CText style={styles.infoText}>
                      We'll alert you when they respond
                    </CText>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconWrapper}>
                    <Ionicons name="compass" size={22} color="#3D1A66" />
                  </View>
                  <View style={styles.infoContent}>
                    <CText style={styles.infoTitle}>Keep Exploring</CText>
                    <CText style={styles.infoText}>
                      Discover more events you'll love
                    </CText>
                  </View>
                </View>
              </>
            )}
          </Animated.View> */}
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          {type === "joined" && conversationId && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleJoinChat}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles" size={22} color="#3D1A66" />
              <CText style={styles.primaryButtonText}>Join Group Chat</CText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              type !== "joined" && styles.secondaryButtonPrimary,
            ]}
            onPress={() => router.replace("/home")}
            activeOpacity={0.8}
          >
            <CText
              style={[
                styles.secondaryButtonText,
                type !== "joined" && styles.secondaryButtonTextPrimary,
              ]}
            >
              {type === "joined" ? "Back to Explore" : "Explore More Events"}
            </CText>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  cardsContainer: {
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0E6FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D1A45",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3D1A66",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryButtonPrimary: {
    backgroundColor: "white",
    borderColor: "white",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
  secondaryButtonTextPrimary: {
    color: "#3D1A66",
  },
});
