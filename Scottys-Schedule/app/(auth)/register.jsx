import { Text, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { Link, router } from 'expo-router'
import { useState, useEffect } from 'react'

import Spacer from '../../components/themes/Spacer'
import ThemedView from '../../components/themes/ThemedView'
import ThemedText from '../../components/themes/ThemedText'
import ThemedButton from '../../components/themes/ThemedButton'
import ThemedTextInput from "../../components/themes/ThemedTextInput"

const Register = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const { user, register } = useUser()

  const handleSubmit = async () => {
    setError(null)

    try {
      await register(email, password)
      console.log('current user is: ', user)
    } catch (error) {
      setError(error.message)
    }
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <ThemedText style={{fontFamily: 'Jersey10', color: '#F5A201', fontSize: 80, textAlign: 'center',
          textShadow: '#000', textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 8 }}>
            Scotty's{'\n'}Schedule
        </ThemedText>

        <ThemedText style={styles.title}>Register for An Account</ThemedText>
        <Spacer/>

        <ThemedTextInput 
          style={{ marginBottom: 20, width: "80%" }}
          placeholder="Email"
          fontFamily='Jersey10'
          value={email}
          fontSize={20}
          placeholderTextColor="#000"
          backgroundColor="#fff"
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <ThemedTextInput
          style={{ marginBottom: 20, width: "80%" }}
          placeholder="Password"
          fontFamily='Jersey10'
          fontSize={20}
          placeholderTextColor="#000"
          value={password}
          backgroundColor="#fff"
          onChangeText={setPassword}
          secureTextEntry
        />

        <ThemedButton onPress={handleSubmit}  style={styles.button}>
          <Text style={{ color: '#f2f2f2', fontFamily: 'Jersey10', fontSize: 20 }}>Create Account</Text>
        </ThemedButton>

        <Spacer/>
        {error && <Text style={styles.error}>{error}</Text>}

        <Spacer/>
        <Link href="/login" replace>
          <ThemedText style={styles.link}>
            Log In Instead
          </ThemedText>
        </Link>

      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#00537A',
    fontFamily: 'Jersey10', 
    gap: 2,
  },
  input: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    width: 200
  },
  title: {
    fontFamily: 'Jersey10',
    color: '#fff',
    fontSize: 40,
  },
  button: {
    backgroundColor: '#F5A201',
    fontFamily: 'Jersey10',
  },
  link: {
    fontFamily: 'Jersey10', 
    fontSize: 30,
    textAlign: 'center',
    color: '#fff'
  }
})