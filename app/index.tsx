import { View, StyleSheet } from "react-native";

export default function Index() {
  
  return (
    <View
      style={styles.container}
    >
    </View>
  );
}
const fontSize = 24;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#340074",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    color: "black",
    fontFamily: "fontMainMedium",
    letterSpacing: -0.05 * fontSize,
    fontSize: 24,
  }
})