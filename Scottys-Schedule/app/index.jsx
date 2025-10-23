import { StyleSheet, Text, View, Image } from 'react-native'
import Scotty from '../assets/scottys/scottyA.png'
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
      <Image source={Scotty} style={{position: "absolute", right: 50, top: 170}} />
      <Link href='/newAlarm' style= {{fontFamily: 'Jersey10', fontSize: 30}}>New Alarm</Link>
      <Link href='/tasks' style= {{fontFamily: 'Jersey10', fontSize: 30}}>Tasks</Link>
      <Link href='/newTask' style= {{fontFamily: 'Jersey10', fontSize: 30}}>New Task</Link>
      <Link href='/logIn' style= {{fontFamily: 'Jersey10', fontSize: 30}}>Log In</Link>
      <Link href='/signUp' style= {{fontFamily: 'Jersey10', fontSize: 30}}>Sign Up</Link>
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
})