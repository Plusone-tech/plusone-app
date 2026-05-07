import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CText from "./CText";

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      id: "explore",
      route: "/home",
      icon: "compass",
      iconOutline: "compass-outline",
      label: "Explore",
    },
    {
      id: "chat",
      route: "/home/chat",
      icon: "chatbubble",
      iconOutline: "chatbubble-outline",
      label: "Chat",
    },
    {
      id: "create",
      route: "/home/create-event",
      icon: "add",
      iconOutline: "add",
      label: "Create",
      isSpecial: true,
    },
    {
      id: "bookmarks",
      route: "/home/bookmarks",
      icon: "bookmark",
      iconOutline: "bookmark-outline",
      label: "Bookmarks",
    },
    {
      id: "profile",
      route: "/home/profile",
      icon: "person",
      iconOutline: "person-outline",
      label: "Profile",
    },
  ];

  const handleNavPress = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === "/home") {
      return pathname === "/home" || pathname === "/home/";
    }
    return pathname === route;
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {navItems.map((item) => {
        const active = isActive(item.route);

        return (
          <TouchableOpacity
            key={item.id}
            style={active ? styles.navButtonActive : styles.navButton}
            onPress={() => handleNavPress(item.route)}
          >
            {item.id === "create" ? (
              active ? (
                <>
                  <ExpoImage
                    source={require("../assets/svgs/logo.svg")}
                    style={{ width: 28, height: 28 }}
                    contentFit="contain"
                  />
                  <CText style={styles.navTextActive}>{item.label}</CText>
                </>
              ) : (
                <ExpoImage
                  source={require("../assets/svgs/logo.svg")}
                  style={{ width: 24, height: 24, opacity: 0.5 }}
                  contentFit="contain"
                />
              )
            ) : active ? (
              <>
                <Ionicons name={item.icon as any} size={24} color="#3D1A66" />
                <CText style={styles.navTextActive}>{item.label}</CText>
              </>
            ) : (
              <Ionicons name={item.iconOutline as any} size={24} color="#666" />
            )}
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  navButtonActive: {
    backgroundColor: "#E8D5FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navButton: {
    padding: 10,
  },
  navTextActive: {
    color: "#3D1A66",
    fontWeight: "600",
    fontSize: 14,
  },
});
