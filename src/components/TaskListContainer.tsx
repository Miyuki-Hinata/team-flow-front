import { useState } from 'react'
import TaskList from './TaskList'
import TaskFilter from './TaskFilter'
import type { Task, Priority, TaskStatus } from '../types/task'

type Props = {
    tasks: Task[]
}

const TaskListContainer = ({ tasks }: Props) => {


    const [filterStatus, setFilterStatus]  = useState<TaskStatus | null>(null)
    const [filterPriority, setFilterPriority] = useState<Priority | null>(null)

    const filteredTasks = tasks.filter(task =>{
        const statusMatch = filterStatus === null || task.taskStatus === filterStatus
        const priorityMatch = filterPriority === null || task.priority === filterPriority

        return statusMatch && priorityMatch
    })

    return (
        <div>
            <TaskFilter status={filterStatus}  priority={filterPriority}  onStatusChange={setFilterStatus} onPriorityChange={setFilterPriority}/>
            <TaskList tasks={filteredTasks}/>
        </div>
    )

}

export default TaskListContainer