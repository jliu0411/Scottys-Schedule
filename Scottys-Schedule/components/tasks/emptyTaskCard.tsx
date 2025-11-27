import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type emptyTaskData = {
    type: string,
    color: string
}

const EmptyTaskCard = ({type, color} : emptyTaskData) => {
  return (
    <View style={styles.container}>
      {type === 'Current' ? 
        <Text style={[styles.current, {borderColor: color}]}>No Current Task</Text> : 
        <Text style={[styles.upcoming, {borderColor: color}]}>No Upcoming Tasks</Text>
        }
    </View>
  )
}

export default EmptyTaskCard

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  current: {
    fontFamily: 'Jersey10',
    fontSize: 24,
    color: '#595959',
    borderWidth: 5,
    paddingVertical: 8, 
    paddingHorizontal: 10,
    backgroundColor: '#FFFF',

  },
  upcoming: {
    fontFamily: 'Jersey10',
    fontSize: 24,
    color: '#595959',   
    paddingBottom: 160,
    borderBottomColor: '#013C58',
    borderWidth: 5,
    paddingVertical: 8, 
    paddingHorizontal: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#FFFF',
  }
})