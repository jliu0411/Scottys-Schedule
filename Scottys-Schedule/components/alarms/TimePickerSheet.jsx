import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TimePickerSheet({ visible, time, onChange, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.sheet}>
            <Text style={styles.title}>Select Time</Text>

            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                textColor="#000"
                onChange={(e, selected) => {
                  if (selected) onChange(selected);
                }}
              />
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },

  title: {
    fontSize: 25,
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "700",
    fontFamily: "Jersey10-Regular"
  },

  pickerWrap: {
    height: 220,
    justifyContent: "center",
    alignItems: "center"
  },

  closeBtn: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#0A5875",
  },

  closeText: {
    color: "#fff",
    fontSize: 35,
    fontWeight: "600",
    fontFamily: "Jersey10-Regular"
  },
});
