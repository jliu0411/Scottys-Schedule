import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native'
import React from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import TaskCard from '../components/tasks/taskCard';
import { useBooks } from '../hooks/useBooks'


const Tasks = () => {
  const { books } = useBooks()

  return (
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
  )
}

export default Tasks

const styles = StyleSheet.create({})