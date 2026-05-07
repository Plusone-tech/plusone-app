import CText from "@/components/CText";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface AttendeesListProps {
  count: number;
  avatars: string[];
  onSeeAll?: () => void;
}

export default function AttendeesList({
  count,
  avatars,
  onSeeAll,
}: AttendeesListProps) {
  return (
    <>
      <CText style={styles.sectionTitle}>{count} PlusOnes Going</CText>
      <View style={styles.attendeesContainer}>
        <View style={styles.avatarGroup}>
          {avatars.slice(0, 5).map((avatar, index) => (
            <Image
              key={index}
              source={{ uri: avatar }}
              style={[
                styles.attendeeAvatar,
                {
                  zIndex: avatars.length - index,
                  marginLeft: index > 0 ? -12 : 0,
                },
              ]}
            />
          ))}
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <CText style={styles.seeAllText}>See all →</CText>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  attendeesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarGroup: {
    flexDirection: "row",
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "white",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3D1A66",
    fontWeight: "600",
  },
});
