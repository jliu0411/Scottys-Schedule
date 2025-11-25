import React from 'react'
import { useBooks } from '../../hooks/useBooks'
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'


type taskData = {
    id: string,
    name: string,
    description: string,
    timeStarts: string,
    timeEnds: string,
    isCompleted: boolean,
    color: string
}
const formatTime = (t?: string | Date) => {
  if (!t) return "--:--";
  if (t instanceof Date) {
    return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const dateObj = new Date(`1970-01-01T${t}`);
  if (isNaN(dateObj.getTime())) {
    return t;
  }
  return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const TaskCard = ({id, name, description, timeStarts, timeEnds, isCompleted, color} : taskData) => {
  const { books } = useBooks()
  const router = useRouter()

  return (
    <View style={[styles.container, {borderColor: color}]}>
      <BouncyCheckbox 
        onPress={(isCompleted) => {}}
        fillColor={color}
        iconStyle={{borderRadius: 0}}
        innerIconStyle={[styles.checkbox, {borderColor: color}]}
        disableText={true}
        useBuiltInState={true}
        style={{paddingHorizontal: 12, flex: 1}}
      />
    
      <Pressable onPress={() => router.push(`/books/${id}`)} style={styles.link}>
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
            {formatTime(timeStarts)} - {formatTime(timeEnds)}
          </Text>

          </View>
        </View>
      </Pressable>
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