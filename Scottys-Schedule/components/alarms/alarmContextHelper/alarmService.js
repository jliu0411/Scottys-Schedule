import { databases } from "../../../lib/appwrite.js";
import { ID, Permission, Role, Query } from "react-native-appwrite";
import { DATABASE_ID, COLLECTION_ID } from "./alarmConstants.js";
import { mapDocToAlarm } from "./alarmUtils.js";

export const loadAlarmsFromAppwrite = async (userId) => {
  if (!userId) {
    console.warn("loadAlarmsFromAppwrite called without userId");
    return [];
  }

  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("userID", userId)]
    );
    const mapped = res.documents.map(mapDocToAlarm);
    console.log("Loaded alarms from Appwrite:", res.total);
    return mapped;
  } catch (e) {
    console.log("Error loading alarms from Appwrite:", e);
    return [];
  }
};

export const createAlarmInAppwrite = async ({
  time,
  repeatDays,
  puzzle,
  enabled,
  userId,
}) => {
  if (!userId) {
    throw new Error("createAlarmInAppwrite: userId is required");
  }

  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    {
      userID: userId, 
      time: Math.floor(time / 1000),
      repeatDays,
      puzzle,
      enabled,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ]
  );

  return mapDocToAlarm(doc);
};

export const updateAlarmInAppwrite = async (id, updatedAlarm) => {
  await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, {
    time: Math.floor(updatedAlarm.time / 1000), 
    repeatDays: updatedAlarm.repeatDays,
    puzzle: updatedAlarm.puzzle,
    enabled: updatedAlarm.enabled,
  });
};

export const deleteAlarmInAppwrite = async (id) => {
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
};
