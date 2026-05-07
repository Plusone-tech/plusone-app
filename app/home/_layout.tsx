import BottomNavBar from "@/components/BottomNavBar";
import { Stack, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function HomeLayout() {
  const pathname = usePathname();

  // Don't show navbar on create-event page
  const showNavbar =
    pathname !== "/home/create-event" &&
    pathname !== "/home/event-details" &&
    pathname !== "/home/chat-detail" &&
    pathname !== "/home/join-event" &&
    pathname !== "/home/join-success";

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="bookmarks" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="create-event" />
        <Stack.Screen name="event-details" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="join-event" />
        <Stack.Screen name="join-success" />
      </Stack>

      {showNavbar && <BottomNavBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
