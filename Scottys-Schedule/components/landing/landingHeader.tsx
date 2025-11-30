import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AlarmScreenButton } from './alarmScreenButton'
import  AddButton from '../addButton'
import * as Progress from 'react-native-progress'
import { useBooks } from '@/hooks/useBooks'

const LandingHeader = () => {    
    const { progress } = useBooks();
    const formatProgress = progress * 100;

    return (
    <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.progressSection}>
            <Text style={styles.progressValue}>{formatProgress}%</Text>
            <Progress.Bar style={styles.progressBar}
                progress={progress}
                borderRadius={0}
                width={null}
                height={30}
                color={'#F5A201'}
                unfilledColor='#00537A'
            />
        </View>
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
        gap: 15,
        paddingHorizontal: 18,
        paddingBottom: 12
    },
    progressSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    progressValue: {
        fontFamily: 'Jersey10',
        fontSize: 24,
        color: '#FFF'
    },
    progressBar: {
        flex: 1, 
        borderWidth: 6,
        borderColor: '#013C58'
    }
})