import React from 'react'
import { Stack, Link } from 'expo-router'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TaskCard from '../components/tasks/taskCard'
import AddButton from '../components/addButton'
import Entypo from '@expo/vector-icons/Entypo'

const Tasks = () => {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerRight: () => <AddButton pathname={'/newTask'}/>,
        }}
      />

      <ScrollView style={styles.tasks}>
        <Text style={[styles.subheader,{backgroundColor: '#F5A201'}]}>Current Task</Text>
        <TaskCard name='Task 1 With a Very Long Name That Needs to be Cut ' description='A very very long description that also needs to get cut off' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#F5A201'}/>
        <Text style={[styles.subheader,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
        <TaskCard name='Short Task Name' description='A short task description' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
        <TaskCard name='Task w/o Description' description='' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
        <TaskCard name='Another Task Name' description='A very very long description that also needs to get cut off' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
        <TaskCard name='Another Task Name' description='A very very long description that also needs to get cut off' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
        
        <View style={styles.alarmContainer}>
          <Text style={styles.nextAlarm}>Next Alarm:</Text>
          <Text style={styles.alarmTime}>6:00 AM</Text>
        </View>
      </ScrollView>
      
      <SafeAreaView style={styles.bottom} edges={[ 'left', 'right', 'bottom']} >
        <Link href=''> <Entypo name='arrow-left' color={'#FFF'} size={80} /> </Link>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.dateText}>{new Date().toLocaleDateString([], {weekday:'long'})}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'})}</Text>
        </View>
        <Link href=''> <Entypo name='arrow-right' color={'#FFF'} size={80}/> </Link>
      </SafeAreaView>

    </SafeAreaView>
  )
}

export default Tasks

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  }
})