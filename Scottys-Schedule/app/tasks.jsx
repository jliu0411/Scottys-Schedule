import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native'
import React from 'react'
import { Stack, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import TaskCard from '../components/tasks/taskCard'
import AddButton from '../components/addButton'
import Entypo from '@expo/vector-icons/Entypo'
import { useBooks } from '../hooks/useBooks'


const Tasks = () => {
  const { books } = useBooks()

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerRight: () => <AddButton pathname={'/newTask'}/>,
        }}
      />

      <FlatList 
        data={books}
        keyExtractor={(item => item.$id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable>
            <TaskCard name={item.name} description={item.description} timeStarts={item.timeStarts ? new Date(item.timeStarts) : new Date()}
            timeEnds={item.timeEnds ? new Date(item.timeEnds) : new Date()} isCompleted={false} color={'#013C58'}/>
          </Pressable>
        )}
      />
      <View style={styles.alarmContainer}>
          <Text style={styles.nextAlarm}>Next Alarm:</Text>
          <Text style={styles.alarmTime}>6:00 AM</Text>
      </View>
      
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