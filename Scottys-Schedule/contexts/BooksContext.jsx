import { createContext, useEffect, useState, useRef, useMemo } from 'react'
import { AppState } from 'react-native'
import { databases, client } from '../lib/appwrite'
import { ID, Permission, Query, Role } from 'react-native-appwrite'
import { useUser } from '../hooks/useUser'
import { getNextRepeatDate } from '../contexts/repeats'
import { registerForNotificationsAsync, scheduleTaskNotification, cancelTaskNotification } from '../hooks/useNotification'
import * as Notifications from 'expo-notifications';

const DATABASE_ID = "68fd56d40037f2743501"
const COLLECTION_ID = "books"

const sortTasks = (a, b) => {
    const getMinutes = (timeString) => {
        if (!timeString) return 0; 
        const parts = timeString.split(':');
        const h = Number(parts[0]) || 0; 
        const m = Number(parts[1]) || 0;
        return (h * 60) + m;
    }
    return getMinutes(a.timeStarts) - getMinutes(b.timeStarts);
}

export const BooksContext = createContext()

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dailyTasks, setDailyTasks] = useState([]);
    
    const { user } = useUser();
    const unsubscribeRealtime = useRef(null);
    const responseListener = useRef();

    const completedCount = dailyTasks ? dailyTasks.filter(t => t.isCompleted).length : 0;
    const totalCount = dailyTasks ? dailyTasks.length : 0;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount).toFixed(2);

    const parseDateInput = (value) => {
        if (!value) return null;
        if (value instanceof Date) return new Date(value.getTime());
        if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                const [year, month, day] = value.split('-').map(Number);
                return new Date(year, month - 1, day, 0, 0, 0, 0);
            }
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) return parsed;
        }
        return null;
    };

    const parseTime = (rawTime) => {
        if (typeof rawTime !== 'string' || !rawTime.includes(':')) return { hours: 0, minutes: 0 };
        const [hours, minutes] = rawTime.split(':');
        return { hours: Number(hours) || 0, minutes: Number(minutes) || 0 };
    };

    const toLocalDate = (value) => {
        const parsed = parseDateInput(value);
        if (!parsed) return null;
        if (typeof value === 'string' && value.includes('T')) {
            return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
        }
        return parsed;
    };

    const toDateKey = (value) => {
        const parsed = parseDateInput(value);
        if (!parsed) return null;
        parsed.setHours(0, 0, 0, 0);
        return parsed.toISOString();
    };

    const combineDateAndTime = (dateValue, timeValue) => {
        const base = toLocalDate(dateValue);
        if (!base) return null;
        const { hours, minutes } = parseTime(timeValue ?? '00:00');
        const result = new Date(base.getTime());
        result.setHours(hours, minutes, 0, 0);
        return result;
    };

    const getTimeParams = () => {
        const now = currentTime;
        const normalizedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const normalizedDateKey = normalizedDate.toISOString();
        const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return { normalizedDate, normalizedDateKey, currentTimeString };
    }

    const refreshAllData = async () => {
        await fetchBooks();
    };

    const { previousTasks, currentTasks, upcomingTasks } = useMemo(() => {
        const { currentTimeString } = getTimeParams();
        const prev = [];
        const curr = [];
        const upc = [];

        if (dailyTasks && dailyTasks.length > 0) {
            const sortedDaily = [...dailyTasks].sort(sortTasks);
            
            sortedDaily.forEach(task => {
                const start = task.timeStarts || "00:00";
                const end = task.timeEnds || start;

                if (end < currentTimeString) {
                    prev.push(task);
                } else if (start <= currentTimeString && end >= currentTimeString) {
                    curr.push(task);
                } else if (start > currentTimeString) {
                    upc.push(task);
                }
            });
        }
        return { previousTasks: prev, currentTasks: curr, upcomingTasks: upc };
    }, [dailyTasks, currentTime]);

    async function fetchBooks() {
        if (!user) return;
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('userID', user.$id)]
            );
            setBooks(response.documents.sort(sortTasks));
        } catch (error) {
            console.error("fetchBooks error:", error.message)
        }
    }

    async function fetchTasksByDate(date) {
        try {
            const dateKey = toDateKey(date);
            if (!dateKey) {
                setDailyTasks([]);
                return;
            }
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('userID', user.$id),
                    Query.equal('date', dateKey)
                ]
            )
            setDailyTasks(response?.documents.sort(sortTasks) ?? []);
        } catch (error) {
            console.error(error.message)
        }
    }

    async function fetchBookByID(id) {}
    async function fetchPreviousTasks() {}
    async function fetchCurrentTasks() {}
    async function fetchUpcomingTasks() {}
    async function fetchProgress() {}

    async function createBook(data) {
        try {
            const dateKey = toDateKey(data.date);
            
            const notificationId = await scheduleTaskNotification(
                data.name, 
                data.date, 
                data.timeStarts
            );

            const payload = {
                name: data.name,
                description: data.description || "",
                date: dateKey,
                timeStarts: data.timeStarts || "00:00",
                timeEnds: data.timeEnds || data.timeStarts || "00:00",
                repeats: data.repeats || [], 
                isCompleted: false,
                userID: user.$id,
                notificationId: notificationId || null,
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );

            await fetchTasksByDate(data.date);
            await refreshAllData();

        } catch (error) {
            console.error("Create Book Error:", error.message);
            throw error;
        }
    }

    async function deleteBook(id) {
        const task = books.find(b => b.$id === id);
        if (!task) return;

        try {
            setDailyTasks(prev => prev.filter(item => item.$id !== id));
            setBooks(prev => prev.filter(item => item.$id !== id));

            if (task.notificationId) {
                await cancelTaskNotification(task.notificationId);
            }

            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);

        } catch (error) {
            if (error.code === 404) {
                console.log("Task was already deleted on server (harmless race condition).");
            } else {
                console.error("Delete failed:", error.message);
            }
        }
    }

    async function changeIsCompleted(id) {
        try {
            const task = dailyTasks.find(t => t.$id === id);
            if (!task) return;

            const newStatus = !task.isCompleted;

            setDailyTasks(prev => prev.map(t => t.$id === id ? { ...t, isCompleted: newStatus } : t));
            setBooks(prev => prev.map(b => b.$id === id ? { ...b, isCompleted: newStatus } : b));

            let nextNotificationId = task.notificationId || null;
            if (newStatus && nextNotificationId) {
                await cancelTaskNotification(nextNotificationId);
                nextNotificationId = null;
            } else if (!newStatus) {
                nextNotificationId = (await scheduleTaskNotification(task.name, task.date, task.timeStarts)) || null;
            }

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id,
                { isCompleted: newStatus, notificationId: nextNotificationId }
            );
        } catch (error) {
            console.error("Change Status Error:", error.message);
        }
    }

    async function updateBook(id, data) {
        try {
            const existingBook = books.find(b => b.$id === id);
            
            const mergedName = data.name ?? existingBook?.name ?? '';
            const mergedDateKey = toDateKey(data.date ?? existingBook?.date);
            const mergedDateInput = data.date ?? existingBook?.date;
            const mergedTimeStarts = data.timeStarts ?? existingBook?.timeStarts ?? '00:00';
            const mergedTimeEnds = data.timeEnds ?? existingBook?.timeEnds ?? mergedTimeStarts;
            const mergedDescription = data.description ?? existingBook?.description ?? '';
            const mergedRepeats = data.repeats ?? existingBook?.repeats ?? [];
            const mergedIsCompleted = data.isCompleted ?? existingBook?.isCompleted ?? false;
            
            let newNotificationId = existingBook?.notificationId;

            if (existingBook && existingBook.notificationId) {
                await cancelTaskNotification(existingBook.notificationId);
                newNotificationId = null;
            }

            if (!mergedIsCompleted && mergedDateKey && mergedTimeStarts) {
                newNotificationId = await scheduleTaskNotification(
                    mergedName, 
                    mergedDateInput, 
                    mergedTimeStarts
                );
            }

            const payload = {
                name: mergedName,
                description: mergedDescription,
                date: mergedDateKey,
                timeStarts: mergedTimeStarts,
                timeEnds: mergedTimeEnds,
                repeats: mergedRepeats,
                isCompleted: mergedIsCompleted,
                notificationId: newNotificationId || null,
            };

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id,
                payload
            );

            if (mergedDateInput) await fetchTasksByDate(mergedDateInput);
            refreshAllData();

        } catch (error) {
            console.error("Update Book Error:", error.message);
            throw error;
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
        const timer = setInterval(() => {
            setCurrentTime(new Date()); 
        }, 10000); 
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user) {
            fetchBooks();
            fetchTasksByDate(new Date());
        } else {
            setBooks([]);
            setDailyTasks([]);
        }
    }, [user]);

    useEffect(() => {
        const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

        const startRealtime = () => {
            if (unsubscribeRealtime.current) return;
            console.log("Starting Realtime...");
            
            unsubscribeRealtime.current = client.subscribe(channel, (response) => {
                const { payload, events } = response;
                const isUpdate = events.some(e => e.includes("update"));
                const isCreate = events.some(e => e.includes("create"));
                const isDelete = events.some(e => e.includes("delete"));

                if (isUpdate) {
                    setDailyTasks(prev => {
                        const currentTask = prev.find(t => t.$id === payload.$id);
                        if (currentTask && 
                            currentTask.isCompleted === payload.isCompleted && 
                            currentTask.name === payload.name &&
                            currentTask.date === payload.date &&
                            currentTask.timeStarts === payload.timeStarts &&
                            currentTask.timeEnds === payload.timeEnds
                        ) return prev;

                        return prev.map(task => task.$id === payload.$id ? payload : task).sort(sortTasks);
                    });
                    setBooks(prev => prev.map(book => book.$id === payload.$id ? payload : book).sort(sortTasks));
                }
                
                if (isCreate) {
                    setBooks(prev => {
                        if (prev.some(b => b.$id === payload.$id)) return prev;
                        return [...prev, payload].sort(sortTasks);
                    });
                    setDailyTasks(prev => {
                        if (prev.some(t => t.$id === payload.$id)) return prev;
                        if (prev.length > 0 && prev[0].date === payload.date) {
                             return [...prev, payload].sort(sortTasks);
                        }
                        return prev;
                    });
                }

                if (isDelete) {
                    setDailyTasks(prev => prev.filter(t => t.$id !== payload.$id));
                    setBooks(prev => prev.filter(b => b.$id !== payload.$id));
                }
            });
        };

        const stopRealtime = () => {
            if (unsubscribeRealtime.current) {
                unsubscribeRealtime.current();
                unsubscribeRealtime.current = null;
            }
        };

        if (user) {
            startRealtime();
            return () => stopRealtime();
        }
    }, [user]);

    useEffect(() => {
        if (!books.length) return;
        const checkRepeats = async () => {
            const now = new Date();
            for (const task of books) {
                if (!task?.repeats?.length) continue;
                const taskEnd = combineDateAndTime(task.date, task.timeEnds ?? task.timeStarts);
                if (taskEnd && taskEnd < now) {
                    const nextDate = getNextRepeatDate(now, task.repeats, task.timeEnds ?? task.timeStarts);
                    await updateBook(task.$id, { date: nextDate, isCompleted: false });
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