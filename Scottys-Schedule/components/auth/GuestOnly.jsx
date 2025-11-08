import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Text } from 'react-native'
import ThemedLoader from '../themes/ThemedLoader'

const GuestOnly = ({ children }) => {
  const { user, authChecked } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (authChecked && user !== null) {
      router.replace("/landing")
    }
  }, [user, authChecked])

  if (!authChecked || user) {
    return (
      <ThemedLoader />
    )
  }

  return children
}

export default GuestOnly