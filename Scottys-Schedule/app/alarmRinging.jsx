import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlarms } from "../components/alarms/alarmLocalStorage";

function generateQuestions(count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 9) + 1; 
    const b = Math.floor(Math.random() * 9) + 1; 
    qs.push({ a, b });
  }
  return qs;
}

export default function AlarmRinging() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const alarmId = Number(id);

  const {
    alarms,
    updateAlarm,
    cancelFutureNotificationsForAlarm,
    clearRingingAlarm,
  } = useAlarms();

  const alarm = useMemo(
    () => alarms.find((a) => a.id === alarmId),
    [alarms, alarmId]
  );

  useEffect(() => {
    if (Number.isFinite(alarmId)) {
      cancelFutureNotificationsForAlarm(alarmId);
    }
  }, [alarmId, cancelFutureNotificationsForAlarm]);

  useEffect(() => {
    return () => {
      clearRingingAlarm(alarmId);
    };
  }, [alarmId, clearRingingAlarm]);

  const [questions] = useState(() => generateQuestions(3));
  const [answers, setAnswers] = useState(["", "", ""]);
  const [error, setError] = useState("");

  const handleTurnOff = async () => {
    if (Number.isFinite(alarmId)) {
      const shouldStayEnabled =
        Array.isArray(alarm?.repeatDays) && alarm.repeatDays.length > 0;
      await updateAlarm(alarmId, { enabled: shouldStayEnabled });
    }
    clearRingingAlarm(alarmId);
    router.replace("/alarms");
  };

  const handleChangeAnswer = (index, text) => {
    setError("");
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  const handleSubmitPuzzle = () => {
    let allCorrect = true;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAns = parseInt(answers[i], 10);
      if (Number.isNaN(userAns) || userAns !== q.a + q.b) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      setError("At least one answer is incorrect. Try again!");
      return;
    }

    handleTurnOff();
  };

  if (!alarm) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.card}>
          <Text style={styles.title}>Alarm</Text>
          <Text style={styles.text}>Could not find this alarm.</Text>
          <TouchableOpacity
            style={[styles.button, { marginTop: 24 }]}
            onPress={() => router.replace("/alarms")}
          >
            <Text style={styles.buttonText}>Back to Alarms</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const showPuzzle = alarm.puzzle === true;

  return (
    <View style={styles.fullScreen}>
      <View style={styles.card}>
        <Text style={styles.title}>Alarm Ringing!</Text>

        {!showPuzzle && (
          <>
            <Text style={styles.text}>
              Tap below to turn off this alarm.
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 24 }]}
              onPress={handleTurnOff}
            >
              <Text style={styles.buttonText}>Turn Off Alarm</Text>
            </TouchableOpacity>
          </>
        )}

        {showPuzzle && (
          <>
            <Text style={[styles.text, { marginBottom: 12 }]}>
              Solve all 3 questions to turn off the alarm.
            </Text>

            {questions.map((q, idx) => (
              <View key={idx} style={styles.questionRow}>
                <Text style={styles.questionText}>
                  {q.a} + {q.b} =
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={answers[idx]}
                  onChangeText={(text) => handleChangeAnswer(idx, text)}
                />
              </View>
            ))}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, { marginTop: 24 }]}
              onPress={handleSubmitPuzzle}
            >
              <Text style={styles.buttonText}>Submit Answers</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "Jersey10-Regular",
    marginBottom: 12,
    color: "#0A5875",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  questionText: {
    fontSize: 20,
    fontFamily: "Jersey10-Regular",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 80,
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#f4a30b",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Jersey10-Regular",
  },
  errorText: {
    marginTop: 8,
    color: "#e53935",
    fontSize: 14,
    textAlign: "center",
  },
});
