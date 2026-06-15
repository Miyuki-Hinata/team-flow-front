import { useState, useEffect, useMemo } from 'react'
import type { Task, TaskStatus } from '../types/task'
import { getPatientById } from '../api/patients'
import { useNavigate, useParams } from 'react-router-dom'
import { getTasksByPatientId } from '../api/tasks'
import type { Patient } from '../types/patient'
import TaskCard from '../components/TaskCard'
import { useAuth } from '../contexts/AuthContext'
import type { TaskSummaryResponse } from '../types/taskSummary'
import { getTaskSummary, generateTaskSummary } from '../api/taskSummaries'

type TabType = 'all' | 'category' | 'my'

const TASK_STATUSES: TaskStatus[] = ['CREATED', 'PROGRESS', 'REVIEWING', 'DONE']

const PatientDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { currentUser } = useAuth()
    
    const [tasks, setTasks] = useState<Task[] | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [taskSummary, setTaskSummary] = useState<TaskSummaryResponse | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)  // 生成中かどうか

    useEffect(() => {
        getPatientById(Number(id))
            .then(data => setPatient(data))
            .catch((error) => {
                alert(error.message)
                navigate('/patients')
            })
        
        getTasksByPatientId(Number(id))
            .then(data => setTasks(data))
            .catch((error) => {
                alert(error.message)
                navigate('/patients')
            })

        // サマリのキャッシュを取得
        getTaskSummary(Number(id))
            .then(data => setTaskSummary(data))
            .catch(() => {
                // エラーは無視（サマリ未生成は正常な状態）
        })

    }, [id])
    
    // タブに応じてタスクをフィルタリング
    const filteredTasks = useMemo(() => {
        if (!tasks) return []
        
        if (activeTab === 'my') {
            // 自分が担当のタスクのみ
            return tasks.filter(task => 
                task.assignees?.some(assignee => assignee.id === currentUser?.id)
            )
        }
        
        // all と department は同じタスクセット（表示方法だけ変える）
        return tasks
    }, [tasks, activeTab, currentUser])
    
    // カテゴリ別にグルーピング
    const tasksByCategory = useMemo(() => {
        const groups: { [key: string]: Task[] } = {}
        filteredTasks.forEach(task => {
            const categoryName = task.category?.categoryName || '未分類'
            if (!groups[categoryName]) groups[categoryName] = []
            groups[categoryName].push(task)
        })
        return groups
    }, [filteredTasks])
    
    // ステータス別にグルーピング
    const tasksByStatus = (taskList: Task[]) => {
        const groups: { [key in TaskStatus]: Task[] } = {
            CREATED: [],
            PROGRESS: [],
            REVIEWING: [],
            DONE: []
        }
        taskList.forEach(task => {
            groups[task.taskStatus]?.push(task)
        })
        return groups
    }
    // 優先度を数値に変換（並び替え用）
    const priorityValue = (priority: string) => {
        if (priority === 'HIGH') return 3
        if (priority === 'MEDIUM') return 2
        return 1  // LOW
    }

    // タスクを並び替える
    const sortTasks = (taskList: Task[]) => {
        return [...taskList].sort((a, b) => {
            let comparison = 0
            
            if (sortBy === 'priority') {
                comparison = priorityValue(b.priority) - priorityValue(a.priority)
            } else {
                // createdAt は文字列なので、Dateに変換して比較
                comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            
            // 昇順なら逆にする
            return sortOrder === 'asc' ? -comparison : comparison
        })
    }

    const handleGenerateSummary = async () => {
        setIsGenerating(true)
        try {
            const data = await generateTaskSummary(Number(id))
            setTaskSummary(data)
        } catch (error) {
            alert((error as Error).message)
        } finally {
            setIsGenerating(false)
        }
    }


    
    return (
        <div>
            {patient ? (
                <div>
                    <h2>{patient.lastName} {patient.firstName}</h2>
                    
                    <section>
                        <h3>基本情報</h3>
                        <p>カナ：{patient.lastNameKana} {patient.firstNameKana}</p>
                        <p>生年月日：{patient.birth}</p>
                        <p>性別：{patient.sex}</p>
                        <p>主治医：{patient.doctor?.lastName} {patient.doctor?.firstName}</p>
                        <p>所属部署：{patient.department?.departmentName}</p>
                    </section>
                    
                    <section>
                        <h3>連絡先情報</h3>
                        <p>住所：{patient.address}</p>
                        <p>電話番号：{patient.tel}</p>
                        <p>緊急連絡先：{patient.emergencyContactName}（{patient.emergencyContactTel}）</p>
                    </section>
                </div>
            ) : (
                <p>読み込み中...</p>
            )}

            {/* サマリセクション */}
            <section>
                <h3>📊 AIタスクサマリ</h3>
                
                {taskSummary ? (
                    <>
                        <p>
                            最終更新：{taskSummary.generatedAt} / 生成者：{taskSummary.generatedByName}
                        </p>
                        <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '12px' }}>
                            {taskSummary.summary}
                        </div>
                        <button onClick={handleGenerateSummary} disabled={isGenerating}>
                            {isGenerating ? '生成中...' : '再生成'}
                        </button>
                    </>
                ) : (
                    <>
                        <p>サマリ未生成</p>
                        <button onClick={handleGenerateSummary} disabled={isGenerating}>
                            {isGenerating ? '生成中...' : 'サマリを生成'}
                        </button>
                    </>
                )}
            </section>
            
            {/* タスク一覧セクション */}
            <section>
                <h3>タスク一覧</h3>
                
                {/* タブ切り替え */}
                <div>
                    <button onClick={() => setActiveTab('all')}>
                        すべて
                    </button>
                    <button onClick={() => setActiveTab('category')}>
                        カテゴリ別
                    </button>
                    <button onClick={() => setActiveTab('my')}>
                        マイタスク
                    </button>
                </div>

                {/* 並び替え */}
                <div>
                    並び替え：
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'priority' | 'createdAt')}>
                        <option value="createdAt">発行日時</option>
                        <option value="priority">緊急度</option>
                    </select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
                        <option value="desc">降順</option>
                        <option value="asc">昇順</option>
                    </select>
                </div>
                
                {tasks ? (
                    activeTab === 'category' ? (
                        // カテゴリ別表示
                        Object.entries(tasksByCategory).map(([categoryName, categoryTasks]) => (
                            <div key={categoryName}>
                                <h4>{categoryName}</h4>
                                <KanbanBoard tasks={categoryTasks} statuses={TASK_STATUSES} groupByStatus={tasksByStatus} sortTasks={sortTasks}/>
                            </div>
                        ))
                    ) : (
                        // すべて / マイタスク 表示
                        <KanbanBoard tasks={filteredTasks} statuses={TASK_STATUSES} groupByStatus={tasksByStatus} sortTasks={sortTasks}/>
                    )
                ) : (
                    <p>読み込み中...</p>
                )}
            </section>
        </div>
    )
}

// ステータス別カンバン表示の小コンポーネント
type KanbanBoardProps = {
    tasks: Task[]
    statuses: TaskStatus[]
    groupByStatus: (tasks: Task[]) => { [key in TaskStatus]: Task[] }
    sortTasks: (tasks: Task[]) => Task[]  // ← 追加
}

const KanbanBoard = ({ tasks, statuses, groupByStatus, sortTasks }: KanbanBoardProps) => {
    const grouped = groupByStatus(tasks)
    
    return (
        <div style={{ display: 'flex', gap: '16px' }}>
            {statuses.map(status => (
                <div key={status} style={{ flex: 1, border: '1px solid #ccc', padding: '8px' }}>
                    <h5>{status}</h5>
                    {grouped[status].length > 0 ? (
                           sortTasks(grouped[status]).map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    ) : (
                        <p>タスクなし</p>
                    )}
                </div>
            ))}
        </div>
    )
}

export default PatientDetailPage