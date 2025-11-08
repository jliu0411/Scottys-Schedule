import { Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import "@/assets/font/Jersey10-Regular.ttf"
import * as Notifications from "expo-notifications"
import 'expo-router/entry'

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});



const RootLayout = () => {
  //Custom Font
  const [loaded, error] = useFonts({
    'Jersey10': require('@/assets/font/Jersey10-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
        <Stack screenOptions={{
          headerStyle: {backgroundColor: '#0B1E33'},
          headerTintColor: '#ffff',
          headerTitleAlign: 'center',
          headerTitleStyle: {fontFamily: 'Jersey10'}
        }}>
          <Stack.Screen name="index" options={{title: '' }}/>
          <Stack.Screen name="alarms" options={{title: 'Alarms'}}/>
          <Stack.Screen name="logIn" options={{headerShown: false}}/>
          <Stack.Screen name="signUp" options={{headerShown: false}}/>
          <Stack.Screen name="newAlarm" options={{title: 'New Alarm'}}/>
          <Stack.Screen name="newTask" options={{title: 'New Task'}}/>
          <Stack.Screen name="tasks" options={{title: 'Tasks'}}/>
        </Stack>
    </View>
  )
}

export default RootLayout

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})