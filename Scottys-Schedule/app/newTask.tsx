import { StyleSheet, View } from 'react-native'
import React from 'react'
import NewTaskForm  from '@/components/tasks/newTaskForm'

const NewTask = () => {
  return (
    <View style={styles.container}>
      <NewTaskForm />
    </View>
  )
}

export default NewTask

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00537A',
    flex: 1,
  }
})