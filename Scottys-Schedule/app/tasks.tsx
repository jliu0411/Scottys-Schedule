import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import { useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import AddButton from '../components/addButton'
import DailyTaskList from '@/components/tasks/dailyTaskList'
import PreviousTaskList from '@/components/tasks/previousTaskList'
import CurrentTaskList from '@/components/tasks/currentTaskList'
import UpcomingTaskList from '@/components/tasks/upcomingTaskList'
import LeftArrow from '../assets/arrows/leftArrow.png'
import RightArrow from '../assets/arrows/rightArrow.png'
import { useBooks } from '../hooks/useBooks'

const Tasks = () => {
  const { fetchTasksByDate } = useBooks();
  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const [currentDate, setCurrentDate] = useState(normalizedToday);
  const [showPrevious, setShowPrevious] = useState(false);
  const isToday = currentDate.valueOf() === normalizedToday.valueOf();

  useEffect(() => {
    fetchTasksByDate(currentDate);
  }, [currentDate, fetchTasksByDate]);

  const handleIncrement = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 0, 0, 0, 0);
    setCurrentDate(newDate);
  }

  const handleDecrement = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0, 0);
    setCurrentDate(newDate);
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerRight: () => <AddButton pathname={'../newTask'}/>,
        }}
      />

      {isToday && 
        <View>
          <Pressable onPress={() => setShowPrevious(!showPrevious)} style={styles.headerSection}>
            <Text style={styles.header}>Previous Tasks</Text>
            <Image 
                source={LeftArrow} 
                style={[styles.link, {transform: [{rotate: showPrevious ? '90deg' : '-90deg'}], marginRight: 30}]} 
                width={20} 
                height={14}
            />
          </Pressable>
      
          {showPrevious && <PreviousTaskList/>}
        
          <Text style={[styles.header, {backgroundColor: '#F5A201'}]}>Current Task</Text>
          <CurrentTaskList/>

          <Text style={[styles.header, {backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
          <UpcomingTaskList/>
        </View>
      }

      {!isToday && 
        <View>
          {(currentDate.valueOf() < today.valueOf()) ?
            <DailyTaskList currentDate={currentDate} today={today} type='Previous' color='#595959'/> 
            :
            <DailyTaskList currentDate={currentDate} today={today} type='Upcoming' color='#013C58'/> 
          }
        </View>
      }

      <SafeAreaView style={styles.bottom} edges={[ 'left', 'right', 'bottom']} >
        <Pressable onPress={handleDecrement} style={styles.link}>
          <Image source={LeftArrow} style={styles.arrow}/>
        </Pressable>
        
        {isToday && <Text style={styles.today}>Today</Text>}

        {!isToday && 
          <Pressable onPress={() => setCurrentDate(normalizedToday)} style={styles.jump}>
            <Text style={styles.jumpText}>Jump to Today</Text>
          </Pressable>
        }

        <View style={{alignItems: 'center'}}>
          <Text style={styles.dateText}>{currentDate.toLocaleDateString([], {weekday:'long'})}</Text>
          <Text style={styles.dateText}>{currentDate.toLocaleDateString([], {month: 'long', day: 'numeric', year: 'numeric'})}</Text>
        </View>
        
        <Pressable onPress={handleIncrement} style={styles.link}>
          <Image source={RightArrow} style={styles.arrow}/>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  )
}

export default Tasks

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00537A'
  },
  bottom: {
    backgroundColor: '#013C58',
    alignItems: 'center',
    paddingTop: 15,
    flexDirection: 'row',
    width: '100%',
    height: '22%',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0
  },
  dateText: {
    fontFamily: 'Jersey10',
    color: '#FFF',
    fontSize: 32
  },
  link: {
    paddingHorizontal: 11
  },
  arrow: {
    width: 55, 
    height: 35
  },
  header: {
    fontFamily: 'Jersey10',
    color: '#FFFF',
    fontSize: 24,
    padding: 8,
    paddingLeft: 20
  },
  today: {
    fontFamily: 'Jersey10',
    color: '#F5A201',
    fontSize: 32,
    position: 'absolute',
    width: '100%',
    alignSelf: 'flex-start',
    textAlign: 'center',
    marginTop: 15
  },
  headerSection: {
    flexDirection: 'row', 
    backgroundColor: '#595959', 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  jump: {
    position: 'absolute', 
    width: '100%', 
    top: 20
  },
  jumpText: {
    fontFamily: 'Jersey10', 
    color: '#F5A201', 
    fontSize: 24, 
    textAlign: 'center', 
    width: '40%', 
    alignSelf: 'center'
  },
})