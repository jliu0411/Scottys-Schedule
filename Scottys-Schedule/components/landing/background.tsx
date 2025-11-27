import { StyleSheet, View, Image } from 'react-native'
import DayWindow from '../../assets/scottys/dayWindow.png'
import NightWindow from '../../assets/scottys/nightWindow.png'
import SunsetWindow from '../../assets/scottys/sunsetWindow.png'
import SunriseWindow from '../../assets/scottys/sunriseWindow.png'

const Background = () => {
    const currentHour = new Date().getHours();

    return (
    <View style={styles.container}>
      {currentHour >= 7 && currentHour < 17 && <Image source={DayWindow} style={styles.image}/>}
      {currentHour >= 17 && currentHour < 19 && <Image source={SunsetWindow} style={styles.image}/>}
      {(currentHour >= 19 && currentHour <= 23) || (currentHour >= 0 && currentHour < 5)  && <Image source={NightWindow} style={styles.image}/>}
      {currentHour >= 5 && currentHour < 7 && <Image source={SunriseWindow} style={styles.image}/>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: -2
  },
  image: {
    width: '100%',
    height: '60%',
  }
})

export default Background