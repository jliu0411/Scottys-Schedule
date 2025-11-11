import {StyleSheet, Image} from 'react-native'
import {Link} from 'expo-router'

import Spacer from "../components/themes/Spacer"
import ThemedView from "../components/themes/ThemedView"
import ThemedText from "../components/themes/ThemedText"
import Logo from '../assets/scottys/scottyHead.png'

const Home = () => {
  return (
    <ThemedView style={styles.container}>
      <Image source={Logo}/>

      <Spacer height={10}/>

      <ThemedText style={styles.title}>Scotty's Schedule</ThemedText>
      
      <Spacer height={80}/>

      <Link href='/login' style= {styles.link}>
        <ThemedText style= {styles.link}>Log In</ThemedText>
      </Link>

      <Link href='/register' style= {styles.link}>
        <ThemedText style= {styles.link}>Register</ThemedText>
      </Link>

      <Link href='/landing'>
        <ThemedText style= {styles.link}>View Landing</ThemedText>
      </Link>
    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00537A',
    gap: 2,
  },
  title: {
    fontFamily: 'Jersey10',
    color: '#f5a201',
    fontSize: 60,
  },
  image: {
    position: "absolute", 
    right: 50, 
    top: 170
  },
  link: {
    fontFamily: 'Jersey10',
    color: '#ffffff',
    fontSize: 30
  }
})