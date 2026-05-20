import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'

type Props = {
    tasks: Task[]
}

const TaskList = ({ tasks }: Props) => {
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

export default TaskList