import { StyleSheet, Text, View } from 'react-native'
import React, { use } from 'react'
import { useForm } from '@tanstack/react-form'

interface Date {
  month: number,
  day: number,
  year: number
}

const defaultdate : Date = {
  month: 10,
  day: 31,
  year: 2025
}

interface Time {
  hour: number,
  minutes: number
  am: boolean
}

const defaultTime1 : Time = {
  hour: 10,
  minutes: 30,
  am: true
}

const defaultTime2 : Time = {
  hour: 11,
  minutes: 30,
  am: true
}

interface Task {
  name: string,
  description: string,
  date: Date,
  timeStarts: Time,
  timeEnds: Time,
  repeats: string[],
}

const defaultTask: Task = {
  name: "ex. Wash Dishes",
  description: "ex. Rinse pots and load dishwasher",
  date: defaultdate,
  timeStarts: defaultTime1,
  timeEnds: defaultTime2,
  repeats: []
}

const NewTask = () => {
  const form = useForm({
    defaultValues: defaultTask,
    onSubmit: async ({ value }) => {
      console.log(value) //NEEDS TO CHANGE
    },
  })

  return (
    <View style={styles.container}>
      <form.Field
        name="name"
        // eslint-disable-next-line react/no-children-prop
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field}/>
          </>
        )}
      />


      <form.Field
        name="description"
        // eslint-disable-next-line react/no-children-prop
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field}/>
          </>
        )}
      />


      <form.Field
        name="date"
        // eslint-disable-next-line react/no-children-prop
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field}/>
          </>
        )}
      />


      <form.Field
        name="timeStarts"
        // eslint-disable-next-line react/no-children-prop
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field}/>
          </>
        )}
      />


      <form.Field
        name="timeEnds"
        // eslint-disable-next-line react/no-children-prop
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field}/>
          </>
        )}
      />


      <form.Field
        name="repeats"
        mode="array"
        // eslint-disable-next-line react/no-children-prop
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur} 
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field}/>
          </>
        )}
      />
    </View>
  )
}

export default NewTask

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})