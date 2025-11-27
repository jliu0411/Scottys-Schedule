import { StyleSheet, Text, View, FlatList, Pressable, Image, Task } from 'react-native'
import React from 'react'
import { Stack, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import TaskCard from '../components/tasks/taskCard'
import AddButton from '../components/addButton'
import LeftArrow from '../assets/arrows/leftArrow.png'
import RightArrow from '../assets/arrows/rightArrow.png'
import { useBooks } from '../hooks/useBooks'

const Tasks = () => {
  const { books } = useBooks()

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerRight: () => <AddButton pathname={'../newTask'}/>,
        }}
      />

      <FlatList 
        data={books}
        keyExtractor={(item => item.$id)}
        renderItem={({ item }) => (
          <Pressable>
            <TaskCard id={item.$id} name={item.name} description={item.description} timeStarts={item.timeStarts}
            timeEnds={item.timeEnds} isCompleted={item.isCompleted} color={'#013C58'} />
          </Pressable>
        )}
      />
      <View style={styles.alarmContainer}>
          <Text style={styles.nextAlarm}>Next Alarm:</Text>
          <Text style={styles.alarmTime}>6:00 AM</Text>
      </View>
      
      <SafeAreaView style={styles.bottom} edges={[ 'left', 'right', 'bottom']} >
        <Link href='../alarms' style={styles.link}> <Image source={LeftArrow} style={styles.arrow}/> </Link>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.dateText}>{new Date().toLocaleDateString([], {weekday:'long'})}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'})}</Text>
        </View>
        <Link href='../alarms' style={styles.link}> <Image source={RightArrow} style={styles.arrow}/> </Link>
      </SafeAreaView>

    </SafeAreaView>
  )
}

export default Tasks

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00537A'
  },
  subheader: {
    fontFamily: 'Jersey10',
    color: '#FFFF',
    fontSize: 24,
    padding: 4,
    paddingLeft: 12,
    width: '100%'
  },
  tasks: {
    backgroundColor: '#00537A',
  },
  bottom: {
    backgroundColor: '#013C58',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  dateText: {
    fontFamily: 'Jersey10',
    color: '#FFF',
    fontSize: 32
  },
  alarmContainer: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingTop: 5,
    marginHorizontal: 90,
    marginVertical: 20
  },
  nextAlarm: {
    fontFamily: 'Jersey10',
    fontSize: 20
  },
  alarmTime: {
    fontFamily: 'Jersey10',
    fontSize: 64
  },
  link: {
    paddingHorizontal: 11
  },
  arrow: {
    width: 55, 
    height: 35
  }
})