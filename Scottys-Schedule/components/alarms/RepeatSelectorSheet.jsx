import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

export default function RepeatSelectorSheet({
  visible,
  days,
  selectedDays,
  setSelectedDays,
  onClose,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.sheet}>
            <Text style={styles.title}>Repeat</Text>

            {days.map((d) => {
              const selected = selectedDays.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.row, selected && {backgroundColor: "#E6F1FA"}]}
                  onPress={() =>
                    selected
                      ? setSelectedDays(selectedDays.filter((x) => x !== d))
                      : setSelectedDays([...selectedDays, d])
                  }
                >
                  <Text
                    style={[
                      styles.text,
                      selected && styles.selectedText,
                    ]}
                  >
                    Every {d}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
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
    paddingTop: 20,
    paddingBottom: 10,
    width: "100%",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },

  row: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  text: {
    fontSize: 18,
    color: "#000",
  },

  selectedText: {
    color: "#0A5875",
    fontWeight: "700",
  },

  doneBtn: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#0A5875",
  },
  
  doneText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
