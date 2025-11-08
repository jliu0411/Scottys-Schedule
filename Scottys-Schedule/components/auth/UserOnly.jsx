import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import ThemedLoader from '../themes/ThemedLoader'

const UserOnly = ({ children }) => {
  const { user, authChecked, isLoggingOut } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (authChecked && user === null && !isLoggingOut) {
      router.replace("/(auth)/login")
    }
  }, [user, authChecked, isLoggingOut])

  if (!authChecked) {
    return (
      <ThemedLoader />
    )
  }

  if (user === null) {
    return (
      <ThemedLoader />
    )
  }
  
  return children
}

export default UserOnly