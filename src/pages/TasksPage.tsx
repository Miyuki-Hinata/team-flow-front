import { useState, useEffect } from 'react'
import { tasks as fetchTasks } from '../api/tasks'
import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'
import { Link } from 'react-router-dom'

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        fetchTasks().then(data => {
            setTasks(data)
        })
    }, [])

    return (
        <div>
            <Link to="/tasks/create">タスク作成</Link>
            {
                tasks.map(task => (
                    <TaskCard key={task.id} task={task}/>
                ))
            }

        </div>
    )
}

export default TasksPage