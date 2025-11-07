import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, Image, View, Text } from 'react-native'
import { Link, Stack } from 'expo-router'

import Scotty from '../assets/scottys/ScottyCMAU.png'
import Room from '../assets/scottys/Room.png'
import LandingTaskList from '../components/landing/landingTaskList'
import LandingHeader from '../components/landing/landingHeader'

const Landing = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          header: () => <LandingHeader/>
        }} 
      />

      <View style={{position: 'absolute'}}>
        <Image source={Room} style={styles.room} />
        <Image source={Scotty} style={styles.scotty} />
      </View>
      
      <Text style={styles.date}>{new Date().toLocaleDateString([], {weekday:'long', month: 'long', day: 'numeric', year: 'numeric'})}</Text>

      {/* <View style={{position: 'absolute', top:0}}>
        <Link href='/newAlarm' style= {styles.link}>New Alarm</Link>
        <Link href='/logIn' style= {styles.link}>Log In</Link>
        <Link href='/signUp' style= {styles.link}>Sign Up</Link>
      </View> */}
        
      <LandingTaskList/>
    </SafeAreaView>
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
  date: {
    fontFamily: 'Jersey10',
    fontSize: 30,
    color: '#FFF',
    position: 'absolute',
    top: 15,
  },
  room: {
    position: 'relative',
    top: -110
  },
  scotty: {
    position: 'absolute', 
    right: 60, 
    top: -50
  },
  link: {
    fontFamily: 'Jersey10', 
    fontSize: 30
  }
})