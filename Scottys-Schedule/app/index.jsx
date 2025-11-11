import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { useUser } from '../hooks/useUser'
import { Redirect } from 'expo-router'

export default function IndexPage() {
  const {user, authChecked} = useUser()

  if (!authChecked){
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (user) {
    return <Redirect href="/landing"/>
  }

  return <Redirect href="/(auth)/login"/>
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00537A'
  }
});