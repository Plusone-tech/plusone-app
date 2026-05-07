import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  title?: string;
  showBack?: boolean;
  rightActions?: React.ReactNode;
  backgroundColor?: string;
  iconColor?: string;
}

export default function ScreenHeader({
  title,
  showBack = true,
  rightActions,
  backgroundColor = "white",
  iconColor = "#333",
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor }]}>
      {showBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {title && (
        <View style={styles.titleContainer}>
          <Ionicons name="logo-electron" size={22} color={iconColor} />
        </View>
      )}

      {rightActions || <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
});
