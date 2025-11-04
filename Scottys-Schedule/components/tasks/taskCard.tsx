export type TaskData = {
    name: string,
    description: string,
    date: Date,
    timeStarts: Date,
    timeEnds: Date,
    repeats: string[],
    completed: boolean,
}