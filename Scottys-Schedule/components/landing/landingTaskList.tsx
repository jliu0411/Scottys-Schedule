import { StyleSheet, Text, View, FlatList, Pressable, Image } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'
import UpArrow from "../../assets/arrows/upArrow.png"
import TaskCard from '../tasks/taskCard';
import EmptyTaskCard from '../tasks/emptyTaskCard';
import { useBooks } from '../../hooks/useBooks';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListProps = {
  handlePhrase: () => void,
}

const LandingTaskList = ({handlePhrase} : ListProps) => { 
  const { currentTasks, upcomingTasks } = useBooks();

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container} >
      <View>
        <Text style={[styles.header,{backgroundColor: '#F5A201'}]}>Current Task</Text>
        <Link href='../tasks' style={styles.arrowContainer}>
          <Image source={UpArrow}/>
        </Link>
      </View>

      <View>
        {currentTasks.length === 0 ? <EmptyTaskCard type='Current' color={'#F5A201'}/> : 
          <FlatList 
            data={currentTasks}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <Pressable>
                <TaskCard 
                  id={item.$id}
                  name={item.name} 
                  description={item.description} 
                  timeStarts={item.timeStarts} 
                  timeEnds={item.timeEnds} 
                  isCompleted={item.isCompleted} 
                  handlePhrase={handlePhrase}
                  color={'#F5A201'}/>
              </Pressable>
            )}
          />
        }
      </View>
      
    
      <Text style={[styles.header,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
      
      <View>
        {upcomingTasks.length === 0 ? <EmptyTaskCard type='Upcoming' color={'#013C58'}/> :
          <FlatList 
          data={upcomingTasks}
          keyExtractor={(item => item.$id)}
          renderItem={({ item }) => (
            <Pressable>
              <TaskCard 
                id={item.$id}
                name={item.name} 
                description={item.description} 
                timeStarts={item.timeStarts}
                timeEnds={item.timeEnds} 
                isCompleted={item.isCompleted} 
                handlePhrase={handlePhrase}
                color={'#013C58'}/>
            </Pressable>
            )}
          />
        }
      </View>
    </SafeAreaView>
  )
}

export default LandingTaskList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '50%',
    position: 'absolute',
    bottom: 0,
    borderBottomWidth: 14,
    borderBottomColor: '#013C58',
    backgroundColor: '#013C58',
  },
  header: {
    fontFamily: 'Jersey10',
    color: '#FFFF',
    fontSize: 24,
    padding: 8,
    paddingLeft: 12,
    width: '100%',
  },
  arrowContainer: {
    backgroundColor: '#F5A201',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    position: 'absolute',
    right: 0,
    marginBottom: 50,
    padding: 10,
    width: 50,
    height: 65,
    bottom: -50
  },
})