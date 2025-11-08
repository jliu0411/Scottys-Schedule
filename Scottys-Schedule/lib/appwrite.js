import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Client, Account, ID, Models, Avatars, Databases} from 'react-native-appwrite';
import React, { useState } from 'react';


export const client = new Client()
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')
  .setProject('68f80da00030dc769415')   // Your Project ID
  .setPlatform("com.CS180.Scotty'sSchedule");   // Your package name / bundle identifier

export const account = new Account(client);

export const avatars = new Avatars(client);

export const databases = new Databases(client);

export default function App() {
  // const [password, setPassword] = useState('');
  // const [loggedInUser, setLoggedInUser] = useState(null);
  // const [email, setEmail] = useState('');
  // const [name, setName] = useState('');

  // async function login(email, password) {
  //   await account.createEmailPasswordSession({
  //       email,
  //       password
  //   });
  //   setLoggedInUser(await account.get());
  // }

  // async function register(email, password, name) {
  //   await account.create({
  //       userId: ID.unique(),
  //       email,
  //       password,
  //       name
  //   });
  //   await login(email, password);
  //   setLoggedInUser(await account.get());
  //   }
    
    

}