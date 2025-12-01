import { View, FlatList, Pressable } from 'react-native'
import EmptyTaskCard from './emptyTaskCard'
import TaskCard from './taskCard'
import { useBooks } from '@/hooks/useBooks'

const UpcomingTaskList = () => {
    const { upcomingTasks } = useBooks();
    return (
        <View>
            {(upcomingTasks.length === 0) ? 
                <EmptyTaskCard type='Upcoming' color={'#013C58'}/> : 
                <FlatList 
                    data={upcomingTasks}
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
                                color={'#013C58'}/>
                        </Pressable>
                    )}
                />
            }
        </View>
    )
}

export default UpcomingTaskList