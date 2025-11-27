import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import ScottyCMAD from '../../assets/scottys/ScottyCMAD.png'
import ScottyCMAU from '../../assets/scottys/ScottyCMAU.png'
import ScottyOMAD from '../../assets/scottys/ScottyOMAD.png'
import ScottyOMAU from '../../assets/scottys/ScottyOMAU.png'

type ScottyProps = {
  showPhrase: boolean,
  phrase: string
}

const Scotty = ({showPhrase, phrase} : ScottyProps) => {
  return (
    <View style={styles.container}>
      <Image source={ScottyCMAD} style={styles.image}/>
      {showPhrase && 
        <View style={styles.textContainer}>
          <Text style={styles.text}>{phrase}</Text>
        </View>
      }
    </View>
  )
}

export default Scotty

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: -1,
      alignSelf: 'center',
      width: '100%',
      height: '100%',
      top: 50
    },
    image: {
      width: '65%',
      height: '50%',
      marginTop: 30
    },
    textContainer: {
      height: 'auto',
      width: '30%',
      backgroundColor: '#FFF',
      position: 'absolute',
      alignSelf: 'flex-end',
      marginRight: 50,
      marginTop: 85,
      padding: 10,
    },
    text: {
      fontFamily: 'Jersey10',
      fontSize: 24,
      textAlign: 'center'
    }
})
