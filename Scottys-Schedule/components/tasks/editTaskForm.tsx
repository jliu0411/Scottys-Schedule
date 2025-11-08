import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import RepeatsDropdown from '../repeatsDropdown'

type taskData = {
    name: string,
    description: string,
    date: Date,
    timeStarts: Date,
    timeEnds: Date,
    isCompleted: boolean,
    repeats: string[]
}

const EditTaskForm = ({name, description, date, timeStarts, timeEnds, isCompleted, repeats} : taskData) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeStartsPicker, setShowTimeStartsPicker] = useState(false);
  const [showTimeEndsPicker, setShowTimeEndsPicker] = useState(false);
  
  const onNameChange = (event : DateTimePickerEvent, newName?: string) => {
    if (newName) { name = newName; }
  }
  const onDescriptionChange = (event : DateTimePickerEvent, newDescription?: string) => {
    if (newDescription) { description = newDescription; }
  }
  const onDateChange = (event : DateTimePickerEvent, newDate?: Date) => {
    if (newDate) { date = newDate; }
  }
  const onTimeStartsChange = (event : DateTimePickerEvent, newTimeStarts?: Date) => {
    if (newTimeStarts) { timeStarts = newTimeStarts; }
  }
  const onTimeEndsChange = (event : DateTimePickerEvent, newTimeEnds?: Date) => {
    if (newTimeEnds) { timeEnds = newTimeEnds; }
  }
  
  return (
    <View style={styles.container}>
      
      <Text style={styles.subheader}> Task Name</Text>
      <TextInput
        placeholder={name} 
        defaultValue={name} 
        multiline
        numberOfLines={2}
        maxLength={50}
        onChangeText={input => onNameChange} 
        style={styles.input} >
      </TextInput>

      <Text style={styles.subheader}> Description</Text>
      <TextInput 
        placeholder={description} 
        defaultValue={description} 
        multiline
        numberOfLines={5}
        maxLength={140}
        onChangeText={input => onDescriptionChange} 
        style={styles.input}>
      </TextInput>

      <Text style={styles.subheader}> Date</Text>
      <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
        <Text style={styles.input}>
          {/* {date.toLocaleDateString()} */}
          date
        </Text>
      </Pressable>
      {showDatePicker && (
          <RNDateTimePicker 
            value={date} 
            mode={'date'} 
            minimumDate={new Date(2024, 11, 31)}
            onChange={onDateChange} />)
        }

      <Text style={styles.subheader}> Time Task Starts</Text>
      <Pressable onPress={() => setShowTimeStartsPicker(!showTimeStartsPicker)}>
        <Text style={styles.input}>
          {/* {timeStarts.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} */}
          time starts
        </Text>
        {showTimeStartsPicker && 
          (<RNDateTimePicker 
            value={timeStarts} 
            mode={'time'} 
            onChange={onTimeStartsChange} />)
        }
      </Pressable>

      <Text style={styles.subheader}>Time Task Ends</Text>
        <Pressable onPress={() => setShowTimeEndsPicker(!showTimeEndsPicker)}>
          <Text style={styles.input}>
            {/* {timeEnds.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} */}
            time ends
          </Text>
          {showTimeEndsPicker && 
            (<RNDateTimePicker 
              value={timeEnds} 
              mode={'time'} 
              minimumDate={timeStarts}
              onChange={onTimeEndsChange} />)
          }
        </Pressable>

        <Text style={styles.subheader}> Repeats</Text>
        <RepeatsDropdown repeats={repeats}/>

        <Pressable style={styles.createButton} >
          <Text style={styles.createButtonText}>Save Changes</Text>
        </Pressable>
    </View>
  )
}

export default EditTaskForm

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFF',
    marginHorizontal: 35,
    marginVertical: 20,
    paddingVertical: 20
  },
  subheader: {
    fontFamily: 'Jersey10',
    fontSize: 20,
    marginHorizontal: 40,
    paddingBottom: 4
  },
  input: {
    marginHorizontal: 40,
    marginBottom: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    fontFamily: 'Jersey10',
    fontSize: 18,
    color: '#858484ff',
  },
  createButton: {
    backgroundColor: '#F5A201',
    color: '#FFFF',
    marginHorizontal: 90,
  },
  createButtonText: {
    fontFamily: 'Jersey10',
    fontSize: 30,
    textAlign: 'center'
  }
})