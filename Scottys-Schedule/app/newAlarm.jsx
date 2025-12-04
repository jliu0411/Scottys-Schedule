import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import React, { useState, useRef } from "react";
import { useRouter } from "expo-router";
import TimePickerSheet from "../components/alarms/TimePickerSheet";
import RepeatSelectorSheet from "../components/alarms/RepeatSelectorSheet";
import { formatRepeatDays } from "../components/alarms/formatRepeatDays";
import { useAlarms } from "../components/alarms/alarmContext.jsx";

export default function NewAlarm() {
  const router = useRouter();
  const { addAlarm } = useAlarms();

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [repeatDays, setRepeatDays] = useState([]);
  const [showRepeat, setShowRepeat] = useState(false);
  const [repeatAnchor, setRepeatAnchor] = useState(null);

  const [puzzle, setPuzzle] = useState(false);

  const repeatInputRef = useRef(null);

  const handleOpenRepeat = () => {
    if (repeatInputRef.current && repeatInputRef.current.measureInWindow) {
      repeatInputRef.current.measureInWindow((x, y, width, height) => {
        setRepeatAnchor({ x, y, width, height });
        setShowRepeat(true);
      });
    } else {
      setRepeatAnchor(null);
      setShowRepeat(true);
    }
  };

  const handleCreateAlarm = () => {
    addAlarm({
      timer: time.getTime(), 
      repeatDays,
      puzzle,
      enabled: true,
    });

    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A5875" }}>
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
            ref={repeatInputRef}
            style={styles.inputBox}
            onPress={handleOpenRepeat}
          >
            <Text style={styles.inputText}>
              {formatRepeatDays(repeatDays)}
            </Text>

            <Text style={styles.dropdown}>^</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Switch
              value={puzzle}
              onValueChange={setPuzzle}
              trackColor={{ false: "#ccc", true: "#0A5875" }}
              thumbColor="#fff"
              style={styles.puzzleSwitch}
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
        anchor={repeatAnchor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Jersey10",
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
    fontSize: 22,
    color: "#222",
    fontFamily: "Jersey10",
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
    fontSize: 20,
    color: "#444",
    fontFamily: "Jersey10",
  },

  dropdown: {
    fontSize: 20,
    marginLeft: 8,
    fontFamily: "Jersey10",
    transform: [{ rotate: "180deg" }]
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  puzzleSwitch: {
    transform: [{ scaleX: 2 }, { scaleY: 2 }],
    marginRight: 45,
    paddingLeft: 60,
  },

  puzzleLabel: {
    marginLeft: 8,
    fontSize: 30,
    color: "#222",
    fontFamily: "Jersey10",
  },

  button: {
    backgroundColor: "#f4a30b",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 30,
    color: "#fff",
    fontFamily: "Jersey10",
  },
});
