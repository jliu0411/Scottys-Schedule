import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type taskData = {
    name: string,
    description: string,
    timeStarts: Date,
    timeEnds: Date,
    isCompleted: boolean,
    repeats: string[]
}

const EditTaskMenu = ({name, description, timeStarts, timeEnds, isCompleted, repeats} : taskData) => {
  return (
    <View>
      <Text>EditTaskMenu</Text>
    </View>
  )
}

export default EditTaskMenu

const styles = StyleSheet.create({})