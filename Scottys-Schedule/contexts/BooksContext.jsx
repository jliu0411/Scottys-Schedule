import { createContext, useEffect, useState } from 'react'
import { databases, client } from '../lib/appwrite'
import { ID, Permission, Query, Role } from 'react-native-appwrite'
import { useUser } from '../hooks/useUser'

const DATABASE_ID = "68fd56d40037f2743501"
const COLLECTION_ID = "books"

export const BooksContext = createContext()

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([])
    const { user } = useUser()

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

    async function fetchCurrentTasks(date, currentTime) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                date,
                currentTime
                [
                    Query.and(
                        [ 
                            Query.equal('userId', user.$id),
                            Query.equal('date', date)
                        ]
                    )
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
                date,
                currentTime,
                [
                    Query.and(
                        [
                            Query.equal('userId', user.$id),
                            Query.equal('date', date),
                            Query.greaterThan('timeEnds', currentTime)
                        ]
                    )
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

    useEffect(() => {
        let unsubscribe
        const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`

        if (user) {
            fetchBooks()
            unsubscribe = client.subscribe(channel, (response) => {
                const { payload, events } = response
                console.log(events)

                if (events[0].includes("create")) {
                    setBooks((prevBooks) => {
                        const updated = [...prevBooks, payload]
                        
                        //sorts after task created
                        return updated.sort((a, b) => {
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);

                            const [hoursA, minutesA] = a.timeEnds.split(':').map(Number);
                            const [hoursB, minutesB] = b.timeEnds.split(':').map(Number);

                            dateA.setHours(hoursA, minutesA);
                            dateB.setHours(hoursB, minutesB);

                            return dateA.getTime() - dateB.getTime();
                        });
                    });
                }

                if (events[0].includes("delete")) {
                setBooks((prevBooks) => prevBooks.filter((book) => book.$id !== payload.$id))
                }
            })

    } else {
      setBooks([])
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }

  }, [user])


    return (
        <BooksContext.Provider value={{ books, fetchBooks, fetchCurrentTasks, fetchUpcomingTasks, fetchBookByID, createBook, deleteBook }}>
            {children}
        </BooksContext.Provider>
    )
}
