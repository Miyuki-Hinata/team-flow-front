import { useState } from 'react'
import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'

type Props = {
    tasks: Task[]
}

const TaskList = ({ tasks }: Props) => {
    const [filterStatus, setFilterStatus] = useState<'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE' | null>(null)
    const [filterPriority, setFilterPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null)
    
    // 絞り込み
    const filteredTasks = tasks.filter(task => {
        const statusMatch = filterStatus === null || task.taskStatus === filterStatus

        const priorityMatch = filterPriority === null || task.priority === filterPriority

        return statusMatch && priorityMatch
    })

    return (
        <div>
            <select
                value={filterStatus ?? ''}
                onChange={(e) => setFilterStatus(e.target.value === '' ? null : e.target.value as 'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE')}
            >
                <option value="">すべて</option>
                <option value="CREATED">未着手</option>
                <option value="PROGRESS">進行中</option>
                <option value="REVIEWING">レビュー中</option>
                <option value="DONE">完了</option>
            </select>
            <select
                value={filterPriority ?? ''}
                onChange={(e) => setFilterPriority(e.target.value === '' ? null : e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            >
                <option value="">すべて</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
            </select>
            {
                filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task}/>
                ))
            }

        </div>
    )
}

export default TaskList