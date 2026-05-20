import { useState, useEffect } from 'react'
import { tasks as fetchTasks } from '../api/tasks'
import type { Task } from '../types/task'
import TaskListContainer from '../components/TaskListContainer'
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
            <TaskListContainer tasks={tasks}/>
        </div>
    )
}

export default TasksPage