import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";

export default function RepeatSelectorSheet({
  visible,
  days,
  selectedDays,
  setSelectedDays,
  onClose,
  anchor, 
}) {
  const toggleDay = (d) => {
    if (selectedDays.includes(d)) {
      setSelectedDays(selectedDays.filter((x) => x !== d));
    } else {
      setSelectedDays([...selectedDays, d]);
    }
  };

  if (!visible) return null;

  const statusBarOffset = Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;
  const dropdownSpacing = 55;

  const anchoredStyle = anchor
    ? {
        position: "absolute",
        top: anchor.y - statusBarOffset + (anchor.height ?? 0) + dropdownSpacing,
        left: anchor.x,
        width: anchor.width,
      }
    : {
        position: "absolute",
        left: "7.5%",
        right: "7.5%",
        top: "25%",
      };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={StyleSheet.absoluteFill}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.card, anchoredStyle]}>
          {days.map((d) => {
            const selected = selectedDays.includes(d);
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.row,
                  selected && styles.rowSelected,
                ]}
                onPress={() => toggleDay(d)}
              >
                <Text
                  style={[
                    styles.text,
                    selected && styles.textSelected,
                  ]}
                >
                  Every {d}
                </Text>
              </TouchableOpacity>
            );
          })}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingTop: 0,
    paddingBottom: 8,
    overflow: "hidden",
    elevation: 8,
    maxHeight: "60%",
  },

  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  rowSelected: {
    backgroundColor: "#E6F1FA",
  },

  text: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Jersey10",
  },

  textSelected: {
    color: "#0A5875",
  },

});

