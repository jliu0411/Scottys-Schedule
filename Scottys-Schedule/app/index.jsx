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

      <ThemedText style={styles.title} title={true}>Scotty's Schedule</ThemedText>
      
      <Spacer height={100}/>

      <Link href='/login' style= {styles.link}>
        <ThemedText>Log In</ThemedText>
      </Link>

      <Link href='/register' style= {styles.link}>
        <ThemedText>Register</ThemedText>
      </Link>

      <Link href='/landing' style= {styles.link}>
        <ThemedText>View Landing</ThemedText>
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
    fontSize: 40,
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