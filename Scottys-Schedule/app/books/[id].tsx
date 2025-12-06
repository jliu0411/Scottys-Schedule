import React, { useState } from 'react'
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { StyleSheet, Text, View, TextInput, Pressable, Image } from 'react-native'
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import RepeatsDropdown from '../../components/repeatsDropdown'
import { useBooks } from "../../hooks/useBooks"
import { getNextRepeatDate } from '@/contexts/repeats'

import LeftArrow from '../../assets/arrows/leftArrow.png';

type taskData = {
    $id: string
    name: string,
    description?: string,
    date: Date,
    timeStarts: string,
    timeEnds: string,
    isCompleted: boolean,
    repeats: string[],
}


const EditTaskForm = ({name, description, date, timeStarts, timeEnds, isCompleted, repeats} : taskData) => {
  const { id } = useLocalSearchParams()
  const realId = Array.isArray(id) ? id[0] : id;
  const { deleteBook, updateBook, books } = useBooks()
  const router = useRouter()
  const book = books?.find((b: taskData) => b.$id === realId);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeStartsPicker, setShowTimeStartsPicker] = useState(false);
  const [showTimeEndsPicker, setShowTimeEndsPicker] = useState(false);
  const [taskRepeats, setTaskRepeats] = useState<string[]>(book?.repeats || []);
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (isDeleting) return null; 
  if (!book) return <Text>Book not found.</Text> 
  
  const onDateChange = (event : DateTimePickerEvent, newDate?: Date) => {
    if (newDate) { book.date = newDate; }
    setShowDatePicker(false)
  }
  const onTimeStartsChange = (event : DateTimePickerEvent, newTimeStarts?: Date) => {
    if (newTimeStarts) { {
      const hours = newTimeStarts.getHours().toString().padStart(2, '0')
      const minutes = newTimeStarts.getMinutes().toString().padStart(2, '0')
      book.timeStarts = `${hours}:${minutes}`
    }
    setShowTimeStartsPicker(false) }
  }

  const onTimeEndsChange = (event : DateTimePickerEvent, newTimeEnds?: Date) => {
    if (newTimeEnds) { {
      const hours = newTimeEnds.getHours().toString().padStart(2, '0')
      const minutes = newTimeEnds.getMinutes().toString().padStart(2, '0')
      book.timeEnds = `${hours}:${minutes}`
    }
    setShowTimeEndsPicker(false) }
  }

  const handleDelete = async () => {
    if (!book) return;
    setIsDeleting(true);
    await deleteBook(id);
    router.back();
  }

  const handleSave = async () => {
    if (!book.name.trim()) {
      alert('Please enter a task name!');
      return;
    } 

      let newDate = new Date(book.date);
      if (taskRepeats.length > 0) {
        const now = new Date();
        if (newDate < now) {
          newDate = getNextRepeatDate(now, taskRepeats, book.timeEnds); 
        }
      }

    await updateBook(book.$id, {
      name: book.name,
      description: book.description,
      date: newDate.toISOString(),
      timeStarts: book.timeStarts,
      timeEnds: book.timeEnds,
      repeats: taskRepeats,
      isCompleted: book.isCompleted
    })

    router.back();
  }

  const formatTime = (t?: string | Date) => {
    if (!t) return "--:--";
    if (t instanceof Date) {
      return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    const dateObj = new Date(`1970-01-01T${t}`);
    if (isNaN(dateObj.getTime())) {
      return t;
    }
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };


  return (
    <View style={styles.screen}>
        <Stack.Screen 
            options={{
                headerTitle: "Edit Task",
                headerLeft: () => (
                    <Pressable onPress={() => router.back()} style={{ marginRight: 10 }}>
                        <Image source={LeftArrow} style={{ width: 50, height: 50, resizeMode: 'contain' }}/>
                    </Pressable>
                ),
            }}
        />
        
        <View style={styles.container}>
        <Text style={styles.subheader}> Task Name</Text>
        <TextInput
            placeholder={'Current Task Name'} 
            defaultValue={book.name} 
            multiline
            numberOfLines={2}
            maxLength={50}
            onChangeText={input => (book.name = input)} 
            style={styles.input} >
        </TextInput>

        <Text style={styles.subheader}> Description</Text>
        <TextInput 
            placeholder={'Current Description'} 
            defaultValue={book.description} 
            multiline
            numberOfLines={5}
            maxLength={140}
            onChangeText={input => (book.description = input)} 
            style={styles.input}>
        </TextInput>

        <Text style={styles.subheader}> Date</Text>
        <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
            <Text style={styles.input}>
            {new Date(book.date).toLocaleDateString()}
            </Text>
        </Pressable>
        {showDatePicker && (
            <RNDateTimePicker 
                value={book.date ? new Date(book.date) : new Date()} 
                mode={'date'} 
                minimumDate={new Date(2024, 11, 31)}
                onChange={onDateChange} />)
            }

        <Text style={styles.subheader}> Time Task Starts</Text>
        <Pressable onPress={() => setShowTimeStartsPicker(!showTimeStartsPicker)}>
            <Text style={styles.input}>
            {formatTime(book.timeStarts)}
            </Text>
            {showTimeStartsPicker && 
            (<RNDateTimePicker 
                value={book.timeStarts ? new Date(`1970-01-01T${book.timeStarts}`) : new Date()} 
                mode={'time'} 
                onChange={onTimeStartsChange} />)
            }
        </Pressable>

        <Text style={styles.subheader}>Time Task Ends</Text>
            <Pressable onPress={() => setShowTimeEndsPicker(!showTimeEndsPicker)}>
            <Text style={styles.input}>
                {formatTime(book.timeEnds)}
            </Text>
            {showTimeEndsPicker && 
                (<RNDateTimePicker 
                value={book.timeEnds ? new Date(`1970-01-01T${book.timeEnds}`) : new Date()} 
                mode={'time'} 
                minimumDate={book.timeStarts ? new Date(`1970-01-01T${book.timeStarts}`) : undefined}
                onChange={onTimeEndsChange} />)
            }
            </Pressable>

            <Text style={styles.subheader}> Repeats</Text>
            <Text style={styles.selectedTextStyle}>{taskRepeats.length === 0 ? 'N/A' : book.repeats?.join(', ')}</Text>
            <RepeatsDropdown repeats={taskRepeats} setRepeats={(days) => setTaskRepeats(days)}/>

            <Pressable onPress={handleSave} style={styles.createButton} >
            <Text style={styles.createButtonText}>Save Changes</Text>
            </Pressable>

            <Pressable onPress={handleDelete} style={styles.deleteButton} >
            <Text style={styles.createButtonText}>Delete</Text>
            </Pressable>
        </View>
    </View>
  )
}

export default EditTaskForm

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#00537A',
  },
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
    marginVertical: 9,
  },
  deleteButton: {
    backgroundColor: '#F52A01',
    color: '#FFFF',
    marginHorizontal: 90,
    marginVertical: 9,
  },
  createButtonText: {
    fontFamily: 'Jersey10',
    fontSize: 30,
    textAlign: 'center'
  },
  selectedTextStyle: {
    marginHorizontal: 50,
    fontSize: 14,
    fontFamily: 'Jersey10'
  },
})

