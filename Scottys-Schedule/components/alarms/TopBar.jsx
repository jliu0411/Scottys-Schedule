import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function TopBar({ title, showBack = true }) {
  const router = useRouter();

  return (
    <View style={{ backgroundColor: "#044A68" }}>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={{padding: 5 }}>
            <Image
              source={require("../../assets/arrows/leftArrow.png")}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.title}>{title}</Text>

        <View style={{width: 30}} />
      </View>
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
    backgroundColor: "#0A5875",
  },

  title: {
    fontSize: 50,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Jersey10-Regular"
  },
});
