import { Link } from "expo-router";
import { Image } from "react-native";
import AlarmButtonIcon from '../../assets/buttons/alarmButton.png'

export function AlarmScreenButton() {
  return (
    <Link href='/alarms'>
      <Image source={AlarmButtonIcon}/>
    </Link>
  )
};