import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (uri: string, mimeType: string) => void;
  aspectRatio?: [number, number];
  title?: string;
}

export default function ImagePickerModal({
  visible,
  onClose,
  onConfirm,
  aspectRatio = [16, 9],
  title = "Select Image",
}: ImagePickerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to select an image."
        );
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        setIsLoading(false);
        return;
      }

      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      setMimeType(asset.mimeType || "image/jpeg");
      setIsLoading(false);
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    if (selectedImage) {
      onConfirm(selectedImage, mimeType);
      setSelectedImage(null);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  const handleRetake = () => {
    setSelectedImage(null);
    handlePickImage();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <CText fontSize={18} weight="medium" style={styles.headerTitle}>{title}</CText>
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {selectedImage ? (
            // Preview selected image
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetake}
                >
                  <Ionicons name="refresh" size={20} color="#3D1A66" />
                  <CText style={styles.retakeButtonText}>Retake</CText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleDone}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <CText style={styles.doneButtonText}>Done</CText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Pick image prompt
            <View style={styles.pickContainer}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3D1A66" />
                  <CText style={styles.loadingText}>Opening gallery...</CText>
                </View>
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Ionicons name="image-outline" size={60} color="#3D1A66" />
                  </View>
                  <CText style={styles.pickTitle}>Choose an Image</CText>
                  <CText style={styles.pickSubtitle}>
                    Select from your gallery and crop it to fit
                  </CText>

                  <TouchableOpacity
                    style={styles.pickButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="images" size={22} color="white" />
                    <CText style={styles.pickButtonText}>
                      Open Photo Library
                    </CText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
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
    paddingBottom: 24,
    paddingTop: 62,
    backgroundColor: "#3D1A66",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pickContainer: {
    alignItems: "center",
    padding: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  pickTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D1A45",
    marginBottom: 8,
  },
  pickSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3D1A66",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  previewContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "70%",
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#3D1A66",
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D1A66",
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3D1A66",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
