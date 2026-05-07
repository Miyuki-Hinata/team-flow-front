import { useState, useEffect } from 'react'
import { tasks as fetchTasks } from '../api/tasks'
import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        fetchTasks().then(data => {
            setTasks(data)
        })
    }, [])

    return (
        <div>
            {
                tasks.map(task => (
                    <TaskCard key={task.id} task={task}/>
                ))
            }

        </div>
    )
}

export default TasksPage