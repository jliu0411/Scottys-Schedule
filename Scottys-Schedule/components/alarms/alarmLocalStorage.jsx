import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const alarmLocalStorage = createContext();

export const AlarmProvider = ({ children }) => {
    const [alarms, setAlarms] = useState([]);

    useEffect(() => {
        const loadAlarms = async () => {
            try {
                const stored = await AsyncStorage.getItem("alarms");
                if (stored) {
                setAlarms(JSON.parse(stored));
                }
            } catch (e) {
                console.log("Error loading alarms:", e);
            }
        };

        loadAlarms();
    }, []);

    const addAlarm = async (alarm) => {
        try {
            const updated = [...alarms, alarm];
            setAlarms(updated);
            await AsyncStorage.setItem("alarms", JSON.stringify(updated));
        } catch (e) {
            console.log("Error saving alarm:", e);
        }
    };

    const toggleAlarm = async (id) => {
        try {
            const updated = alarms.map((a) =>
                a.id === id ? { ...a, enabled: !a.enabled } : a
            );

            setAlarms(updated);
            await AsyncStorage.setItem("@alarms", JSON.stringify(updated));
        } catch (e) {
            console.log("Error toggling alarm:", e);
        }
    };

    const updateAlarm = async (id, patch) => {
        const next = alarms.map((a) =>
            a.id === id ? { ...a, ...patch } : a
        );
        await persist(next);
    };

    return (
        <alarmLocalStorage.Provider value={{ alarms, addAlarm, toggleAlarm, updateAlarm }}>
        {children}
        </alarmLocalStorage.Provider>
    );
};

export const useAlarms = () => useContext(alarmLocalStorage);