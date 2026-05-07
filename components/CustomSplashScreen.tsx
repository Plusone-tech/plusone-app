import { Image as ExpoImage } from "expo-image";
import { View } from "react-native";

export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#340074",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ExpoImage
        source={require("../assets/svgs/logo-full.svg")}
        style={{ width: 200, height: 200 }}
        contentFit="contain"
      />
    </View>
  );
}
