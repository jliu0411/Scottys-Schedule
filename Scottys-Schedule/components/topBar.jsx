import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TopBar({
  title = "",
  onBack,
  onRightPress,
  rightIcon = "add",
  showBack = true,
}) {
  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconBox}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderBox} />
      )}

      <Text style={styles.title}>{title}</Text>

      {onRightPress ? (
        <TouchableOpacity onPress={onRightPress} style={styles.iconBox}>
          <Ionicons name={rightIcon} size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderBox} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2b2069ff",
  },
  iconBox: { padding: 5 },
  placeholderBox: { width: 30 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
});
