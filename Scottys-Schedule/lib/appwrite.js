import { Client, Account, Avatars, Databases } from 'react-native-appwrite';

export const client = new Client()
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')
  .setProject('68f80da00030dc769415')   // Your Project ID
  .setPlatform("com.CS180.Scotty'sSchedule");   // Your package name / bundle identifier

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);

