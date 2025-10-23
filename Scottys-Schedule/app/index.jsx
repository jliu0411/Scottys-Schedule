import { StyleSheet, Text, View, Image } from 'react-native'
import Scotty from '../assets/scottys/ScottyCMAU.png'
import Room from '../assets/scottys/Room.png'
import { Link, Stack } from 'expo-router'
import { AlarmScreenButton } from '../components/alarms/alarmScreenButton'

const Landing = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: props => <AlarmScreenButton {...props}/>}} 
      />
      <Image source={Room} />
      <Image source={Scotty} style={styles.image} />
      <Link href='/alarms' style= {styles.link}>Alarms</Link>
      <Link href='/newAlarm' style= {styles.link}>New Alarm</Link>
      <Link href='/tasks' style= {styles.link}>Tasks</Link>
      <Link href='/newTask' style= {styles.link}>New Task</Link>
      <Link href='/logIn' style= {styles.link}>Log In</Link>
      <Link href='/signUp' style= {styles.link}>Sign Up</Link>
    </View>
  )
}

export default Landing

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00537A',
    gap: 2,
  },
  image: {
    position: "absolute", 
    right: 50, 
    top: 170
  },
  link: {
    fontFamily: 'Jersey10', 
    fontSize: 30
  }
})