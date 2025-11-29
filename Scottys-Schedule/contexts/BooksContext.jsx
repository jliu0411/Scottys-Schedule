import { createContext, useEffect, useState } from 'react'
import { databases, client } from '../lib/appwrite'
import { ID, Permission, Query, Role } from 'react-native-appwrite'
import { useUser } from '../hooks/useUser'

const DATABASE_ID = "68fd56d40037f2743501"
const COLLECTION_ID = "books"

export const BooksContext = createContext()

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([]);
    const { user } = useUser();

    //progress info.
    const [progress, setProgress] = useState(0);
    const date = new Date();
    const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0, 0
    );

    async function fetchBooks() {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id),
                ]
            );

            const sortedTasks = response.documents.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);

                const [hoursA, minutesA] = a.timeEnds.split(':').map(Number);
                const [hoursB, minutesB] = b.timeEnds.split(':').map(Number);

                dateA.setHours(hoursA, minutesA);
                dateB.setHours(hoursB, minutesB);

                return dateA.getTime() - dateB.getTime();
            });

            setBooks(sortedTasks)

        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchBookByID(id) {
        try {

        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchCurrentTasks(date, currentTimeString) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id), 
                    Query.equal('date', date),
                    Query.greaterThan('timeEnds', currentTimeString),
                    Query.lessThanEqual('timeStarts', currentTimeString),
                    Query.limit(1)
                ]
            )
            return response
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchUpcomingTasks(date, currentTime) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('userID', user.$id),
                    Query.equal('date', date),
                    Query.greaterThan('timeStarts', currentTime),
                    Query.limit(3)
                ]
            )
            return response
        } catch (error) {
            console.error(error.message)
        }
    }

    async function createBook(data) {
        try {
             await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {...data, userID: user.$id},
                
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );
        } catch (error) {
            console.error(error.message)
        }
    }

    async function deleteBook(id) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id
            )
        } catch (error) {
            console.error(error.message)
        }
    }

    async function changeIsCompleted(id, currentStatus) {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id, 
                { 'isCompleted': !currentStatus }
            );
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchProgress(date) {
        try {
            const completedTasks = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id),
                    Query.equal('date', date),
                    Query.equal('isCompleted', true)
                ]
            );
            const completed = completedTasks.total;

            if (completed === 0) {
                return 0;
            }

            const allTasks = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id),
                    Query.equal('date', date)
                ]
            );
            const total = allTasks.total;

            return (completed/total);
            
        } catch(error) {
            console.error(error.message)
        }
    }

    const handleProgress = async () => {
        const progressCalculation = await fetchProgress(normalizedDate);
        setProgress(progressCalculation);
        fetchBooks();
    }

    async function updateBook(id, data) {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id,
                data
            ) 
        }catch (error) {
            console.error(error.message)
    }
}

    const sortTasks = (a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)

        const [hoursA, minutesA] = a.timeEnds.split(':').map(Number)
        const [hoursB, minutesB] = b.timeEnds.split(':').map(Number)

        dateA.setHours(hoursA, minutesA)
        dateB.setHours(hoursB, minutesB)

        return dateA.getTime() - dateB.getTime()
    }

    useEffect(() => {
        let unsubscribe
        const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`

        if (user) {
            fetchBooks();
            handleProgress();

            unsubscribe = client.subscribe(channel, (response) => {
                const { payload, events } = response
                console.log(events)

                if (events[0].includes("create")) {
                    setBooks(prev => [...prev, payload].sort(sortTasks))
                }

                if (events[0].includes("delete")) {
                    setBooks((prevBooks) => prevBooks.filter((book) => book.$id !== payload.$id))
                }

                if (events[0].includes("update")) {
                    setBooks(prevBooks => {
                        const updatedBooks = prevBooks.map(b => b.$id === payload.$id ? payload : b)
                        return updatedBooks.sort(sortTasks)
                    })
                }

                console.log('checking progress');
                handleProgress();
            })

    } else {
      setBooks([]);
      setProgress(0);
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }

  }, [user])


    return (
        <BooksContext.Provider value={{ books, fetchBooks, fetchCurrentTasks, fetchUpcomingTasks, fetchBookByID, createBook, deleteBook, changeIsCompleted, fetchProgress, progress, updateBook }}>
            {children}
        </BooksContext.Provider>
    )
}
