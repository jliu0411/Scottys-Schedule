import { Client, Account, Avatars, Databases } from 'react-native-appwrite';

export const client = new Client();

client
  .setProject('690ea56c002d6826cf9e')
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')
  .setPlatform("com.CS180.ScottysSchedule");

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);