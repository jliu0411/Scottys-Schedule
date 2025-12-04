import { View, FlatList, Pressable } from 'react-native'
import TaskCard from './taskCard'
import EmptyTaskCard from './emptyTaskCard'
import { useBooks } from '@/hooks/useBooks'

const PreviousTaskList = () => {
    const { previousTasks } = useBooks();
    return (
        <View>
            {(previousTasks.length === 0) ? 
                <EmptyTaskCard type='Previous' color={'#595959'}/> : 
                <FlatList 
                    data={previousTasks}
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
                                color={'#595959'}/>
                        </Pressable>
                    )}
                />
            }
        </View>
    )
}

export default PreviousTaskList