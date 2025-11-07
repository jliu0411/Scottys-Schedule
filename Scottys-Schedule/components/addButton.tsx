import React from 'react'
import { Image, View } from 'react-native'
import { Link, Href } from 'expo-router'
import AddButtonIcon from '../assets/buttons/addButton.png'

const AddButton = (pathname : Href) => {  
  return (
    <View>
      <Link href={pathname}>
        <Image source={AddButtonIcon}/>
      </Link>
    </View>
  )
}

export default AddButton