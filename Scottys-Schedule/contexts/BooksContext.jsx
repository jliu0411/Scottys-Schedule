import { createContext, useEffect, useState } from 'react'
import { databases, client } from '../lib/appwrite'
import { ID, Permission, Query, Role } from 'react-native-appwrite'
import { useUser } from '../hooks/useUser'

const DATABASE_ID = "68fd56d40037f2743501"
const COLLECTION_ID = "books"

export const BooksContext = createContext()

export function BooksProvider({ children }) {
    const [ books, setBooks ] = useState([]);
    const [ progress, setProgress ] = useState(0);
    const [ currentTasks, setCurrentTasks ] = useState([]);
    const [ upcomingTasks, setUpcomingTasks ] = useState([]);
    const { user } = useUser();

    const date = new Date();
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const currentTimeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const sortTasks = (a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)

        const [hoursA, minutesA] = a.timeEnds.split(':').map(Number)
        const [hoursB, minutesB] = b.timeEnds.split(':').map(Number)

        dateA.setHours(hoursA, minutesA)
        dateB.setHours(hoursB, minutesB)

        return dateA.getTime() - dateB.getTime()
    }

    async function fetchBooks() {
        try {
            console.log('fetching books');
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

    async function fetchCurrentTasks() {
        try {
            console.log('fetching current tasks');
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id), 
                    Query.equal('date', normalizedDate),
                    Query.greaterThan('timeEnds', currentTimeString),
                    Query.lessThanEqual('timeStarts', currentTimeString),
                    Query.limit(1)
                ]
            )
            setCurrentTasks(response?.documents ?? []);
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchUpcomingTasks() {
        try {
            console.log('fetching upcoming tasks');
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('userID', user.$id),
                    Query.equal('date', normalizedDate),
                    Query.greaterThan('timeStarts', currentTimeString),
                ]
            )
            const tasks = (response?.documents ?? []).sort(sortTasks)
            setUpcomingTasks(tasks);
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
            await fetchCurrentTasks();
            await fetchUpcomingTasks();
            await fetchProgress();
        } catch (error) {
            console.error(error.message)
        }
    }

    async function changeIsCompleted(id, currentStatus) {
        try {
            console.log('changing check');
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id, 
                { 'isCompleted': !currentStatus }
            );
            await fetchProgress();
            await fetchUpcomingTasks();
            await fetchCurrentTasks();
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchProgress() {
        try {
            console.log('fetching progress');
            const completedTasks = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id),
                    Query.equal('date', normalizedDate),
                    Query.equal('isCompleted', true)
                ]
            );
            const completed = completedTasks.total;

            const allTasks = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [   
                    Query.equal('userID', user.$id),
                    Query.equal('date', normalizedDate)
                ]
            );
            const total = allTasks.total;

            if (total === 0 || completed === 0) {
                setProgress(0)
                return;
            }

            const progressCalc = (completed/total).toFixed(2);
            setProgress(progressCalc);
        } catch(error) {
            console.error(error.message)
        }
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

    useEffect(() => {
        let unsubscribe
        const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`

        if (user) {
            fetchBooks();
            fetchCurrentTasks();
            fetchUpcomingTasks();
            fetchProgress();

            unsubscribe = client.subscribe(channel, async (response) => {
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
                        const updatedBooks = prevBooks.map(b => b.$id === payload.$id ? payload : b);
                        return updatedBooks.sort(sortTasks);
                    });
                }
                await fetchCurrentTasks();
                await fetchUpcomingTasks();
                await fetchProgress();
            });

    } else {
      setBooks([]);
      setCurrentTasks([]);
      setUpcomingTasks([]);
      setProgress(0);
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }

  }, [user])


    return (
        <BooksContext.Provider value={{ books, fetchBooks, fetchCurrentTasks, currentTasks, fetchUpcomingTasks, upcomingTasks, fetchBookByID, createBook, deleteBook, changeIsCompleted, fetchProgress, progress, updateBook }}>
            {children}
        </BooksContext.Provider>
    )
}
