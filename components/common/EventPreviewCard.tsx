import CText from "@/components/CText";
import { Image, StyleSheet, View } from "react-native";

interface EventPreviewCardProps {
  title: string;
  imageUri: string;
  hostName: string;
  hostAvatar: string;
}

export default function EventPreviewCard({
  title,
  imageUri,
  hostName,
  hostAvatar,
}: EventPreviewCardProps) {
  return (
    <View style={styles.eventPreview}>
      <Image source={{ uri: imageUri }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <CText style={styles.eventTitle}>{title}</CText>
        <View style={styles.hostInfo}>
          <Image source={{ uri: hostAvatar }} style={styles.hostAvatar} />
          <CText style={styles.hostName}>Hosted by {hostName}</CText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventPreview: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hostAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  hostName: {
    fontSize: 14,
    color: "#666",
  },
});
