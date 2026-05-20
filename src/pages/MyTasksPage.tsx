import { useState, useEffect } from 'react'
import type { Task } from '../types/task' 
import { getMyTasks as fetchMyTasks } from '../api/tasks'
import { Link } from 'react-router-dom'
import TaskListContainer from '../components/TaskListContainer'

const MyTasksPage = () => {
    const [tasks,  setTasks] = useState<Task[]>([])

    useEffect(() => {
        fetchMyTasks().then(data => {
            setTasks(data)
        })
    }, [])

    return (
        <div>
            <Link to="/tasks/create">タスク作成</Link>
            <TaskListContainer tasks ={tasks}/>
        </div>
    )
}

export default MyTasksPage