import { useState, useEffect } from 'react'
import type { Task } from '../types/task' 
import { getMyTasks as fetchMyTasks } from '../api/tasks'
import { Link } from 'react-router-dom'
import TaskList from '../components/TaskList'

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
            <TaskList tasks ={tasks}/>
        </div>
    )
}

export default MyTasksPage