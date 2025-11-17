import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import ScottyCMAD from '../../assets/scottys/ScottyCMAD.png'
import ScottyCMAU from '../../assets/scottys/ScottyCMAU.png'
import ScottyOMAD from '../../assets/scottys/ScottyOMAD.png'
import ScottyOMAU from '../../assets/scottys/ScottyOMAU.png'
import { phrases } from '../landing/phrases'

const Scotty = () => {
  // const handleCheckBox = async () => {
  //   if
  // }
  
  return (
    <View style={styles.container}>
      <Image source={ScottyCMAD} style={styles.image}/>
      <View style={styles.text}>
        <Text >
          {phrases.at(0)}
        </Text>
      </View>
    </View>
  )
}

export default Scotty

const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%'
    },
    image: {
      width: '65%',
      height: '50%',
      marginTop: 30
    },
    text: {
      width: 100,
      height: 100,
      backgroundColor: '#FFF',
    }
})
