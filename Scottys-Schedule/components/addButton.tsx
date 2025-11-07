import { StyleSheet, Image, View } from 'react-native'
import React from 'react'
import { Link, RelativePathString } from 'expo-router'
import AddButtonIcon from '../assets/buttons/addButton.png'

interface buttonProps {
    href: RelativePathString
}

const AddButton = ({href} : buttonProps) => {
  return (
    <View>
      <Link href={href}>
        <Image source={AddButtonIcon}/>
      </Link>
    </View>
  )
}

export default AddButton

const styles = StyleSheet.create({})