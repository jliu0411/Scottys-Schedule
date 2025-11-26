import { Image, View, Text, StyleSheet, TouchableOpacity, Switch} from "react-native";
//import TopBar from "../components/topBar.jsx";
import React from "react";
import { useRouter } from "expo-router";
import { useAlarms } from "../components/alarms/alarmLocalStorage";


const formatRepeatDays = (days) => {
  if (!days || days.length === 0) return "One-time";

  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const sorted = [...days].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );

  const str = sorted.join(", ");

  const isWeekday = sorted.join() === "Mon,Tue,Wed,Thu,Fri";
  const isWeekend = sorted.join() === "Sat,Sun" || sorted.join() === "Sun,Sat";
  const isEveryday = sorted.length === 7;

  if (isEveryday) return "Every Day";
  if (isWeekday) return "Every Weekday";
  if (isWeekend) return "Every Weekend";

  return str;
};


export default function Alarms(onRightPress, showBack = true) {
  const router = useRouter();

  const { alarms, toggleAlarm } = useAlarms();
  console.log("ALARMS >>>", alarms);

  return (
    <View style= {styles.page}>
      <View style={styles.list}>
        {alarms.map((alarm) => (
          <View key={alarm.id} style={styles.alarmCard}>

            <View style={styles.left}>
              <Text style={styles.alarmTime}>
                {new Date(alarm.time).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>

              <Text style={styles.repeatText}>
                {formatRepeatDays(alarm.repeatDays)}
              </Text>
            </View>

            <View style={styles.center}>
              <Switch
                value={alarm.enabled ?? true}
                onValueChange={() => toggleAlarm(alarm.id)}
                trackColor={{ false: "#ccc", true: "#0A5875" }}
                thumbColor="#fff"
              />
            </View>

            {onRightPress ? (
              <TouchableOpacity onPress={() => router.push({pathname: "/editAlarm", params: { id: alarm.id.toString()}})} style={styles.iconBox}>
                <Image 
                  source = {require("../assets/buttons/yellowMenu.png")}
                  style = {{width: 50, height: 50}}
                  resizeMode = "contain"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholderBox} />
            )}
          </View>
        ))}
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
  placeholderBox: { 
    width: 30 
  },
  title: {
    fontSize: 50,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Jersey10-Regular"
  },
  list: {
  flex: 1,
  paddingHorizontal: 20,
  marginTop: 20,
  gap: 12,
  },

  alarmBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  timeText: {
    fontSize: 20,
    fontWeight: "600",
  },

  repeatText: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },

  list: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },

  alarmCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  left: {
    flex: 1,
  },

  alarmTime: {
    fontSize: 36,
    fontFamily: "Jersey10",
    color: "#000",
  },

  repeatText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: -6,
  },

  center: {
    marginHorizontal: 12,
  },

  menuButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

});