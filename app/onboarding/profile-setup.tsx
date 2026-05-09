import CText from "@/components/CText";
import CustomDatePicker from "@/components/CustomDatePicker";
import ImagePickerModal from "@/components/ImagePickerModal";
import TextInputBubble from "@/components/TextInputBubble";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../lib/api";

export default function ProfileSetup() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(
    null,
  );
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [nameBubbleVisible, setNameBubbleVisible] = useState(false);
  const [agreedToLegal, setAgreedToLegal] = useState(false);

  // Autofill flags
  const isNameAutofilled = Boolean(params && params.name);
  const isDobAutofilled = Boolean(params && params.date_of_birth);
  const isGenderAutofilled = Boolean(params && params.gender);
  const isAvatarAutofilled = Boolean(params && params.avatar_url);

  // Autofill from params if present (from waitlist)
  useEffect(() => {
    if (params) {
      if (params.name) setName(params.name as string);
      if (params.date_of_birth)
        setDateOfBirth(new Date(params.date_of_birth as string));
      if (params.gender)
        setGender(params.gender as "male" | "female" | "other");
      if (params.avatar_url) setProfileImage(params.avatar_url as string);
    }
  }, [params]);

  const handleDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDateOfBirth(selectedDate);
  };

  const handleImagePick = () => {
    setShowImagePicker(true);
  };

  const handleImageConfirm = async (uri: string, mimeType: string) => {
    setShowImagePicker(false);
    setIsUploadingImage(true);
    try {
      const uploadResult = await api.uploads.uploadProfilePicture(
        uri,
        mimeType,
      );
      setProfileImage(uploadResult.avatarUrl);
    } catch (error: any) {
      console.error("Image upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Could not upload image. Please try again.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleContinue = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your full name.");
      return;
    }
    if (!gender) {
      Alert.alert("Validation Error", "Please select your gender.");
      return;
    }

    if (!agreedToLegal) {
      Alert.alert(
        "Consent Required",
        "You must agree to the Terms of Use, Privacy Policy, and EULA to continue.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the api module which includes JWT token
      await api.profile.completeOnboarding({
        full_name: name.trim(),
        date_of_birth: dateOfBirth.toISOString(),
        gender,
        avatar_url: profileImage || undefined,
      });

      // Record legal acceptance
      await api.profile.acceptLegal({ eula_version: "1.0" });

      router.push("/onboarding/interests-setup" as any);
    } catch (err: any) {
      console.error("Profile setup error:", err);
      Alert.alert("Error", err.message || "Could not save your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onConfirm={handleImageConfirm}
        aspectRatio={[1, 1]}
        title="Profile Photo"
      />

      {/* Text Input Bubble for Name */}
      <TextInputBubble
        visible={nameBubbleVisible}
        label="Full Name"
        value={name}
        placeholder="Enter your full name"
        onConfirm={(val) => {
          setName(val);
          setNameBubbleVisible(false);
        }}
        onCancel={() => setNameBubbleVisible(false)}
      />

      <Image
        source={require("../../assets/images/grid-fill-warp.svg")}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.7 }}
        contentFit="cover"
      />

      <View style={styles.header1}>
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            borderRadius: 9999,
            width: 50,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            marginTop: -5,
          }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#000" />
        </TouchableOpacity>
        <CText weight="medium" fontSize={38}>
          Let&apos;s get to know you better
        </CText>
      </View>

      <View style={styles.whiteViewContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Upload */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={[
                styles.imageUploadContainer,
                isAvatarAutofilled && { opacity: 0.5 },
              ]}
              onPress={handleImagePick}
              disabled={isUploadingImage || isAvatarAutofilled}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color="#666" />
                  <CText fontSize={12} style={styles.uploadText}>
                    Add Photo
                  </CText>
                </View>
              )}
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="create" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <CText fontSize={14} weight="medium" style={styles.label}>
              Full Name
            </CText>
            <TouchableOpacity
              style={[
                styles.textInput,
                { justifyContent: "center" },
                isNameAutofilled && {
                  backgroundColor: "#F5F5F5",
                },
              ]}
              onPress={() => !isNameAutofilled && setNameBubbleVisible(true)}
              activeOpacity={isNameAutofilled ? 1 : 0.7}
            >
              <CText
                style={{
                  fontSize: 16,
                  color: name
                    ? isNameAutofilled
                      ? "#A2A2A2"
                      : "#333"
                    : "#A2A2A2",
                }}
              >
                {name || "Enter your full name"}
              </CText>
            </TouchableOpacity>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputSection}>
            <CText fontSize={14} weight="medium" style={styles.label}>
              Date of Birth
            </CText>
            <TouchableOpacity
              style={[
                styles.dateInput,
                isDobAutofilled && { backgroundColor: "#F5F5F5", opacity: 0.7 },
              ]}
              onPress={() => !isDobAutofilled && setShowDatePicker(true)}
              disabled={isDobAutofilled}
            >
              <CText
                style={{
                  color: isDobAutofilled
                    ? "#A2A2A2"
                    : dateOfBirth
                      ? "#333"
                      : "#A2A2A2",
                }}
              >
                {formatDate(dateOfBirth)}
              </CText>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <CustomDatePicker
            visible={showDatePicker && !isDobAutofilled}
            value={dateOfBirth}
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker(false)}
            maximumDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 13))
            }
          />

          {/* Gender Selection */}
          <View style={styles.inputSection}>
            <CText fontSize={14} weight="medium" style={styles.label}>
              Gender
            </CText>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "male" && styles.genderOptionSelected,
                  isGenderAutofilled && { opacity: 0.5 },
                ]}
                onPress={() => !isGenderAutofilled && setGender("male")}
                disabled={isGenderAutofilled}
              >
                <View style={styles.genderIconContainer}>
                  <Ionicons
                    name="male"
                    size={24}
                    color={gender === "male" ? "#fff" : "#666"}
                  />
                </View>
                <CText
                  fontSize={14}
                  weight="medium"
                  style={{
                    color: gender === "male" ? "#fff" : "#666",
                  }}
                >
                  Male
                </CText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "female" && styles.genderOptionSelected,
                  isGenderAutofilled && { opacity: 0.5 },
                ]}
                onPress={() => !isGenderAutofilled && setGender("female")}
                disabled={isGenderAutofilled}
              >
                <View style={styles.genderIconContainer}>
                  <Ionicons
                    name="female"
                    size={24}
                    color={gender === "female" ? "#fff" : "#666"}
                  />
                </View>
                <CText
                  fontSize={14}
                  weight="medium"
                  style={{
                    color: gender === "female" ? "#fff" : "#666",
                  }}
                >
                  Female
                </CText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "other" && styles.genderOptionSelected,
                  isGenderAutofilled && { opacity: 0.5 },
                ]}
                onPress={() => !isGenderAutofilled && setGender("other")}
                disabled={isGenderAutofilled}
              >
                <View style={styles.genderIconContainer}>
                  <Ionicons
                    name="transgender"
                    size={24}
                    color={gender === "other" ? "#fff" : "#666"}
                  />
                </View>
                <CText
                  fontSize={14}
                  weight="medium"
                  style={{
                    color: gender === "other" ? "#fff" : "#666",
                  }}
                >
                  Other
                </CText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Legal Consent Checkbox */}
          <View style={styles.legalSection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToLegal(!agreedToLegal)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreedToLegal ? "checkbox" : "square-outline"}
                size={24}
                color={agreedToLegal ? "#3D1A66" : "#A2A2A2"}
              />
              <CText fontSize={12} style={styles.legalText}>
                I agree to the{" "}
                <CText
                  weight="medium"
                  style={styles.legalLink}
                  onPress={() =>
                    router.push({
                      pathname: "/onboarding/legal",
                      params: { type: "terms" },
                    })
                  }
                >
                  Terms of Use
                </CText>
                {", "}
                <CText
                  weight="medium"
                  style={styles.legalLink}
                  onPress={() =>
                    router.push({
                      pathname: "/onboarding/legal",
                      params: { type: "privacy" },
                    })
                  }
                >
                  Privacy Policy
                </CText>
                {", and "}
                <CText
                  weight="medium"
                  style={styles.legalLink}
                  onPress={() =>
                    router.push({
                      pathname: "/onboarding/legal",
                      params: { type: "eula" },
                    })
                  }
                >
                  EULA
                </CText>
                .
              </CText>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <Pressable
            style={[
              styles.buttonContainer,
              (!name || !gender || !agreedToLegal) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!name || !gender || !agreedToLegal || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#3D1A66" />
            ) : (
              <CText
                weight="medium"
                style={{
                  color:
                    !name || !gender || !agreedToLegal ? "#A2A2A2" : "#000",
                }}
              >
                Continue
              </CText>
            )}
          </Pressable>

          <View style={{ height: 80 }} />
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
    paddingTop: 30,
  },
  header1: {
    marginLeft: 35,
    marginBottom: 15,
    gap: 10,
  },
  header: {
    marginBottom: 30,
  },
  subtitle: {
    color: "#666",
    marginTop: 8,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageUploadContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    color: "#666",
    marginTop: 8,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 10,
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 2,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "fontMainRegular",
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 2,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  genderOptionSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  genderIconContainer: {
    marginBottom: 4,
  },
  buttonContainer: {
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
  buttonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#D1D1D1",
  },
  legalSection: {
    marginVertical: 16,
    paddingHorizontal: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  legalText: {
    flex: 1,
    marginLeft: 10,
    color: "#666",
    lineHeight: 18,
  },
  legalLink: {
    color: "#3D1A66",
    textDecorationLine: "underline",
  },
});
