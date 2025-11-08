import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { MultiSelect } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

const data = [
  { label: 'Sunday', value: 'Sunday' },
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' }
]

interface RepeatsProps {
  repeats: string[]
}

const RepeatsDropdown = ({repeats} : RepeatsProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const setRepeats = (selected: string[]) => {
    repeats = selected;
  }

  return (
    <View style={styles.container}>
      <MultiSelect
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          labelField="label"
          valueField="value"
          placeholder=" Select days"
          value={selected}
          onChange={(item) => {
            setSelected(item);
            setRepeats(selected);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color="black"
              size={20}
            />
          )}
          selectedStyle={styles.selectedStyle}
        />
    </View>
  )
};

export default RepeatsDropdown

const styles = StyleSheet.create({
    container: { 
      marginHorizontal: 40,
      paddingBottom: 25,
    },
    dropdown: {
      height: 50,
      backgroundColor: 'transparent',
      borderBottomColor: 'gray',
      borderBottomWidth: 0.5,
    },
    placeholderStyle: {
      fontSize: 20,
      fontFamily: 'Jersey10',
    },
    selectedTextStyle: {
      fontSize: 14,
      fontFamily: 'Jersey10'
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
      fontFamily: 'Jersey10'
    },
    icon: {
      marginRight: 5,
    },
    selectedStyle: {
      borderRadius: 0,
      fontFamily: 'Jersey10'
    },
  });