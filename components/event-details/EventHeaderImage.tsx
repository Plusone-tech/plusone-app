import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface EventHeaderImageProps {
  imageUri: string;
  price: string;
  onBack: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export default function EventHeaderImage({
  imageUri,
  price,
  onBack,
  onShare,
  onBookmark,
  isBookmarked = false,
}: EventHeaderImageProps) {
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/* Header Actions */}
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerRightButtons}>
          {onShare && (
            <TouchableOpacity style={styles.iconButton} onPress={onShare}>
              <Ionicons name="share-social-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          {onBookmark && (
            <TouchableOpacity style={styles.iconButton} onPress={onBookmark}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Price Badge */}
      {/* <View style={styles.priceBadge}>
        <CText style={styles.priceText}>{price}</CText>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerButtons: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerRightButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  priceBadge: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3D1A66",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  priceText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
