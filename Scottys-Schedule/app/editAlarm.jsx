// app/editAlarm.jsx
import React, { useMemo, useState, useEffect } from "react";
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
import { useAlarms } from "../components/alarms/alarmLocalStorage";

export default function EditAlarm() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // from /editAlarm?id=...
  const alarmId = Number(id);

  const { alarms, updateAlarm, deleteAlarm } = useAlarms();

  const existingAlarm = useMemo(
    () => alarms.find((a) => a.id === alarmId),
    [alarms, alarmId]
  );

  useEffect(() => {
    if (!existingAlarm) {
      console.warn("EditAlarm: no alarm found for id", alarmId);
    }
  }, [existingAlarm, alarmId]);

  const [time, setTime] = useState(
    existingAlarm ? new Date(existingAlarm.time) : new Date()
  );
  const [showPicker, setShowPicker] = useState(false);

  const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [repeatDays, setRepeatDays] = useState(
    existingAlarm?.repeatDays ?? []
  );
  const [showRepeat, setShowRepeat] = useState(false);

  const [puzzle, setPuzzle] = useState(existingAlarm?.puzzle ?? false);

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

    Alert.alert(
      "Delete Alarm",
      "Are you sure you want to delete this alarm?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteAlarm(alarmId);
            router.back();
          },
        },
      ]
    );
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

  return (
    <View style={styles.fullScreen}>
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
        days={allDays}
        selectedDays={repeatDays}
        setSelectedDays={setRepeatDays}
        onClose={() => setShowRepeat(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#0A5875",
  },

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
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    fontFamily: "Jersey10-Regular",
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

  saveButton: {
    backgroundColor: "#f4a30b",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },

  saveText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Jersey10-Regular",
  },

  deleteButton: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },

  deleteText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Jersey10-Regular",
  },

  missingText: {
    textAlign: "center",
    paddingHorizontal: 24,
    fontSize: 18,
    color: "#fff",
    fontFamily: "Jersey10-Regular",
  },
});
