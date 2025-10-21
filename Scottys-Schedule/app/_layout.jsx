import { Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

const Layout = () => {
  return (
    <View style={{ flex: 1}}>
        <Stack screenOptions={{ headerShown: false }} />
    </View>
  )
}

export default Layout

const styles = StyleSheet.create({})