import { StyleSheet, Text, View, Image } from 'react-native'
import Scotty from '../assets/scottys/scottyA.png'
import Room from '../assets/scottys/Room.png'
import { Link } from 'expo-router'

const Landing = () => {
  return (
    <View style={styles.container}>
      <Image source={Room} />
      <Image source={Scotty} style={{position: "absolute", right: 50, marginVertical: 20}} />
      <Link href='/alarms'>Alarms</Link>
      <Link href='/newAlarm'>New Alarm</Link>
      <Link href='/tasks'>Tasks</Link>
      <Link href='/newTask'>New Task</Link>
      <Link href='/logIn'>Log In</Link>
      <Link href='/signUp'>Sign Up</Link>
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