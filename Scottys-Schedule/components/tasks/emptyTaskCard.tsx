import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type emptyTaskProps = {
    type: string,
    color: string
}

const EmptyTaskCard = ({type, color} : emptyTaskProps) => {
  return (
    <View style={styles.container}>
      {(type === 'Upcoming Landing') ? 
        <Text style={[styles.upcoming, {borderColor: color}]}>No Upcoming Tasks</Text> 
        :
        (type === 'Current' ? 
          <Text style={[styles.else, {borderColor: color}]}>No Current Task</Text>
          : 
          <Text style={[styles.else, {borderColor: color}]}>No {type} Tasks</Text> 
        )
      }
    </View>
  )
}

export default EmptyTaskCard

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  else: {
    fontFamily: 'Jersey10',
    fontSize: 24,
    color: '#595959',
    borderWidth: 5,
    paddingVertical: 8, 
    paddingHorizontal: 15,
    backgroundColor: '#FFFF',
  },
  upcoming: {
    fontFamily: 'Jersey10',
    fontSize: 24,
    color: '#595959',   
    borderBottomColor: '#013C58',
    borderWidth: 5,
    paddingVertical: 8, 
    paddingHorizontal: 10,
    backgroundColor: '#FFFF',
  }
})