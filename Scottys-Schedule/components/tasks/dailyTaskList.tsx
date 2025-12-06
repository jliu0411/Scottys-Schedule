import { StyleSheet, View, FlatList, Pressable } from 'react-native'
import React from 'react'
import TaskCard from './taskCard'
import EmptyTaskCard from './emptyTaskCard'
import { useBooks } from '../../hooks/useBooks'

type TaskData = {
    $id: string,
    name: string,
    description?: string,
    date: Date | string,
    timeStarts: string,
    timeEnds: string,
    isCompleted: boolean,
    repeats: string[],
}

type DailyListProps = {
    type: string,
    color: string,
    currentDate?: Date, 
    today?: Date,
}

const DailyTaskList = ({ type, color, currentDate }: DailyListProps) => {
    const { books } = useBooks();

    const filteredBooks = books.filter((task: TaskData) => {
        if (!currentDate) return true;
        
        const taskDate = new Date(task.date);
        const targetDate = new Date(currentDate);

        return taskDate.toDateString() === targetDate.toDateString();
    });

    return (
        <View style={styles.container}>
            {filteredBooks.length === 0 ? (
                <EmptyTaskCard type={type} color={color}/>
            ) : (
                <FlatList 
                    data={filteredBooks}
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
                                color={color}
                            />
                        </Pressable>
                    )}
                    contentContainerStyle={{ paddingBottom: 150 }} 
                />
            )}
        </View>
    )
}

export default DailyTaskList

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        flex: 1, 
    }
})