import { Link, Stack, router } from 'expo-router';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useUser } from '../hooks/useUser';
import Scotty from '../assets/scottys/ScottyCMAU.png';
import Room from '../assets/scottys/Room.png';
import { AlarmScreenButton } from '../components/alarms/alarmScreenButton';
import ThemedButton from "../components/themes/ThemedButton";
import UserOnly from '../components/auth/UserOnly';

const Landing = () => {
  const {logout, user, authChecked, setIsLoggingOut } = useUser()

  const handleLogout = async () => {
        try {
            await logout()
            router.dismissAll()
            router.replace('/') 
            setTimeout(() => {
              setIsLoggingOut(false)
            }, 50);
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

  return (
    <UserOnly>
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

        <ThemedButton onPress={handleLogout} style={styles.button}>
            <Text style={{color: "#f2f2f2"}}>Log Out</Text>
        </ThemedButton>
      </View>
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