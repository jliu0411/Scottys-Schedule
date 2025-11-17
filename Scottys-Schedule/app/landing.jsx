import { Link, Stack, router } from 'expo-router';
import { View, Image, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '../hooks/useUser';
import Scotty from '../assets/scottys/ScottyOMAU.png';
import Room from '../assets/scottys/Room.png';
import Logout from '../assets/scottys/Logout.png';
import ThemedButton from "../components/themes/ThemedButton";
import UserOnly from '../components/auth/UserOnly';
import LandingTaskList from '../components/landing/landingTaskList'
import LandingHeader from '../components/landing/landingHeader'

const Landing = () => {
  const {logout, user, authChecked, setIsLoggingOut } = useUser()

  const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
            router.replace('/(auth)/login')
        } catch (error) {
            console.error("Logout failed:", error)
        } finally {
          setIsLoggingOut(false)
        }
    }

  return (
    <UserOnly>
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
        
      <ThemedButton onPress={handleLogout} style={styles.logoutButton}>
          <Image source={Logout} style={styles.logout} resizeMode="contain"/>
        </ThemedButton>

      <LandingTaskList/>
    </SafeAreaView>

    </UserOnly>
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
    left: 70,
  },
  room: {
    position: 'relative',
    top: -110
  },
  scotty: {
    position: 'absolute', 
    right: 60, 
    top: -50,
    width: 400,
    height: 400
  },
  logout: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 15,
    height: 15
  },
  logoutButton: {
    position: 'absolute',
    width: 20,
    height: 20,
    left: 10,
    top: 0,
    backgroundColor: '#201e2b',
  },
  link: {
    fontFamily: 'Jersey10', 
    fontSize: 30
  }
})