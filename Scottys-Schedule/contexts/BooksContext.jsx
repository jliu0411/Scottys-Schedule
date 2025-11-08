import { createContext, useEffect, useState } from 'react'
import { databases } from '../lib/appwrite'
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
                // [
                //     Query.equal('userId', user.$id)
                // ]
            )

            setBooks(response.documents)

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

    async function createBook(data) {
        try {
            //dummy user
            const userID = "690e99ac0010ac3ed009"

            const newBook = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {...data, userID: userID /*user.$id*/},
                
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any()),
                ]
            )
        } catch (error) {
            console.error(error.message)
        }
    }

    async function deleteBook(id) {
        try {

        } catch (error) {
            console.error(error.message)
        }
    }

    useEffect(() => {

        fetchBooks()

    }, [])

    return (
        <BooksContext.Provider value={{ books, fetchBooks, fetchBookByID, createBook, deleteBook }}>
            {children}
        </BooksContext.Provider>
    )
}
