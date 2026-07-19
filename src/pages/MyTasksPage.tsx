import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task } from '../types/task'
import { getMyTasks as fetchMyTasks } from '../api/tasks'
import TaskListContainer from '../components/TaskListContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'

// 「＋ タスクを作成」ボタンのアイコン（他一覧ページと同一）
const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const MyTasksPage = () => {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        fetchMyTasks().then(data => {
            setTasks(data)
        })
    }, [])

    // subtitle 用に件数を算出：全体件数 + 未完（DONE 以外）件数（TasksPage と同じ流儀）
    const totalCount = tasks.length
    const openCount = tasks.filter(t => t.taskStatus !== 'DONE').length

    return (
        <div>
            <PageHeader
                title="マイタスク"
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

export default MyTasksPage
