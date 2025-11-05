import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'
import LandingCurrentTask from './landingCurrTaskCard'
import LandingUpcomingTask from './landingNextTaskCard'

const LandingTaskList = () => { 
  return (
    <View style={styles.container}>
      <Link href='/tasks' style={styles.arrow}>
        <Text>Up Arrow</Text>
      </Link>
      
      <Text style={[styles.header,{backgroundColor: '#F5A201'}]}>Current Task</Text>
      <LandingCurrentTask name='Task Name also very long' description='very very long description' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} />
    
      <Text style={[styles.header,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
      <LandingUpcomingTask name='Task Name also very long' description='very very long description' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} />
    </View>
  )
}

export default LandingTaskList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  header: {
    fontFamily: 'Jersey10',
    color: '#FFFF',
    fontSize: 24,
    padding: 7,
    width: '100%'
  },
  arrow: {
    backgroundColor: '#F5A201',
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingLeft: 10,
    color: '#FFFF'
  }
})