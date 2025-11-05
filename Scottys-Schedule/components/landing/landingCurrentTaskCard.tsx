import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { CheckOutlined, CheckSquareFilled } from '@ant-design/icons'
import EditTaskMenu from '../tasks/editTaskMenu'
//import { YellowMenu } from '@/assets/buttons/yellowMenu.png'

interface TaskData {
    name: string,
    description: string,
    timeStarts: Date,
    timeEnds: Date,
    isCompleted: boolean
}

const LandingCurrentTaskCard = ({name, description, timeStarts, timeEnds, isCompleted} : TaskData) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const onPressCheckbox = () => {
    isCompleted = !isCompleted;
  }
  
  return (
    <View style={styles.container}>
        <Pressable onPress={onPressCheckbox}>
          {isCompleted && <CheckSquareFilled/>}
          {!isCompleted && <CheckOutlined/>}
        </Pressable>

        <View>
          <Text style={[styles.text, {fontSize: 24}]}>{name}</Text>
          <Text style={[styles.text, {opacity: 65, fontSize: 16}]}>{description}</Text>
        </View>

        <Text style={{fontSize: 20}}>{timeStarts.toLocaleDateString()} : {timeEnds.toLocaleDateString()}</Text>

        <Pressable onPress={() => setShowEditMenu(!showEditMenu)}>
        </Pressable>

        {showEditMenu && 
          <EditTaskMenu/>
        }
    </View>
  )
}

export default LandingCurrentTaskCard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    }, 
    check: {
      color: '#F5A201'
    },
    text: {
      fontFamily: 'Jersey10'
    }
})