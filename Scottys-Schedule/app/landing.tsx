import { Stack, router, useFocusEffect } from 'expo-router';
import { View, Image, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '../hooks/useUser';
import Logout from '../assets/scottys/Logout.png';
import ThemedButton from "../components/themes/ThemedButton";
import UserOnly from '../components/auth/UserOnly';
import LandingTaskList from '../components/landing/landingTaskList'
import LandingHeader from '../components/landing/landingHeader'
import Scotty from '../components/landing/scotty';
import Background from '../components/landing/background'
import { useState, useCallback } from 'react';
import { phrases } from '../components/landing/phrases';
import { useBooks } from '../hooks/useBooks';

const Landing = () => {
  const {logout, user, authChecked, setIsLoggingOut } = useUser();
  const { fetchTasksByDate } = useBooks();
  
  const [phrase, setPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      
      fetchTasksByDate(today);
    }, [fetchTasksByDate])
  );

  const handlePhrase = () => {
    const randomNum = Math.floor(Math.random() * phrases.length);
    setPhrase(phrases[randomNum]);
    setShowPhrase(true);
  }

  const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
            router.replace('../(auth)/login')
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

        <View style={{width: '100%', height: '100%'}}>
          <Background/>
          <Scotty showPhrase={showPhrase} phrase={phrase}/>
        </View>
        
        <Text style={styles.date}>{new Date().toLocaleDateString([], {weekday:'long', month: 'long', day: 'numeric', year: 'numeric'})}</Text>
        
        <ThemedButton onPress={handleLogout} style={styles.logoutButton}>
          <Image source={Logout} style={styles.logout} resizeMode="contain"/>
        </ThemedButton>

        <LandingTaskList handlePhrase={handlePhrase}/>
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
  },
  room: {
    position: 'relative',
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