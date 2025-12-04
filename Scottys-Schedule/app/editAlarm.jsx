import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import TimePickerSheet from "../components/alarms/TimePickerSheet";
import RepeatSelectorSheet from "../components/alarms/RepeatSelectorSheet";
import { formatRepeatDays } from "../components/alarms/formatRepeatDays";
import { useAlarms } from "../components/alarms/alarmContext.jsx";

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EditAlarm() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const alarmId = Array.isArray(id) ? id[0] : id;

  const { alarms, updateAlarm, deleteAlarm } = useAlarms();

  const existingAlarm = useMemo(
    () => alarms.find((a) => a.id === alarmId),
    [alarms, alarmId]
  );

  const [time, setTime] = useState(new Date());
  const [repeatDays, setRepeatDays] = useState([]);
  const [puzzle, setPuzzle] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const repeatInputRef = useRef(null);
  const [repeatAnchor, setRepeatAnchor] = useState(null);

  useEffect(() => {
    if (existingAlarm) {
      setTime(new Date(existingAlarm.time));
      setRepeatDays(existingAlarm.repeatDays ?? []);
      setPuzzle(existingAlarm.puzzle ?? false);
    } else {
      console.warn("EditAlarm: no alarm found for id", alarmId);
    }
  }, [existingAlarm, alarmId]);

  const handleSave = () => {
    if (!existingAlarm) return;

    updateAlarm(alarmId, {
      time: time.getTime(),
      repeatDays,
      puzzle,
    });

    router.back();
  };

  const handleDelete = () => {
    if (!existingAlarm) return;

    Alert.alert("Delete Alarm", "Are you sure you want to delete this alarm?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAlarm(alarmId);
          router.back();
        },
      },
    ]);
  };

  const openRepeatDropdown = () => {
    if (repeatInputRef.current?.measureInWindow) {
      repeatInputRef.current.measureInWindow((x, y, width, height) => {
        setRepeatAnchor({ x, y, width, height });
        setShowRepeat(true);
      });
    } else {
      setShowRepeat(true);
    }
  };

  if (!existingAlarm) {
    return (
      <View style={[styles.fullScreen, { justifyContent: "center" }]}>
        <Text style={styles.missingText}>
          Could not find this alarm. Please go back.
        </Text>
      </View>
    );
  }

  const repeatLabel =
    repeatDays.length === 0 ? "Select Days" : formatRepeatDays(repeatDays);

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
            onPress={openRepeatDropdown}
          >
            <Text
              style={[
                styles.inputText,
                repeatDays.length === 0 && styles.placeholderText,
              ]}
            >
              {repeatLabel}
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Alarm</Text>
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
        days={ALL_DAYS}
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
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 32,
    padding: 24,
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

  placeholderText: {
    color: "#bbbbbb",
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

  saveButton: {
    backgroundColor: "#f4a30b",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },

  saveText: {
    textAlign: "center",
    fontSize: 30,
    color: "#fff",
    fontFamily: "Jersey10",
  },

  deleteButton: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },

  deleteText: {
    textAlign: "center",
    fontSize: 30,
    color: "#fff",
    fontFamily: "Jersey10",
  },

  missingText: {
    textAlign: "center",
    paddingHorizontal: 24,
    fontSize: 18,
    color: "#fff",
    fontFamily: "Jersey10",
  },
});

