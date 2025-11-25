import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'
import React, {useState} from 'react'
import UpArrow from "../../assets/arrows/upArrow.png"
import TaskCard from '../tasks/taskCard';
import { phrases } from './phrases';

type ListProps = {
  handleComplete: () => void,
}

const LandingTaskList = ({handleComplete} : ListProps) => { 
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <Text style={[styles.header,{backgroundColor: '#F5A201'}]}>Current Task</Text>
        <Link href='/tasks' style={styles.arrowContainer}>
          <Image source={UpArrow}/>
        </Link>
      </View>
      <TaskCard handleComplete={handleComplete} id={'1'} name='Task 1 With a Very Long Name That Needs to be Cut ' description='A very very long description that also needs to get cut off' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#F5A201'} />
    
      <Text style={[styles.header,{backgroundColor: '#013C58'}]}>Upcoming Tasks</Text>
      <TaskCard handleComplete={handleComplete} id={'2'} name='Short Task Name' description='A short task description' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'} />
      <TaskCard handleComplete={handleComplete} id={'3'} name='Task w/o Description' description='' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'} />
      <TaskCard handleComplete={handleComplete} id={'4'} name='Another Task Name' description='A very very long description that also needs to get cut off' timeStarts={new Date()} timeEnds={new Date()} isCompleted={false} color={'#013C58'}/>
    </View>
  )
}

export default LandingTaskList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderBottomWidth: 14,
    borderBottomColor: '#013C58'
  },
  header: {
    fontFamily: 'Jersey10',
    color: '#FFFF',
    fontSize: 24,
    padding: 8,
    paddingLeft: 12,
    width: '100%'
  },
  arrowContainer: {
    backgroundColor: '#F5A201',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    position: 'absolute',
    right: 0,
    marginBottom: 5,
    padding: 10,
    width: 50,
    height: 65
  },
})