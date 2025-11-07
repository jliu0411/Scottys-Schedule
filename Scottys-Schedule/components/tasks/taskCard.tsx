import React from 'react'
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

type taskData = {
    name: string,
    description: string,
    timeStarts: Date,
    timeEnds: Date,
    isCompleted: boolean,
    color: string
}

const TaskCard = ({name, description, timeStarts, timeEnds, isCompleted, color} : taskData) => {
  return (
    <View style={[styles.container, {borderColor: color}]}>
      <BouncyCheckbox 
        onPress={(isCompleted: boolean) => {}}
        fillColor={color}
        iconStyle={{borderRadius: 0}}
        innerIconStyle={[styles.checkbox, {borderColor: color}]}
        disableText={true}
        useBuiltInState={true}
        style={{paddingHorizontal: 12, flex: 1}}
      />
    
      <Link href='/editTask' style={styles.link}>
        <View style={styles.innerLink}>
          <View style={styles.taskDataContainer}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>
              {name}
              </Text>
            <Text style={styles.description} numberOfLines={1} ellipsizeMode='tail'>
              {description}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.time}> 
              {timeStarts.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - 
              {timeEnds.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </Text>
          </View>
        </View>
      </Link>
    </View>
  )
};

export default TaskCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    width: '100%',
    borderWidth: 5,
    flexDirection: 'row',
    paddingVertical: 5,
  },
  link: {
    flexDirection: 'row',
    flex: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  }, 
  checkbox: {
    borderRadius: 0, 
    borderWidth: 3,
  },
  innerLink: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Jersey10',
    fontSize: 24,
  },
  description: {
    fontFamily: 'Jersey10',
    fontSize: 18,
    color: '#595959',
  },
  taskDataContainer: {
    width: '55%',
    gap: 2
  },
  time: {
    fontFamily: 'Jersey10', 
    fontSize: 24,
  },
  timeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})