import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native'
import EmptyTaskCard from './emptyTaskCard'
import TaskCard from './taskCard'
import { useBooks } from '@/hooks/useBooks'

type DailyTaskListProps = {
    currentDate: Date,
    today: Date,
    type: string,
    color: string
}

const DailyTaskList = ({ currentDate, today, type, color } : DailyTaskListProps) => {
    const { dailyTasks } = useBooks();

    return (
        <View>
            <Text style={[styles.header,{ backgroundColor: color }]}>{type} Tasks</Text>
            {(dailyTasks.length === 0) ? 
                ( (currentDate.valueOf() < today.valueOf()) ?
                    <EmptyTaskCard type={type} color={color}/> : 
                    <EmptyTaskCard type={type} color={color}/>
                ) : 
                <FlatList 
                    data={dailyTasks}
                    keyExtractor={(item) => item.$id}
                    renderItem={({ item }) => (
                        <Pressable>
                            <TaskCard 
                            id={item.$id}
                            name={item.name} 
                            description={item.description} 
                            timeStarts={item.timeStarts} 
                            timeEnds={item.timeEnds} 
                            isCompleted={item.isCompleted} 
                            color={color}/>
                        </Pressable>
                    )}
                />
            }
        </View>
    )
}

export default DailyTaskList

const styles = StyleSheet.create({
    header: {
        fontFamily: 'Jersey10',
        color: '#FFFF',
        fontSize: 24,
        padding: 8,
        paddingLeft: 20
    },
})