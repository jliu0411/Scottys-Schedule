import { StyleSheet, Text, View, FlatList, Pressable, Image } from 'react-native'
import { Link } from 'expo-router'
import React, { useState, useEffect } from 'react'
import UpArrow from "../../assets/arrows/upArrow.png"
import TaskCard from '../tasks/taskCard';
import EmptyTaskCard from '../tasks/emptyTaskCard';
import { useBooks } from '../../hooks/useBooks';
import { phrases } from './phrases';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListProps = {
  handleComplete: () => void,
}

const LandingTaskList = ({handleComplete} : ListProps) => { 
  const date = new Date();
  const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  const [ currentTasks, setCurrentTasks ] = useState(null);
  const [ upcomingTasks, setUpcomingTasks ] = useState(null);
  const { fetchCurrentTasks } = useBooks();
  const { fetchUpcomingTasks } = useBooks();

  useEffect(() => {
    async function loadCurrentTasks() {
      const tasksData = await fetchCurrentTasks(date, currentTime);
      console.log('current tasks: ', tasksData);
      setCurrentTasks(tasksData);
    }
    loadCurrentTasks();
  })

  useEffect(() => {
    async function loadUpcomingTasks() {
      const tasksData = await fetchUpcomingTasks(date, currentTime);
      console.log('upcoming tasks: ', tasksData);
      setUpcomingTasks(tasksData);
    }
    loadUpcomingTasks();
  }, )


  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container} >
      <View style={{flexDirection: 'row'}}>
        <Text style={[styles.header,{backgroundColor: '#F5A201'}]}>Current Task</Text>
        <Link href='/tasks' style={styles.arrowContainer}>
          <Image source={UpArrow}/>
        </Link>
      </View>

      {(currentTasks === undefined) || (currentTasks === null) ? <EmptyTaskCard type='Current' color={'#F5A201'}/> : <FlatList 
        data={currentTasks}
        keyExtractor={(item => item.$id)}
        renderItem={({ item }) => (
          <Pressable>
            <TaskCard 
              id={item.$id}
              name={item.name} 
              description={item.description} 
              timeStarts={item.timeStarts} 
              timeEnds={item.timeEnds} 
              isCompleted={false} 
              handleComplete={handleComplete}
              color={'#F5A201'}/>
          </Pressable>
        )}
      />}
    
      <Text style={[styles.header,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
      
      {(upcomingTasks === undefined) || (upcomingTasks === null) ? <EmptyTaskCard type='Upcoming' color={'#013C58'}/> : <FlatList 
        data={upcomingTasks}
        keyExtractor={(item => item.$id)}
        renderItem={({ item }) => (
          <Pressable>
            <TaskCard 
              id={item.$id}
              name={item.name} 
              description={item.description} 
              timeStarts={item.timeStarts}
              timeEnds={item.timeEnds} 
              isCompleted={false} 
              handleComplete={handleComplete}
              color={'#013C58'}/>
          </Pressable>
        )}
      />}
      
    </SafeAreaView>
  )
}

export default LandingTaskList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderBottomWidth: 14,
    borderBottomColor: '#013C58',
    backgroundColor: '#013C58',
  },
  header: {
    fontFamily: 'Jersey10',
    color: '#FFFF',
    fontSize: 24,
    padding: 8,
    paddingLeft: 12,
    width: '100%'
  },
  arrowContainer: {
    backgroundColor: '#F5A201',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    position: 'absolute',
    right: 0,
    marginBottom: 5,
    padding: 10,
    width: 50,
    height: 65
  },
})