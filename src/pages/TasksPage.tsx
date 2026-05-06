import { useState, useEffect } from 'react'
import { tasks as fetchTasks } from '../api/tasks'
import type { Task } from '../types/task'

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        fetchTasks().then(data => {
            setTasks(data)
        })
    }, [])

    return (
        <div>
            
        </div>
    )
}

export default TasksPage