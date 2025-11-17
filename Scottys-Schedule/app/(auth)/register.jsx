import { Text, Keyboard, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useUser } from '../../hooks/useUser'
import { Link } from 'expo-router'
import { useState } from 'react'

import Spacer from '../../components/themes/Spacer'
import ThemedView from '../../components/themes/ThemedView'
import ThemedText from '../../components/themes/ThemedText'
import ThemedButton from '../../components/themes/ThemedButton'
import ThemedTextInput from "../../components/themes/ThemedTextInput"

const Register = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)

  const { user, register } = useUser()

  const handleSubmit = async () => {
    setError(null)

    if (password != confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await register(email, password)
      console.log('current user is: ', user)
    } catch (error) {
      setError(error.message)
    }
  }
  
  return (
    <ThemedView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView 
          style={styles.scroll}
          contentContainerStyle={[styles.contentContainer, {paddingBottom: 60}]} 
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={40}
          >
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
          <ThemedTextInput
            style={{ marginBottom: 20, width: "80%" }}
            placeholder="Confirm Password"
            fontFamily='Jersey10'
            fontSize={20}
            placeholderTextColor="#000"
            value={confirmPassword}
            backgroundColor="#fff"
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <ThemedView style={styles.press}>
            <Link href="/login" replace style={{width: 100, paddingVertical: 10, justifyContent: 'center'}}>
              <ThemedText style={styles.link}>
                Log In
              </ThemedText>
            </Link>
            
            <ThemedButton onPress={handleSubmit} style={[styles.button, { marginLeft: 20 }]}>
              <Text style={{ color: '#f2f2f2', fontFamily: 'Jersey10', fontSize: 25 }}>Register</Text>
            </ThemedButton>
          </ThemedView>

          <Spacer/>
          {error && <Text style={styles.error}>{error}</Text>}

        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </ThemedView>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 110,
    paddingVertical: 10,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  link: {
    fontFamily: 'Jersey10', 
    fontSize: 25,
    textAlign: 'center',
    color: '#fff',
    textDecorationLine: 'underline',
    width: 100,
  },
  press: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  contentContainer: { 
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
})