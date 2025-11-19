import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AlarmScreenButton } from './alarmScreenButton'
import  AddButton from '../addButton'
import * as Progress from 'react-native-progress'

const LandingHeader = () => {    
    return (
    <SafeAreaView edges={['top']} style={styles.container}>
        <Progress.Bar style={styles.progressBar}
            progress={0.5}
            borderRadius={0}
            width={null}
            height={30}
            color={'#F5A201'}
            unfilledColor='#FFBA42'
        />
        <AlarmScreenButton/>
        <AddButton pathname='/newTask'/>
    </SafeAreaView>
  )
}

export default LandingHeader

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#0B1E33',
        gap: 14,
        paddingHorizontal: 18,
        paddingBottom: 12
    },
    progressBar: {
        flex: 1, 
        marginRight: 10,
        borderWidth: 6,
        borderColor: '#013C58'
    }
})