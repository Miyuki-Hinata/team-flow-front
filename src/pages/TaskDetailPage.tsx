import { useState, useEffect } from 'react'
import type { Task } from '../types/task'
import { useParams } from 'react-router-dom'
import { getTaskById as fetchTask } from '../api/tasks'

const TaskDetailPage = () => {
    const { id } = useParams()

    const [task, setTask] = useState<Task | null>(null)

    useEffect(() => {
        fetchTask(Number(id)).then(data => {
            setTask(data)
        })
    },[])

    return (
        <div>
            {task ? (
                <div>
                    <h1>{task.title}</h1>
                    <p>{task.description}</p>
                    <span>{task.taskStatus}</span>
                    <span>{task.project?.projectName}</span>
                    <span>{task.project?.department?.departmentName}</span>
                    <span>{task.priority}</span>
                    <span>{task.category?.categoryName}</span>
                    {   task.patient && 
                        <span>{task.patient?.lastName + '' + task.patient?.firstName}</span>
                    }
                    {
                        task.dueDate &&
                        <span>{task?.dueDate}</span>
                    }
                
                    {
                        task.assignees?.map(assignee => (
                            <span key={assignee.id}>{assignee.lastName}</span>
                        ))
                    }
                </div>

            ) : (
                <p>読み込み中...</p>
            )}
        </div>
    )    
}

export default TaskDetailPage