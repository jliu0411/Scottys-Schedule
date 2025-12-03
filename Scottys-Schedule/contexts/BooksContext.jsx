import { createContext, useEffect, useState, useRef } from 'react'
import { AppState } from 'react-native'
import { databases, client } from '../lib/appwrite'
import { ID, Permission, Query, Role } from 'react-native-appwrite'
import { useUser } from '../hooks/useUser'
import { getNextRepeatDate } from '../contexts/repeats'
import { registerForNotificationsAsync, scheduleTaskNotification, cancelTaskNotification } from '../hooks/useNotification'
import * as Notifications from 'expo-notifications';

const DATABASE_ID = "68fd56d40037f2743501"
const COLLECTION_ID = "books"

export const BooksContext = createContext()

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([]);
    const [progress, setProgress] = useState(0);
    const [previousTasks, setPreviousTasks] = useState([]);
    const [currentTasks, setCurrentTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [dailyTasks, setDailyTasks] = useState([]);
    const { user } = useUser();
    const unsubscribeRealtime = useRef(null);
    const responseListener = useRef();

    const refreshAllData = async () => {
        if (!user) {
            console.log("Skipping refresh: No user logged in.");
            return;
        }

        console.log("Refreshing all data...");
        try {
            await Promise.all([
                fetchCurrentTasks(),
                fetchPreviousTasks(),
                fetchUpcomingTasks(),
                fetchProgress()
            ]);
        } catch (e) {
            console.error("Refresh failed", e);
        }
    };

    const sortTasks = (a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)

        const [hoursA, minutesA] = a.timeEnds.split(':').map(Number)
        const [hoursB, minutesB] = b.timeEnds.split(':').map(Number)

        dateA.setHours(hoursA, minutesA)
        dateB.setHours(hoursB, minutesB)

        return dateA.getTime() - dateB.getTime()
    }

    const getTimeParams = () => {
        const now = new Date();
        const normalizedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return { normalizedDate, currentTimeString };
    }

    async function fetchBooks() {
        if (!user) return;
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('userID', user.$id)]
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
            console.error("fetchBooks error:", error.message)
        }
    }

    async function fetchBookByID(id) {
        try {

        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchTasksByDate(date) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('userID', user.$id),
                    Query.equal('date', date)
                ]
            )
            setDailyTasks(response?.documents ?? []);
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchPreviousTasks() {
        const { normalizedDate, currentTimeString } = getTimeParams();
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('userID', user.$id),
                    Query.equal('date', normalizedDate),
                    Query.lessThan('timeEnds', currentTimeString)
                ]
            )
            setPreviousTasks(response?.documents ?? []);
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchCurrentTasks() {
        const { normalizedDate, currentTimeString } = getTimeParams();
        try {
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
        const { normalizedDate, currentTimeString } = getTimeParams();
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
            setUpcomingTasks(response?.documents ?? []);
        } catch (error) {
            console.error(error.message)
        }
    }

    async function createBook(data) {
        try {
            const notificationId = await scheduleTaskNotification(
                data.name,
                data.date,
                data.timeStarts
            );

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                { ...data, userID: user.$id, notificationId: notificationId || null },

                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );
            refreshAllData();
        } catch (error) {
            console.error(error.message)
        }
    }

    async function deleteBook(id) {
        try {
            const task = books.find(b => b.$id === id);

            if (task && task.notificationId) {
                await cancelTaskNotification(task.notificationId);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id
            )
            await fetchPreviousTasks();
            await fetchCurrentTasks();
            await fetchUpcomingTasks();
            await fetchProgress();
        } catch (error) {
            console.error(error.message)
        }
    }

    async function changeIsCompleted(id, currentStatus) {
        try {
            const newStatus = !currentStatus;

            if (newStatus === true) {
                const task = books.find(b => b.$id === id);
                if (task && task.notificationId) {
                    await cancelTaskNotification(task.notificationId);
                }
            }

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id,
                { 'isCompleted': !currentStatus }
            );
            await fetchProgress();
            await fetchPreviousTasks();
            await fetchUpcomingTasks();
            await fetchCurrentTasks();
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchProgress() {
        const { normalizedDate } = getTimeParams();
        try {
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

            const progressCalc = (completed / total).toFixed(2);
            setProgress(progressCalc);
        } catch (error) {
            console.error(error.message)
        }
    }

    async function updateBook(id, data) {
        try {
            const existingBook = books.find(b => b.$id === id);
            let newNotificationId = existingBook?.notificationId;

            if (existingBook && existingBook.notificationId) {
                await cancelTaskNotification(existingBook.notificationId);
                newNotificationId = null;
            }

            if (!data.isCompleted) {
                newNotificationId = await scheduleTaskNotification(
                    data.name,
                    data.date,
                    data.timeStarts
                );
            }

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id,
                { ...data, notificationId: newNotificationId || null }
            )
            refreshAllData();
        } catch (error) {
            console.error(error.message)
        }
    }

    useEffect(() => {
        registerForNotificationsAsync();

        if (responseListener.current) {
            responseListener.current.remove();
        }

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification tapped!");
            refreshAllData();
        });

        return () => {
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            refreshAllData();
        }, 5000);

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

        const startRealtime = () => {
            if (unsubscribeRealtime.current) return;

            console.log("Starting Realtime...");
            unsubscribeRealtime.current = client.subscribe(channel, async (response) => {
                const { payload, events } = response;

                if (events[0].includes("create")) {
                    setBooks(prev => [...prev, payload].sort(sortTasks));
                }
                if (events[0].includes("delete")) {
                    setBooks((prevBooks) => prevBooks.filter((book) => book.$id !== payload.$id));
                }
                if (events[0].includes("update")) {
                    setBooks(prevBooks => {
                        const updatedBooks = prevBooks.map(b => b.$id === payload.$id ? payload : b);
                        return updatedBooks.sort(sortTasks);
                    });
                }
                refreshAllData();
            });
        };

        const stopRealtime = () => {
            if (unsubscribeRealtime.current) {
                console.log("Stopping Realtime...");
                try {
                    unsubscribeRealtime.current();
                } catch (e) {
                    console.log("Realtime cleanup error (harmless):", e.message);
                }
                unsubscribeRealtime.current = null;
            }
        };

        if (user) {
            fetchBooks();
            refreshAllData();
            startRealtime();

            const subscription = AppState.addEventListener('change', (nextAppState) => {
                if (nextAppState === 'active') {
                    console.log("App active, refreshing data...");
                    fetchBooks();
                    refreshAllData();
                    if (!unsubscribeRealtime.current) {
                        startRealtime();
                    }
                }
            });

            return () => {
                stopRealtime();
                subscription.remove();
            };
        } else {
            setBooks([]);
            setPreviousTasks([]);
            setCurrentTasks([]);
            setUpcomingTasks([]);
            setProgress(0);
            stopRealtime();
        }
    }, [user]);

    useEffect(() => {
        if (!books.length) return;

        const checkRepeats = async () => {
            const now = new Date();
            for (const task of books) {
                const taskDate = new Date(task.date);
                if (taskDate < now && task.repeats?.length > 0) {
                    const nextDate = getNextRepeatDate(now, task.repeats, task.timeEnds);
                    await updateBook(task.$id, { date: nextDate.toISOString() });
                }
            }
        };

        checkRepeats();
    }, [books]);

    return (
        <BooksContext.Provider value={{ books, fetchBooks, fetchPreviousTasks, previousTasks, fetchCurrentTasks, currentTasks, fetchUpcomingTasks, upcomingTasks, fetchTasksByDate, dailyTasks, createBook, deleteBook, updateBook, fetchBookByID, progress, changeIsCompleted }}>
            {children}
        </BooksContext.Provider>
    )
}