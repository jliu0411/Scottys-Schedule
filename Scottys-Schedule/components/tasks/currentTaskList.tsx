import { View, FlatList, Pressable } from 'react-native'
import EmptyTaskCard from './emptyTaskCard'
import TaskCard from './taskCard'
import { useBooks } from '@/hooks/useBooks'

const CurrentTaskList = () => {
    const { currentTasks } = useBooks();
    return (
        <View>
            {(currentTasks.length === 0) ? 
                <EmptyTaskCard type='Current' color={'#F5A201'}/> : 
                <FlatList 
                    data={currentTasks}
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
                                color={'#F5A201'}/>
                        </Pressable>
                )}
                />
            }
        </View>
    )
}

export default CurrentTaskList