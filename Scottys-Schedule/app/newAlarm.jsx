import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Switch, Modal} from "react-native";
import React, { useState } from 'react'
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

function formatRepeatDays(days) {
  if (!days || days.length === 0) return "Select Days";

  const sorted = days.filter((d) => days.includes(d));

  if (sorted.length === 7) return "Everyday";

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekends = ["Sun", "Sat"];

  if (
    sorted.length === 5 &&
    weekdays.every((d) => sorted.includes(d))
  ) {
    return "Weekdays";
  }

  if (
    sorted.length === 2 &&
    weekends.every((d) => sorted.includes(d))
  ) {
    return "Weekends";
  }

  return sorted.join(", ");
}

export default function newAlarm({onRightPress, showBack = true}) {
  const router = useRouter();

  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatModal, setRepeatModal] = useState(false);

  const [puzzle, setPuzzle] = useState(false);

  const onChangeTime = (event, selectedTime) => {
    if(selectedTime)
      setTime(selectedTime);
  };
  

  const handleCreateAlarm = () => {
    console.log("Alarm Created!", {time, repeatDays, puzzle})
  };


  return (
    <View style = {{flex: 1}}>
      <View style={styles.topBar}>
        {/*Top bar section*/}
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

          <Text style={styles.title}> New Alarm </Text>
          <Text style={styles.title}>    </Text>
        </View>
      </View>

      {/*rest of the page*/}
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.label}>Time Task Ends</Text>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.inputText}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </TouchableOpacity>

          <Modal 
            visible={showPicker} 
            transparent 
            animationType="fade"
          >
            <TouchableOpacity 
              activeOpacity = {1}
              style={styles.modalOverlay}
              onPress = {() => setShowPicker(false)}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.dateTimePicker}>
                    <DateTimePicker
                      value={time}
                      mode="time"
                      display="spinner"
                      onChange={onChangeTime}
                      themeVariant="light"
                      style={{flex: 1}}
                    />    
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>

          <Text style={[styles.label, { marginTop: 16 }]}>Repeats</Text>

          <TouchableOpacity 
            style={styles.inputBox}
            onPress={() => setRepeatModal(true)}
          >
            <Text style={styles.inputText}>{formatRepeatDays(repeatDays)}</Text>
            <Ionicons name="chevron-down" size={18} color="#666" />
          </TouchableOpacity>

          <Modal visible={repeatModal} transparent animationType="slide">
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setRepeatModal(false)}
            >
              <TouchableWithoutFeedback>
                <View style={styles.repeatModalBox}>
                  <Text style={styles.repeatTitle}>Repeat</Text>

                  {days.map((d) => {
                    const selected = repeatDays.includes(d);

                    return (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.repeatRow,
                          selected && styles.repeatRowSelected
                        ]}
                        onPress={() => {
                          if (selected) {
                            setRepeatDays(repeatDays.filter((x) => x !== d));
                          } else {
                            setRepeatDays([...repeatDays, d]);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.repeatText,
                            selected && styles.repeatTextSelected
                          ]}
                        >
                          Every {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setRepeatModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>

          <View style={styles.row}>
            <Switch
              value={puzzle}
              onValueChange={setPuzzle}
              trackColor={{ false: "#ccc", true: "#0A5875" }}
              thumbColor={puzzle ? "#fff" : "#fff"}
            />
            <Text style={styles.puzzleLabel}>Puzzle?</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCreateAlarm}>
            <Text style={styles.buttonText}>Create Alarm</Text>
          </TouchableOpacity>  
        </View>
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

  dateTimePicker: {
    height: 200, 
    width: "100%"
  },

  iconBox: { 
    padding: 5 
  },

  placeholderBox: { 
    width: 30 
  },

  topBar: {
    backgroundColor: "#044A68",
  },

  page: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center",
  },
  
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    margin: 50,
    borderRadius: 20,
    padding: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  modalOverlay: {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalContent: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingLeft: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center", 
    justifyContent: "center", 
    height: 300,
  },

  modalButton: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#0A5875",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

    daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    justifyContent: "center",
  },

  dayButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#EEE",
  },

  dayButtonSelected: {
    backgroundColor: "#0A5875",
  },

  dayButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },

  dayButtonTextSelected: {
    color: "#FFF",
  },

  repeatModalBox: {
  backgroundColor: "#fff",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingTop: 20,
  paddingBottom: 10,
  paddingHorizontal: 0,
  width: "100%",
  position: "absolute",
  bottom: 0,
  },

  repeatTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },

  repeatRow: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },

  repeatRowSelected: {
    backgroundColor: "#E6F1FA",
  },

  repeatText: {
    fontSize: 18,
    color: "#000",
  },

  repeatTextSelected: {
    color: "#0A5875",
    fontWeight: "700",
  },

});