import React from 'react'
import { View } from 'react-native'
import EditTaskForm from '../components/tasks/editTaskForm'

const EditTask = () => {
  return (
    <View style={{backgroundColor: '#00537A', flex: 1}}>
      <EditTaskForm/>
    </View>
  )
}

export default EditTask