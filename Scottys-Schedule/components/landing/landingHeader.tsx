import { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AlarmScreenButton } from './alarmScreenButton'
import  AddButton from '../addButton'
import * as Progress from 'react-native-progress'
import { useBooks } from '@/hooks/useBooks'

const LandingHeader = () => {    
    const { fetchProgress } = useBooks();
    const [progress, setProgress] = useState(0);

    const date = new Date();
    const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0, 0
      );

    const handleComplete = async () => {
        const progressCalculation = await fetchProgress(normalizedDate);
        setProgress(progressCalculation);
    }

    useEffect(() => {
        handleComplete();
        console.log('progress2: ', progress)
    })

    return (
    <SafeAreaView edges={['top']} style={styles.container}>
        <Progress.Bar style={styles.progressBar}
            progress={progress}
            borderRadius={0}
            width={null}
            height={30}
            color={'#F5A201'}
            unfilledColor='#00537A'
        />
        <AlarmScreenButton/>
        <AddButton pathname='../newTask'/>
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