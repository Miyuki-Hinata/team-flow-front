import type { Task } from "../types/task"
import { Link } from 'react-router-dom'

type Props = {
    task: Task
}

const TaskCard = ({
    task
}: Props) => {
    return (
        <Link to={`/tasks/${task.id}`}>
            <div>
                <h1>{task.title}</h1>
                <span>{task.taskStatus}</span>
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
        </Link>
    )
}

export default TaskCard