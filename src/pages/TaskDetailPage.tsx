import { useState, useEffect } from 'react'
import type { Task } from '../types/task'
import { useParams } from 'react-router-dom'
import { getTaskById as fetchTask, updateTask } from '../api/tasks'

const TaskDetailPage = () => {
    const { id } = useParams()

    const [task, setTask] = useState<Task | null>(null)

    const [status, setStatus] = useState<'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE'>('CREATED')

    const handleStatusChange = async (newStatus: 'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE') => {
        setStatus(newStatus)
        await updateTask(Number(id), {
            title: task!.title,
            description: task!.description,
            projectId: task!.project?.id,
            categoryId: task!.category?.id,
            patientId: task!.patient?.id,
            assignedToAll: task!.assignedToAll,
            priority: task!.priority,
            taskStatus: newStatus,
            dueDate: task!.dueDate,
            assigneeIds: task!.assignees?.map(a => a.id)
        })
    }

    useEffect(() => {
        fetchTask(Number(id)).then(data => {
            setTask(data)
            setStatus(data.taskStatus)
        })
    },[])

    return (
        <div>
            {task ? (
                <div>
                    <h1>{task.title}</h1>
                    <p>{task.description}</p>
                    <span>{status}</span>
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

                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value as 'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE')}
                    >
                        <option value="CREATED">未着手</option>
                        <option value="PROGRESS">進行中</option>
                        <option value="REVIEWING">レビュー中</option>
                        <option value="DONE">完了</option>
                    </select>

                </div>

            ) : (
                <p>読み込み中...</p>
            )}
        </div>
    )    
}

export default TaskDetailPage