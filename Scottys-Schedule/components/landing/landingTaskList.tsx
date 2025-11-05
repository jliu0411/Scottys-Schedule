import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LandingCurrentTaskCard  from '../landing/landingCurrentTaskCard'

const LandingTaskList = () => {
  return (
    <View style={styles.container}>
      <View style={styles.currentTask}>
        <Text style={styles.currentHeader}>Current Task</Text>
        <LandingCurrentTaskCard name={'Wash dishes'} description={'Load dishwasher'} timeStarts={new Date()} timeEnds={new Date()} isCompleted={false}/>
      </View>

      {/* <View style={styles.upcomingTask}>

      </View> */}
    </View>
  )
}

export default LandingTaskList

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    currentHeader: {
        fontFamily: 'Jersey10',
        backgroundColor: '#F5A201',
        color: '#FFFF',
        fontSize: 16
    },
    currentTask: {
        borderColor: '#000'
    },
    upcomingTask: {
        borderColor: '#0000'
    }
})