import type { Task } from "../types/task"

type Props = {
    task: Task
}

const TaskCard = ({
    task
}: Props) => {
    return (
        <div>
            <h1>{task.title}</h1>

        </div>
    )
}

export default TaskCard