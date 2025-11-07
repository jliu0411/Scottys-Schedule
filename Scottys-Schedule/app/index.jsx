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
      <Text style={styles.date}>{new Date().toLocaleDateString([], {weekday:'long', month: 'long', day: 'numeric', year: 'numeric'})}</Text>
      <Image source={Room} />
      <Image source={Scotty} style={styles.image} />
      <View style={{position: 'absolute', top:0}}>
        <Link href='/newAlarm' style= {styles.link}>New Alarm</Link>
        <Link href='/logIn' style= {styles.link}>Log In</Link>
        <Link href='/signUp' style= {styles.link}>Sign Up</Link>
      </View>
        
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