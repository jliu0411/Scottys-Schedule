import React from "react";
import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TimePickerSheet({ visible, time, onChange, onClose }) {
  if (!visible) return null;

  const handleChange = (event, selected) => {
    if (Platform.OS === "android") {
      onClose && onClose();
    }

    if (selected) {
      onChange(selected);
    }
  };

  return (
    <DateTimePicker
      value={time}
      mode="time"
      onChange={handleChange}
    />
  );
}
