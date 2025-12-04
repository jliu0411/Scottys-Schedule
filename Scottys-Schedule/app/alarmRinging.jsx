import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlarms } from "../components/alarms/alarmContext";

import {
  generateQuestions,
  clearAlarmNotificationsFromTray,
} from "../components/alarms/alarmRingingHelper";

export default function AlarmRinging() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const alarmId = Array.isArray(id) ? id[0] : id;

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
    if (alarmId) {
      cancelFutureNotificationsForAlarm(alarmId);
    }
  }, [alarmId]); 

  useEffect(() => {
    return () => {
      if (alarmId) {
        clearRingingAlarm(alarmId);
      }
    };
  }, [alarmId, clearRingingAlarm]);

  const [questions] = useState(() => generateQuestions(3));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [error, setError] = useState("");

  const currentQuestion = questions[currentIndex];

  const handleTurnOff = async () => {
    if (alarmId) {
      await cancelFutureNotificationsForAlarm(alarmId);
    }

    await clearAlarmNotificationsFromTray(alarmId);

    if (alarmId) {
      await updateAlarm(alarmId, { enabled: false });
    }

    clearRingingAlarm(alarmId);
    router.replace("/alarms");
  };

  const handleDigitPress = (digit) => {
    setError("");
    setCurrentAnswer((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setError("");
    setCurrentAnswer((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;

    const correct = currentQuestion.a + currentQuestion.b;
    const userAns = parseInt(currentAnswer, 10);

    if (Number.isNaN(userAns) || userAns !== correct) {
      setError("Incorrect. Try again!");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setCurrentAnswer("");
      setError("");
    } else {
      handleTurnOff();
    }
  };

  if (!alarm) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.card}>
          <Text style={styles.title}>Alarm</Text>
          <Text style={styles.text}>Could not find this alarm.</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={() => router.replace("/alarms")}
          >
            <Text style={styles.primaryButtonText}>Back to Alarms</Text>
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
            <Text style={styles.text}>Tap below to turn off this alarm.</Text>
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 24 }]}
              onPress={handleTurnOff}
            >
              <Text style={styles.primaryButtonText}>Turn Off Alarm</Text>
            </TouchableOpacity>
          </>
        )}

        {showPuzzle && (
          <>
            <Text style={styles.progressText}>
              {currentIndex + 1}/{questions.length}
            </Text>

            <Text style={styles.questionBig}>
              {currentQuestion?.a} + {currentQuestion?.b}
            </Text>

            <View style={styles.answerBox}>
              <Text style={styles.answerText}>
                {currentAnswer || ""}
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.keypad}>
              <View style={styles.keypadRow}>
                <KeyButton label="1" onPress={() => handleDigitPress("1")} />
                <KeyButton label="2" onPress={() => handleDigitPress("2")} />
                <KeyButton label="3" onPress={() => handleDigitPress("3")} />
                <KeyButton label="⌫" onPress={handleBackspace} isSecondary />
              </View>

              <View style={styles.keypadRow}>
                <KeyButton label="4" onPress={() => handleDigitPress("4")} />
                <KeyButton label="5" onPress={() => handleDigitPress("5")} />
                <KeyButton label="6" onPress={() => handleDigitPress("6")} />
                <KeyButton label="✓" onPress={handleSubmit} isPrimary />
              </View>

              <View style={styles.keypadRow}>
                <KeyButton label="7" onPress={() => handleDigitPress("7")} />
                <KeyButton label="8" onPress={() => handleDigitPress("8")} />
                <KeyButton label="9" onPress={() => handleDigitPress("9")} />
                <KeyButton label="0" onPress={() => handleDigitPress("0")} />
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function KeyButton({ label, onPress, isPrimary, isSecondary }) {
  return (
    <TouchableOpacity
      style={[
        styles.keyButton,
        isPrimary && styles.keyButtonPrimary,
        isSecondary && styles.keyButtonSecondary,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.keyButtonText,
          (isPrimary || isSecondary) && styles.keyButtonTextStrong,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#0A5875",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "Jersey10",
    marginBottom: 8,
    color: "#000",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    color: "#444",
    fontFamily: "Jersey10",
  },
  progressText: {
    marginTop: 8,
    fontSize: 18,
    color: "#8C8C8C",
    fontFamily: "Jersey10",
  },
  questionBig: {
    marginTop: 28,
    fontSize: 56,
    color: "#000",
    fontFamily: "Jersey10",
    textAlign: "center",
  },
  answerBox: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#0A5875",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  answerText: {
    fontSize: 32,
    color: "#000",
    fontFamily: "Jersey10",
  },
  errorText: {
    marginTop: 8,
    color: "#E53935",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Jersey10",
  },
  keypad: {
    marginTop: 28,
    width: "100%",
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  keyButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F4",
  },
  keyButtonPrimary: {
    backgroundColor: "#f4a30b",
  },
  keyButtonSecondary: {
    backgroundColor: "#E6F1FA",
  },
  keyButtonText: {
    fontSize: 22,
    color: "#000",
    fontFamily: "Jersey10",
  },
  keyButtonTextStrong: {
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#f4a30b",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Jersey10",
  },
});
