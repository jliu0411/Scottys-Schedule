import { Dimensions, View, Image } from 'react-native'
import DayWindow from '../../assets/scottys/dayWindow.png'
import NightWindow from '../../assets/scottys/nightWindow.png'
import SunsetWindow from '../../assets/scottys/sunsetWindow.png'
import SunriseWindow from '../../assets/scottys/sunriseWindow.png'

const Background = () => {
    const currentHour = new Date().getHours();
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    return (
    <View style={{width: screenWidth, height: screenHeight}}>
      {currentHour >= 7 && currentHour < 17 && <Image source={DayWindow} width={screenWidth} height={screenHeight}/>}
      {currentHour >= 17 && currentHour < 19 && <Image source={SunsetWindow}/>}
      {currentHour >= 19 && currentHour < 5 && <Image source={NightWindow}/>}
      {currentHour >= 5 && currentHour < 7 && <Image source={SunriseWindow}/>}
    </View>
  )
}

export default Background