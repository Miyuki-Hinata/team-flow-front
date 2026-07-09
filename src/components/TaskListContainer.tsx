import { useState } from 'react'
import styled from 'styled-components'
import TaskList from './TaskList'
import TaskFilter from './TaskFilter'
import type { Task, Priority, TaskStatus } from '../types/task'

type Props = {
    tasks: Task[]
}

// フィルタと一覧を縦に積み、間に間隔を空ける（密着させない）。
// 一覧まわりの間隔は他の一覧系と同じ標準余白 spacing.md で揃える。
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const TaskListContainer = ({ tasks }: Props) => {

    const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null)
    const [filterPriority, setFilterPriority] = useState<Priority | null>(null)

    const filteredTasks = tasks.filter(task => {
        const statusMatch = filterStatus === null || task.taskStatus === filterStatus
        const priorityMatch = filterPriority === null || task.priority === filterPriority

        return statusMatch && priorityMatch
    })

    return (
        <Container>
            <TaskFilter
                status={filterStatus}
                priority={filterPriority}
                onStatusChange={setFilterStatus}
                onPriorityChange={setFilterPriority}
            />
            <TaskList tasks={filteredTasks} />
        </Container>
    )
}

export default TaskListContainer
