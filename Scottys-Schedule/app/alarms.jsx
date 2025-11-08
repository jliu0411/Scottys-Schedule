import { Image, View, Text, StyleSheet, TouchableOpacity } from "react-native";
//import TopBar from "../components/topBar.jsx";
import React from "react";
import { useRouter } from "expo-router";

export default function Alarms(
  onRightPress,
  showBack = true,

) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBox}>
          <Image 
            source = {require("../assets/arrows/leftArrow.png")}
            style = {{width: 50, height: 50}}
            resizeMode = "contain"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderBox} />
      )}

      <Text style={styles.title}> Alarms </Text>

      {onRightPress ? (
        <TouchableOpacity onPress={() => router.push("/newAlarm")} style={styles.iconBox}>
          <Image 
            source = {require("../assets/buttons/addbButton.png")}
            style = {{width: 50, height: 50}}
            resizeMode = "contain"
          />
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
    backgroundColor: "#0A5875",
  },
  placeholderBox: { width: 30 },
  title: {
    fontSize: 50,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Jersey10-Regular"
  },
});