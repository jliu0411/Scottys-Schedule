import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import TopBar from "../components/alarms/TopBar";
import TimePickerSheet from "../components/alarms/TimePickerSheet";
import RepeatSelectorSheet from "../components/alarms/RepeatSelectorSheet";
import { formatRepeatDays } from "../components/alarms/formatRepeatDays";
import { useAlarms } from "../components/alarms/alarmLocalStorage";

export default function newAlarm() {
  const router = useRouter();
  const { addAlarm } = useAlarms();

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [repeatDays, setRepeatDays] = useState([]);
  const [showRepeat, setShowRepeat] = useState(false);

  const [puzzle, setPuzzle] = useState(false);

  const handleCreateAlarm = () => {
    addAlarm({
      id: Date.now(),
      time: time.getTime(),
      repeatDays,
      puzzle,
      enabled: true,
    });
    router.back();
  };

  return (
    <View style={{ flex: 1}}>
      <TopBar title="New Alarm" />

      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.label}>Time Task Ends</Text>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.inputText}>
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 16 }]}>Repeats</Text>

          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowRepeat(true)}
          >
            <Text style={styles.inputText}>
              {formatRepeatDays(repeatDays)}
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Switch
              value={puzzle}
              onValueChange={setPuzzle}
              trackColor={{ false: "#ccc", true: "#0A5875" }}
              thumbColor="#fff"
            />
            <Text style={styles.puzzleLabel}>Puzzle?</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCreateAlarm}>
            <Text style={styles.buttonText}>Create Alarm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TimePickerSheet
        visible={showPicker}
        time={time}
        onChange={setTime}
        onClose={() => setShowPicker(false)}
      />

      <RepeatSelectorSheet
        visible={showRepeat}
        days={allDays}
        selectedDays={repeatDays}
        setSelectedDays={setRepeatDays}
        onClose={() => setShowRepeat(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 50,
    padding: 30,
    width: "90%",
    alignSelf: "center",
  },

  label: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    fontFamily: "Jersey10-Regular"
  },

  inputBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
  },

  inputText: {
    fontSize: 16,
    color: "#444",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  puzzleLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#222",
  },

  button: {
    backgroundColor: "#f4a30b",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Jersey10-Regular"
  },
});
