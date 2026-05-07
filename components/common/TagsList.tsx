import CText from "@/components/CText";
import { StyleSheet, View } from "react-native";

interface TagsListProps {
  tags: string[];
}

export default function TagsList({ tags }: TagsListProps) {
  return (
    <View style={styles.tagsContainer}>
      {tags.map((tag, index) => (
        <View key={index} style={styles.tag}>
          <CText style={styles.tagText}>{tag}</CText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: "#666",
  },
});
