import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
} from "react-native";
import React, { useMemo } from "react";
import { useRouter } from "expo-router";
import { useAlarms } from "../components/alarms/alarmLocalStorage";

const formatRepeatDays = (days) => {
  if (!days || days.length === 0) return "ONE-TIME";

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

export default function Alarms() {
  const router = useRouter();
  const { alarms, toggleAlarm } = useAlarms();

  const sortedAlarms = useMemo(() => {
    const toMinutes = (alarm) => {
      const d = new Date(alarm.time);
      return d.getHours() * 60 + d.getMinutes();
    };
    return [...alarms].sort((a, b) => toMinutes(a) - toMinutes(b));
  }, [alarms]);

  const renderAlarm = ({ item: alarm }) => (
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

      <Switch
        value={alarm.enabled ?? true}
        onValueChange={(nextValue) => toggleAlarm(alarm.id, nextValue)}
        trackColor={{ false: "#ccc", true: "#0A5875" }}
        thumbColor="#fff"
        style={styles.alarmSwitch}
      />


      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/editAlarm",
            params: { id: alarm.id.toString() },
          })
        }
        style={styles.menuButton}
      >
        <Image
          source={require("../assets/buttons/yellowMenu.png")}
          style={{ width: 50, height: 50 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.page}>
      <FlatList
        data={sortedAlarms}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAlarm}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#275E7E",
  },

  list: {
    paddingVertical: 16,
    alignItems: "center",
  },

  alarmCard: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  left: {
    flex: 1,
  },

  alarmTime: {
    fontSize: 50,
    fontFamily: "Jersey10",
    color: "#000",
  },

  repeatText: {
    fontSize: 25,
    color: "#8C8C8C",
    fontFamily: "Jersey10",
  },

  center: {
    marginHorizontal: 8,
  },

  alarmSwitch: {
    transform: [{ scaleX: 2 }, { scaleY: 2 }], 
    marginHorizontal: 25,
  },

  menuButton: {
    paddingLeft: 5,
  },
});
