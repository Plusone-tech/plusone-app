import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../lib/api";

const INTERESTS = [
  { id: "coffee", label: "Coffee Chats", icon: "cafe" },
  { id: "hiking", label: "Hiking", icon: "walk" },
  { id: "music", label: "Live Music", icon: "musical-notes" },
  { id: "movies", label: "Movies", icon: "film" },
  { id: "gaming", label: "Gaming", icon: "game-controller" },
  { id: "fitness", label: "Fitness", icon: "fitness" },
  { id: "art", label: "Art & Museums", icon: "color-palette" },
  { id: "food", label: "Food & Dining", icon: "restaurant" },
  { id: "travel", label: "Travel", icon: "airplane" },
  { id: "photography", label: "Photography", icon: "camera" },
  { id: "reading", label: "Book Clubs", icon: "book" },
  { id: "sports", label: "Sports", icon: "football" },
  { id: "yoga", label: "Yoga & Wellness", icon: "leaf" },
  { id: "nightlife", label: "Nightlife", icon: "moon" },
  { id: "networking", label: "Networking", icon: "people" },
  { id: "outdoor", label: "Outdoor Adventures", icon: "compass" },
  { id: "cooking", label: "Cooking", icon: "flame" },
  { id: "dancing", label: "Dancing", icon: "disc" },
  { id: "tech", label: "Tech & Startups", icon: "rocket" },
  { id: "volunteering", label: "Volunteering", icon: "heart" },
];

const MIN_SELECTIONS = 5;
const MAX_SELECTIONS = 8;

export default function InterestsSetup() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= MAX_SELECTIONS) {
        Alert.alert(
          "Maximum Reached",
          `You can select up to ${MAX_SELECTIONS} interests.`
        );
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleContinue = async () => {
    if (selectedInterests.length < MIN_SELECTIONS) {
      Alert.alert("Select More Interests", `Please select at least ${MIN_SELECTIONS} interests.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.profile.updateInterests(selectedInterests);

      router.replace("/home" as any);
    } catch (err: any) {
      console.error("Interests setup error:", err);
      // Still navigate to home even if saving fails (interests are optional)
      router.replace("/home" as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace("/home" as any);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/grid-fill-warp.svg")}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.7 }}
        contentFit="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#000" />
        </TouchableOpacity>
        <CText weight="medium" fontSize={38}>
          Your Interests
        </CText>
        <CText style={styles.subtitle}>
          Select {MIN_SELECTIONS} to {MAX_SELECTIONS} interests to personalize your experience
        </CText>
      </View>

      <View style={styles.whiteViewContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Selection Counter */}
          <View style={styles.counterContainer}>
            <CText style={styles.counterText}>
              {selectedInterests.length} of {MIN_SELECTIONS}-{MAX_SELECTIONS} selected
            </CText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(selectedInterests.length / MAX_SELECTIONS) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Interests Grid */}
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={interest.icon as any}
                    size={20}
                    color={isSelected ? "#fff" : "#3D1A66"}
                  />
                  <CText
                    style={[
                      styles.interestLabel,
                      isSelected && styles.interestLabelSelected,
                    ]}
                  >
                    {interest.label}
                  </CText>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 20 }} />

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedInterests.length < MIN_SELECTIONS && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={isSubmitting || selectedInterests.length < MIN_SELECTIONS}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#3D1A66" />
            ) : (
              <CText
                weight="medium"
                style={{
                  color: selectedInterests.length < MIN_SELECTIONS ? "#A2A2A2" : "#000",
                }}
              >
                Continue
              </CText>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          {/* <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <CText style={styles.skipText}>Skip for now</CText>
          </TouchableOpacity> */}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  header: {
    marginLeft: 35,
    marginRight: 35,
    marginBottom: 15,
    gap: 10,
  },
  backButton: {
    backgroundColor: "#fff",
    borderRadius: 9999,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -5,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  whiteViewContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 25,
  },
  counterContainer: {
    marginBottom: 20,
  },
  counterText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3D1A66",
    borderRadius: 3,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F0FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#E8D5FF",
    gap: 8,
  },
  interestChipSelected: {
    backgroundColor: "#3D1A66",
    borderColor: "#3D1A66",
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3D1A66",
  },
  interestLabelSelected: {
    color: "#fff",
  },
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: "black",
    marginTop: 10,
  },
  continueButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#D1D1D1",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  skipText: {
    fontSize: 15,
    color: "#666",
  },
});
