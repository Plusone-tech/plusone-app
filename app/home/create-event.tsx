import EventDateTimePicker from "@/components/create-event/EventDateTimePicker";
import CText from "@/components/CText";
import ImagePickerModal from "@/components/ImagePickerModal";
import TextInputBubble from "@/components/TextInputBubble";
import { Ionicons } from "@expo/vector-icons";
// import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardTypeOptions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function CreateEvent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [locationNameError, setLocationNameError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  // const mapRef = useRef<MapView>(null);

  // Text Input Bubble state
  const [textBubble, setTextBubble] = useState<{
    visible: boolean;
    label: string;
    value: string;
    field: string;
    placeholder: string;
    multiline: boolean;
    keyboardType?: KeyboardTypeOptions;
  }>({
    visible: false,
    label: "",
    value: "",
    field: "",
    placeholder: "",
    multiline: false,
  });

  const openTextBubble = (
    field: string,
    label: string,
    value: string,
    placeholder: string,
    multiline = false,
    keyboardType?: KeyboardTypeOptions
  ) => {
    setTextBubble({ visible: true, label, value, field, placeholder, multiline, keyboardType });
  };

  const handleTextBubbleConfirm = (newValue: string) => {
    const { field } = textBubble;
    switch (field) {
      case "eventTitle": setEventTitle(newValue); break;
      case "eventDescription": setEventDescription(newValue); break;
      case "locationName": setLocationName(newValue); break;
      case "locationAddress": setLocationAddress(newValue); break;
      case "maxAttendees": setMaxAttendees(newValue); break;
      case "eventRules": setEventRules(newValue); break;
      case "ageRestriction": setAgeRestriction(newValue); break;
    }
    setTextBubble(prev => ({ ...prev, visible: false }));
  };

  // Event Basic Details
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Time & Date
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isRecurring, setIsRecurring] = useState(false);

  // Location
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  // Participation Details
  const [maxAttendees, setMaxAttendees] = useState("");
  const [entryType, setEntryType] = useState("open"); // open, invite-only, request
  // const [visibility, setVisibility] = useState("public"); // removed

  // Additional Details
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [eventRules, setEventRules] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  // const [genderFilter, setGenderFilter] = useState("all"); // removed

  // Get user's current location on mount
  // Removed map and geolocation logic

  const categories = [
    {
      id: "sports",
      name: "Sports",
      icon: "basketball-outline",
      color: "#FF6B6B",
    },
    {
      id: "music",
      name: "Music",
      icon: "musical-notes-outline",
      color: "#4ECDC4",
    },
    {
      id: "food",
      name: "Food & Drink",
      icon: "restaurant-outline",
      color: "#FFB84D",
    },
    {
      id: "networking",
      name: "Networking",
      icon: "people-outline",
      color: "#A78BFA",
    },
    { id: "study", name: "Study", icon: "book-outline", color: "#60A5FA" },
    {
      id: "arts",
      name: "Arts & Culture",
      icon: "color-palette-outline",
      color: "#F472B6",
    },
  ];

  const tagsByCategory: Record<string, { name: string; icon: string }[]> = {
    sports: [
      { name: "Football", icon: "football-outline" },
      { name: "Basketball", icon: "basketball-outline" },
      { name: "Tennis", icon: "tennisball-outline" },
      { name: "Badminton", icon: "tennisball-outline" },
      { name: "Pickleball", icon: "tennisball-outline" },
      { name: "Cycling", icon: "bicycle-outline" },
      { name: "Go-Karting", icon: "car-sport-outline" },
      { name: "Skateboarding", icon: "flash-outline" },
      { name: "Rock Climbing", icon: "trending-up-outline" },
      { name: "Squash", icon: "fitness-outline" },
      { name: "Bowling", icon: "ellipse-outline" },
      { name: "Gym Buddy", icon: "barbell-outline" },
      { name: "Marathon Running", icon: "walk-outline" },
      { name: "CrossFit", icon: "barbell-outline" },
      { name: "Hiking & Trekking", icon: "trail-sign-outline" },
      { name: "Arcade", icon: "game-controller-outline" },
    ],
    music: [
      { name: "Live Concerts", icon: "musical-notes-outline" },
      { name: "Karaoke Nights", icon: "mic-outline" },
      { name: "Open Mics/ Stand-up Comedy", icon: "mic-outline" },
      { name: "Festivals", icon: "sparkles-outline" },
      { name: "Nightclubs", icon: "disco-ball-outline" },
      { name: "Theatre & Plays", icon: "film-outline" },
      { name: "Dance Workshops", icon: "body-outline" },
    ],
    food: [
      { name: "Food & Drink", icon: "restaurant-outline" },
      { name: "Street Food", icon: "fast-food-outline" },
      { name: "Cafe Hopping", icon: "cafe-outline" },
      { name: "Fine Dining", icon: "wine-outline" },
      { name: "Bar Hopping", icon: "beer-outline" },
      { name: "Wine Tasting", icon: "wine-outline" },
      { name: "Dog/Cat Cafe", icon: "paw-outline" },
    ],
    networking: [
      { name: "Volunteering & Community Service", icon: "heart-outline" },
      { name: "Book Club", icon: "book-outline" },
      { name: "Backpacking", icon: "briefcase-outline" },
      { name: "Road Trips", icon: "car-outline" },
      { name: "Camping", icon: "bonfire-outline" },
      { name: "Beach", icon: "sunny-outline" },
      { name: "Pet Adoption & Rescue", icon: "paw-outline" },
    ],
    study: [
      { name: "Book Club", icon: "book-outline" },
      { name: "Video Games", icon: "game-controller-outline" },
      { name: "Esports Fan", icon: "trophy-outline" },
      { name: "Movie Buff", icon: "videocam-outline" },
    ],
    arts: [
      { name: "Painting & Sketching", icon: "brush-outline" },
      { name: "Photography Walks", icon: "camera-outline" },
      { name: "Pottery & Ceramics", icon: "color-palette-outline" },
      { name: "DIY Crafts", icon: "construct-outline" },
      { name: "Museum & Gallery Hopping", icon: "easel-outline" },
      { name: "Drag Shows", icon: "sparkles-outline" },
      { name: "Street Shopping", icon: "bag-outline" },
      { name: "High Fashion Runways", icon: "shirt-outline" },
      { name: "Sneakers", icon: "footsteps-outline" },
      { name: "Sustainable Fashion", icon: "leaf-outline" },
      { name: "Store Shopping", icon: "cart-outline" },
    ],
  };

  // Get tags based on selected category
  const getRelevantTags = (): { name: string; icon: string }[] => {
    if (!selectedCategory) return [];
    return tagsByCategory[selectedCategory] || [];
  };


  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handlePickCoverImage = () => {
    setShowImagePicker(true);
  };

  const handleImageConfirm = async (uri: string, mimeType: string) => {
    setShowImagePicker(false);
    setIsUploadingImage(true);
    try {
      const uploadResult = await api.uploads.uploadEventImage(uri, mimeType);
      setCoverImage(uploadResult.imageUrl);
    } catch (error: any) {
      console.error("Image upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Could not upload image. Please try again."
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const nextStep = () => {
    // Clear all errors first
    setTitleError(null);
    setDescriptionError(null);
    setCategoryError(null);
    setDateError(null);
    setLocationNameError(null);
    setAddressError(null);

    // Step 1: Event Basics validation
    if (currentStep === 1) {
      let hasError = false;
      if (eventTitle.trim().length < 3) {
        setTitleError("Event title must be at least 3 characters long.");
        hasError = true;
      }
      if (!eventDescription.trim()) {
        setDescriptionError("Please enter an event description.");
        hasError = true;
      }
      if (!selectedCategory) {
        setCategoryError("Please select a category.");
        hasError = true;
      }
      if (hasError) return;
    }

    // Step 2: Date & Time validation
    if (currentStep === 2) {
      if (endDate <= startDate) {
        setDateError("End date must be after start date.");
        return;
      }
    }

    // Step 3: Location validation
    if (currentStep === 3) {
      let hasError = false;
      if (!locationName.trim()) {
        setLocationNameError("Please enter a location name.");
        hasError = true;
      }
      if (!locationAddress.trim()) {
        setAddressError("Please enter an address.");
        hasError = true;
      }
      if (hasError) return;
    }

    // Step 4: Tags - optional, no validation needed

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    // Validate required fields
    if (!eventTitle.trim()) {
      Alert.alert("Missing Information", "Please enter an event title.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Missing Information", "Please select a category.");
      return;
    }
    if (!locationName.trim() || !locationAddress.trim()) {
      Alert.alert("Missing Information", "Please enter the event address.");
      return;
    }

    setIsPublishing(true);
    try {
      const eventData = {
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        cover_image: coverImage || undefined,
        category: selectedCategory,
        location: locationName.trim(),
        location_address: locationAddress || undefined,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        max_attendees: maxAttendees && parseInt(maxAttendees) > 0 ? parseInt(maxAttendees) : undefined,
        entry_type: entryType,
        rules: eventRules.trim() || undefined,
        age_restriction: ageRestriction || undefined,
      };

      console.log("========== PUBLISH EVENT DEBUG ==========");
      console.log("startDate raw:", startDate);
      console.log("startDate.toISOString():", startDate.toISOString());
      console.log("endDate raw:", endDate);
      console.log("endDate.toISOString():", endDate.toISOString());
      console.log("Full eventData:", JSON.stringify(eventData, null, 2));

      await api.events.create(eventData);
      Alert.alert(
        "Event Submitted!",
        "Your event is now under review by our team. Once approved, it will be visible to others.",
        [{ text: "OK", onPress: () => router.replace("/home" as any) }]
      );
    } catch (error: any) {
      console.error("========== PUBLISH EVENT ERROR ==========");
      console.error("Error message:", error?.message);
      console.error("Error status:", error?.status);
      console.error("Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      Alert.alert(
        "Error",
        error.message || "Failed to publish event. Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };



  return (
    <View style={styles.container}>
      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onConfirm={handleImageConfirm}
        aspectRatio={[16, 9]}
        title="Event Cover Image"
      />

      {/* Text Input Bubble */}
      <TextInputBubble
        visible={textBubble.visible}
        label={textBubble.label}
        value={textBubble.value}
        placeholder={textBubble.placeholder}
        multiline={textBubble.multiline}
        keyboardType={textBubble.keyboardType}
        onConfirm={handleTextBubbleConfirm}
        onCancel={() => setTextBubble(prev => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>Create Event</CText>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                currentStep >= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <CText style={styles.stepTitle}>Event Basics</CText>
            <CText style={styles.stepSubtitle}>Tell us about your event</CText>

            {/* Cover Image */}
            <TouchableOpacity
              style={styles.coverImagePicker}
              onPress={handlePickCoverImage}
              disabled={isUploadingImage}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#999" />
                  <CText style={styles.coverImageText}>Add Cover Image</CText>
                </View>
              )}
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <CText style={styles.uploadingText}>Uploading...</CText>
                </View>
              )}
            </TouchableOpacity>

            {/* Event Title */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Event Title *</CText>
              <TouchableOpacity
                style={styles.input}
                onPress={() => openTextBubble("eventTitle", "Event Title", eventTitle, "e.g., Sunday Football Match")}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: eventTitle ? "#333" : "#999" }}>
                  {eventTitle || "e.g., Sunday Football Match"}
                </CText>
              </TouchableOpacity>
              {titleError && (
                <CText style={{ color: "#FF4444", marginTop: 6, fontSize: 13 }}>
                  {titleError}
                </CText>
              )}
            </View>

            {/* Event Description */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Description *</CText>
              <TouchableOpacity
                style={[styles.input, styles.textArea]}
                onPress={() => openTextBubble("eventDescription", "Description", eventDescription, "Describe your event...", true)}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: eventDescription ? "#333" : "#999" }} numberOfLines={3}>
                  {eventDescription || "Describe your event..."}
                </CText>
              </TouchableOpacity>
              {descriptionError && (
                <CText style={{ color: "#FF4444", marginTop: 6, fontSize: 13 }}>
                  {descriptionError}
                </CText>
              )}
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Category *</CText>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id &&
                      styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={24}
                        color={category.color}
                      />
                    </View>
                    <CText style={styles.categoryName}>{category.name}</CText>
                  </TouchableOpacity>
                ))}
              </View>
              {categoryError && (
                <CText style={{ color: "#FF4444", marginTop: 6, fontSize: 13 }}>
                  {categoryError}
                </CText>
              )}
            </View>
          </View>
        )}

        {/* Step 2: Time & Date */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <CText style={styles.stepTitle}>When?</CText>
            <CText style={styles.stepSubtitle}>
              Set the date and time for your event
            </CText>

            <EventDateTimePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              dateError={dateError}
            />
          </View>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <CText style={styles.stepTitle}>Where?</CText>
            <CText style={styles.stepSubtitle}>
              Enter the event location details
            </CText>

            {/* Location Name Input */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Location Name *</CText>
              <TouchableOpacity
                style={styles.input}
                onPress={() => openTextBubble("locationName", "Location Name", locationName, "e.g., Central Park, Cafe Coffee Day")}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: locationName ? "#333" : "#999" }}>
                  {locationName || "e.g., Central Park, Cafe Coffee Day"}
                </CText>
              </TouchableOpacity>
              {locationNameError && (
                <CText style={{ color: "#FF4444", marginTop: 6, fontSize: 13 }}>
                  {locationNameError}
                </CText>
              )}
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Address *</CText>
              <TouchableOpacity
                style={styles.input}
                onPress={() => openTextBubble("locationAddress", "Address", locationAddress, "e.g., 123 Main St, New Delhi")}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: locationAddress ? "#333" : "#999" }}>
                  {locationAddress || "e.g., 123 Main St, New Delhi"}
                </CText>
              </TouchableOpacity>
              {addressError && (
                <CText style={{ color: "#FF4444", marginTop: 6, fontSize: 13 }}>
                  {addressError}
                </CText>
              )}
            </View>
          </View>
        )}

        {/* Step 4: Tags */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            {/* Tags Section */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Tags</CText>
              <View style={styles.tagsContainer}>
                {getRelevantTags().map((tag) => (
                  <TouchableOpacity
                    key={tag.name}
                    style={[
                      styles.tagChip,
                      selectedTags.includes(tag.name) && styles.tagChipActive,
                    ]}
                    onPress={() => toggleTag(tag.name)}
                  >
                    <Ionicons
                      name={tag.icon as any}
                      size={16}
                      color={selectedTags.includes(tag.name) ? "#fff" : "#666"}
                    />
                    <CText
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag.name) && styles.tagTextActive,
                      ]}
                    >
                      {tag.name}
                    </CText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 5: Participation & Publish */}
        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <CText style={styles.stepTitle}>Final Details</CText>
            <CText style={styles.stepSubtitle}>
              Set participation rules and publish
            </CText>

            {/* Max Attendees */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Maximum Attendees</CText>
              <TouchableOpacity
                style={styles.input}
                onPress={() => openTextBubble("maxAttendees", "Maximum Attendees", maxAttendees, "e.g., 20 (Leave empty for unlimited)", false, "number-pad")}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: maxAttendees ? "#333" : "#999" }}>
                  {maxAttendees || "e.g., 20 (Leave empty for unlimited)"}
                </CText>
              </TouchableOpacity>
            </View>

            {/* Entry Type */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Entry Type *</CText>
              <View style={styles.optionGroup}>
                {[
                  { id: "open", label: "Open to All", icon: "globe-outline", disabled: false },
                  {
                    id: "request",
                    label: "Request to Join (Coming Soon)",
                    icon: "hand-right-outline",
                    disabled: true,
                  },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      entryType === option.id && styles.optionButtonActive,
                      option.disabled && { opacity: 0.5, backgroundColor: "#E8E8E8" },
                    ]}
                    onPress={() => !option.disabled && setEntryType(option.id)}
                    activeOpacity={option.disabled ? 1 : 0.7}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={option.disabled ? "#999" : (entryType === option.id ? "#3D1A66" : "#666")}
                    />
                    <CText
                      style={[
                        styles.optionText,
                        entryType === option.id && styles.optionTextActive,
                        option.disabled && { color: "#999" },
                      ]}
                    >
                      {option.label}
                    </CText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags moved to Step 3 */}

            {/* Event Rules */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Event Rules (Optional)</CText>
              <TouchableOpacity
                style={[styles.input, styles.textArea]}
                onPress={() => openTextBubble("eventRules", "Event Rules", eventRules, "Any specific rules for participants...", true)}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: eventRules ? "#333" : "#999" }} numberOfLines={3}>
                  {eventRules || "Any specific rules for participants..."}
                </CText>
              </TouchableOpacity>
            </View>

            {/* Age Restriction */}
            <View style={styles.inputGroup}>
              <CText style={styles.label}>Age Restriction (Optional)</CText>
              <TouchableOpacity
                style={styles.input}
                onPress={() => openTextBubble("ageRestriction", "Age Restriction", ageRestriction, "e.g., 18+")}
                activeOpacity={0.7}
              >
                <CText style={{ fontSize: 16, color: ageRestriction ? "#333" : "#999" }}>
                  {ageRestriction || "e.g., 18+"}
                </CText>
              </TouchableOpacity>
            </View>

            {/* Gender Filter removed */}
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Navigation Buttons */}
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButtonFooter}
              onPress={prevStep}
            >
              <Ionicons name="arrow-back" size={20} color="#3D1A66" />
              <CText style={styles.backButtonText}>Back</CText>
            </TouchableOpacity>
          )}

          {currentStep < 5 ? (
            <TouchableOpacity
              style={[styles.nextButton, currentStep === 1 && { flex: 1 }]}
              onPress={nextStep}
            >
              <CText style={styles.nextButtonText}>Continue</CText>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.publishButton,
                currentStep === 1 && { flex: 1 },
                isPublishing && styles.publishButtonDisabled,
              ]}
              onPress={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark-circle" size={20} color="white" />
              )}
              <CText style={styles.publishButtonText}>
                {isPublishing ? "Publishing..." : "Publish Event"}
              </CText>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  header: {
    backgroundColor: "#340074",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
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
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  progressDot: {
    width: 50,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingTop: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3D1A66",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  coverImagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  coverImageText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  categoryCard: {
    width: "31%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  categoryCardActive: {
    borderColor: "#3D1A66",
    backgroundColor: "#E8D5FF",
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#3D1A66",
    borderColor: "#3D1A66",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  recurringOptions: {
    marginTop: 20,
  },
  recurringButtons: {
    flexDirection: "row",
    gap: 10,
  },
  recurringButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  recurringButtonText: {
    fontSize: 14,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    gap: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  toggleButtonActive: {
    borderColor: "#3D1A66",
    backgroundColor: "#E8D5FF",
  },
  toggleText: {
    fontSize: 16,
    color: "#666",
  },
  toggleTextActive: {
    color: "#3D1A66",
    fontWeight: "600",
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInputField: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  mapText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  mapSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  mapPreviewContainer: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  mapPreview: {
    width: "100%",
    height: "100%",
  },
  mapEditOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#3D1A66",
    borderRadius: 20,
    padding: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F4FF",
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  mapModalCloseButton: {
    padding: 8,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mapModalConfirmButton: {
    padding: 8,
  },
  mapModalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D1A66",
  },
  mapSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    margin: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  fullMap: {
    flex: 1,
  },
  currentLocationButton: {
    position: "absolute",
    right: 16,
    bottom: 100,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedAddressBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  selectedAddressText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  selectedAddressHint: {
    flex: 1,
    fontSize: 14,
    color: "#999",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8D5FF",
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#3D1A66",
  },
  optionGroup: {
    gap: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    gap: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  optionButtonActive: {
    borderColor: "#3D1A66",
    backgroundColor: "#E8D5FF",
  },
  optionText: {
    fontSize: 16,
    color: "#666",
  },
  optionTextActive: {
    color: "#3D1A66",
    fontWeight: "600",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  priceInputField: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tagChipActive: {
    backgroundColor: "#3D1A66",
    borderColor: "#3D1A66",
  },
  tagText: {
    fontSize: 14,
    color: "#666",
  },
  tagTextActive: {
    color: "white",
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  backButtonFooter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8D5FF",
    borderRadius: 15,
    padding: 18,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D1A66",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3D1A66",
    borderRadius: 15,
    padding: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  publishButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00AA00",
    borderRadius: 15,
    padding: 18,
    gap: 8,
  },
  publishButtonDisabled: {
    backgroundColor: "#88CC88",
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
