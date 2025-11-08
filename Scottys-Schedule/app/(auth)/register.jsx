import { Text, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { Link, router } from 'expo-router'
import { useState, useEffect } from 'react'

import Spacer from '../../components/themes/Spacer'
import ThemedView from '../../components/themes/ThemedView'
import ThemedText from '../../components/themes/ThemedText'
import ThemedButton from '../../components/themes/ThemedButton'
import ThemedTextInput from "../../components/themes/ThemedTextInput"

const register = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const { user, register } = useUser()

  useEffect(() => {
      if (user) {
        router.replace('/landing') 
      }
    }, [user])

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
        <ThemedText style={styles.title}>Register for An Account</ThemedText>
        <Spacer/>

        <ThemedTextInput 
          style={{ marginBottom: 20, width: "80%" }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <ThemedTextInput
          style={{ marginBottom: 20, width: "80%" }}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <ThemedButton onPress={handleSubmit}>
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

export default register

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
    fontSize: 40,
  },
  link: {
    fontFamily: 'Jersey10', 
    fontSize: 30,
    textAlign: 'center'
  }
})