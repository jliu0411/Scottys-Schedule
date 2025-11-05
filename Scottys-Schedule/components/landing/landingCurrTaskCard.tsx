import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
//import EditTaskMenu from '../tasks/editTaskMenu'

type taskData = {
    name: string,
    description: string,
    timeStarts: Date,
    timeEnds: Date,
    isCompleted: boolean
}

const LandingCurrentTask = ({name, description, timeStarts, timeEnds, isCompleted} : taskData) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const onPressCheckbox = (checked: boolean) => {
    isCompleted = checked;
  }
  
  return (
    <View style={styles.container}>
      

      <View style={styles.taskContainer}>
        <Pressable onPress={() => onPressCheckbox(!isCompleted)}>
        </Pressable>

        <View style={styles.nameDescriptionContainer}>
          <Text style={styles.name}>
            {name.substring(0,15)}
            </Text>
          <Text style={styles.description}>
            {description.substring(0,20)}
          </Text>
        </View>

        <Text style={styles.time}>
          {timeStarts.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - 
          {timeEnds.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>

        <Pressable onPress={() => setShowEditMenu(!showEditMenu)}>
          <Text>Menu</Text>
        </Pressable>

        {/* {showEditMenu && 
          <EditTaskMenu/>
        } */}
      </View>
        
    </View>
  )
};

export default LandingCurrentTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    height: 20
  }, 
  
  taskContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFF',
    gap: 20
  },
  name: {
    fontFamily: 'Jersey10',
    fontSize: 24
  },
  description: {
    fontFamily: 'Jersey10',
    fontSize: 18,
    color: '#595959'
  },
  nameDescriptionContainer: {
    flex: 1,
    marginEnd: 10, 
    alignSelf: 'center', 
  },
  time: {
    fontFamily: 'Jersey10',
    fontSize: 24,
    alignSelf: 'center'
  }
})