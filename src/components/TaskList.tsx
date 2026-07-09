import type { Task } from '../types/task'
import styled from 'styled-components'
import TaskCard from '../components/TaskCard'

type Props = {
    tasks: Task[]
}

// カード列：縦積み＋カード間に一定の間隔を空ける（密着させない）。
// お知らせ系の AnnouncementList と同じく、間隔は標準余白 spacing.md(16px) で揃えて一体感を出す。
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const TaskList = ({ tasks }: Props) => {
    return (
        <List>
            {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
            ))}
        </List>
    )
}

export default TaskList
