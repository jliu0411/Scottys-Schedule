import { StyleSheet, View } from "react-native";
import TopBar from "../components/topBar.jsx";
import React from "react";
import { useRouter } from "expo-router";

export default function Alarms() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TopBar
        title="Alarms"
        onBack={() => router.back()}
        onRightPress={() => router.push("/newAlarm")}
        rightIcon="add"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A5875",
  },
});
