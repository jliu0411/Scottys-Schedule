import { StyleSheet, TextInput, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard} from 'react-native'
import React, { useState } from 'react'
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import RepeatsDropdown from '../repeatsDropdown';
import { useRouter } from 'expo-router'
import { useBooks } from "../../hooks/useBooks"



const NewTaskForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [timeStarts, setTimeStarts] = useState(new Date());
  const [timeStartsString, setTimeStartsString] = useState("00:00");
  const [timeEnds, setTimeEnds] = useState(new Date());
  const [timeEndsString, setTimeEndsString] = useState("00:00");
  const [repeats, setRepeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { createBook } = useBooks();
  const router = useRouter();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeStartsPicker, setShowTimeStartsPicker] = useState(false);
  const [showTimeEndsPicker, setShowTimeEndsPicker] = useState(false);

  const onDateChange = (event : DateTimePickerEvent, newDate?: Date) => {
    if (newDate) { setDate(newDate); }
    setShowDatePicker(false)
  }
  
  const onTimeStartsChange = (event : DateTimePickerEvent, newTime?: Date) => {
    if (newTime) { 
      setTimeStarts(newTime);
      const hours = newTime.getHours();
      const minutes = newTime.getMinutes();
      const stringTime = `${hours.toString()}:${minutes.toString()}`;
      setTimeStartsString(stringTime)
    setShowTimeStartsPicker(false) }
  }
  const onTimeEndsChange = (event : DateTimePickerEvent, newTime?: Date) => {
    if (newTime) { 
      setTimeEnds(newTime);
      const hours = newTime.getHours();
      const minutes = newTime.getMinutes();
      const stringTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setTimeEndsString(stringTime)
    setShowTimeEndsPicker(false) }
  }

  //TASK CREATION
  const handleCreateTask = async () => {
    if (!name.trim()) {
      alert('Please enter a task name!');
      return;
    } 

    setLoading(true);

    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    );

    await createBook({name, description, date: normalizedDate.toISOString(), timeStarts: timeStartsString, timeEnds: timeEndsString, repeats})

    //reset fields
    setName('');
    setDescription('');
    setDate(new Date());
    setTimeStarts(new Date());
    setTimeStartsString("00:00");
    setTimeEnds(new Date());
    setTimeEndsString("00:00");
    setRepeats([]);

    // redirect
    router.replace('/');

    //reset loading state
    setLoading(false);

    alert('Creating task...');
    
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View>
          <Text style={styles.subheader}> Task Name</Text>
          <TextInput 
            placeholder='ex. Wash Dishes'
            value={name} 
            multiline
            numberOfLines={2}
            maxLength={50}
            onChangeText={setName} 
            style={styles.input} >
          </TextInput>
        </View>
        
          <Text style={styles.subheader}> Description</Text>
          <TextInput 
            placeholder='ex. Rinse pots and load dishwasher' 
            value={description} 
            multiline
            numberOfLines={5}
            maxLength={140}
            onChangeText={setDescription} 
            style={styles.input}>
          </TextInput>

          {/* DATE */}
          <Text style={styles.subheader}> Date</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(!showDatePicker)}>
            <Text style={styles.input}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <RNDateTimePicker 
              value={date} 
              mode={'date'} 
              minimumDate={new Date(2024, 11, 31)}
              onChange={onDateChange} />)
          }

          {/* TIME STARTS */}
          <Text style={styles.subheader}> Time Task Starts</Text>
          <TouchableOpacity onPress={() => setShowTimeStartsPicker(!showTimeStartsPicker)}>
            <Text style={styles.input}>
              {timeStarts.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </Text>
            {showTimeStartsPicker && 
              (<RNDateTimePicker 
                value={timeStarts} 
                mode={'time'} 
                onChange={onTimeStartsChange} />)
            }
          </TouchableOpacity>

          {/* TIME ENDS */}
          <Text style={styles.subheader}>Time Task Ends</Text>
          <TouchableOpacity onPress={() => setShowTimeEndsPicker(!showTimeEndsPicker)}>
            <Text style={styles.input}>
              {timeEnds.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </Text>
            {showTimeEndsPicker && 
              (<RNDateTimePicker 
                value={timeEnds} 
                mode={'time'} 
                minimumDate={timeStarts}
                onChange={onTimeEndsChange} />)
            }
          </TouchableOpacity>

          <Text style={styles.subheader}> Repeats</Text>
          <RepeatsDropdown repeats={repeats}/>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateTask} disabled={loading}>
            <Text style={styles.createButtonText}>
              {loading ? "Saving..." : "Create Task"}
              </Text>
          </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default NewTaskForm

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