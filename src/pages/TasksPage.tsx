import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tasks as fetchTasks } from '../api/tasks'
import type { Task } from '../types/task'
import TaskListContainer from '../components/TaskListContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'

// 「＋ タスクを作成」ボタンのアイコン（PatientPage / AnnouncementsPage と同じ + アイコン）
const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const TasksPage = () => {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        fetchTasks().then(data => {
            setTasks(data)
        })
    }, [])

    // subtitle 用に件数を算出：全体件数 + 未完（DONE 以外）件数
    // デザイン準拠（README §8：「N件・未完N件」）
    const totalCount = tasks.length
    const openCount = tasks.filter(t => t.taskStatus !== 'DONE').length

    return (
        <div>
            <PageHeader
                title="全タスク"
                subtitle={`全 ${totalCount} 件 ・ 未完 ${openCount} 件`}
                action={
                    <Button variant="primary" onClick={() => navigate('/tasks/create')}>
                        <PlusIcon />
                        タスクを作成
                    </Button>
                }
            />

            <TaskListContainer tasks={tasks} />
        </div>
    )
}

export default TasksPage
