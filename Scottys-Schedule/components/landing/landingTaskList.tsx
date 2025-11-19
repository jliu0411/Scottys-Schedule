import { StyleSheet, Text, View, FlatList, Pressable, Image } from 'react-native'
import { Link } from 'expo-router'
import React, { useState, useEffect } from 'react'
import UpArrow from "../../assets/arrows/upArrow.png"
import TaskCard from '../tasks/taskCard';
import { useBooks } from '../../hooks/useBooks';

const LandingTaskList = () => { 
  const date = new Date();
  const [ currentTasks, setCurrentTasks ] = useState(null);
  const [ upcomingTasks, setUpcomingTasks ] = useState(null);
  const { fetchCurrentTasks } = useBooks();
  const { fetchUpcomingTasks }= useBooks();

  useEffect(() => {
    async function loadCurrentTasks() {
      const tasksData = await fetchCurrentTasks(date)
      setCurrentTasks(tasksData)
    }
    loadCurrentTasks()
  }, [])

  useEffect(() => {
    async function loadUpcomingTasks() {
      const tasksData = await fetchUpcomingTasks(date)
      setUpcomingTasks(tasksData)
    }
    loadUpcomingTasks()
  }, [])


  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <Text style={[styles.header,{backgroundColor: '#F5A201'}]}>Current Task</Text>
        <Link href='/tasks' style={styles.arrowContainer}>
          {/* <Entypo name="arrow-up" size={48} color="white"/> */}
          <Image source={UpArrow}/>
        </Link>
      </View>

    
      <FlatList 
        data={currentTasks}
        keyExtractor={(item => item.$id)}
        renderItem={({ item }) => (
          <Pressable>
            <TaskCard name={item.name} description={item.description} timeStarts={item.timeStarts ? new Date(item.timeStarts) : new Date()}
            timeEnds={item.timeEnds ? new Date(item.timeEnds) : new Date()} isCompleted={false} color={'#F5A201'}/>
          </Pressable>
        )}
      />
    
      <Text style={[styles.header,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>

      <FlatList 
        data={upcomingTasks}
        keyExtractor={(item => item.$id)}
        renderItem={({ item }) => (
          <Pressable>
            <TaskCard name={item.name} description={item.description} timeStarts={item.timeStarts ? new Date(item.timeStarts) : new Date()}
            timeEnds={item.timeEnds ? new Date(item.timeEnds) : new Date()} isCompleted={false} color={'#013C58'}/>
          </Pressable>
        )}
      />

      {/* <Text style={[styles.header,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
      <TaskCard name='Short Task Name' description='A short task description' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
      <TaskCard name='Task w/o Description' description='' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
      <TaskCard name='Another Task Name' description='A very very long description that also needs to get cut off' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/> */}
    </View>
  )
}

export default LandingTaskList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderBottomWidth: 14,
    borderBottomColor: '#013C58'
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