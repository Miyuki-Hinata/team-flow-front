import { useState, useMemo } from 'react'
import styled from 'styled-components'
import TaskList from './TaskList'
import TaskFilter from './TaskFilter'
import type { Task, Priority, TaskStatus } from '../types/task'
import type { Department } from '../types/department'
import type { User } from '../types/user'

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
    const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null)
    const [filterDoctorId, setFilterDoctorId] = useState<number | null>(null)

    // フィルタ選択肢は、タスクの対象患者からユニークに導出する（追加のAPI取得は不要）。
    // patient や department/doctor が null のタスク（患者未指定など）は候補から除外する。
    const departments = useMemo<Department[]>(() => {
        const map = new Map<number, Department>()
        tasks.forEach(t => {
            const dept = t.patient?.department
            if (dept != null) map.set(dept.id, dept)
        })
        return Array.from(map.values())
    }, [tasks])

    const doctors = useMemo<User[]>(() => {
        const map = new Map<number, User>()
        tasks.forEach(t => {
            const doctor = t.patient?.doctor
            if (doctor != null) map.set(doctor.id, doctor)
        })
        return Array.from(map.values())
    }, [tasks])

    const filteredTasks = tasks.filter(task => {
        const statusMatch = filterStatus === null || task.taskStatus === filterStatus
        const priorityMatch = filterPriority === null || task.priority === filterPriority
        const departmentMatch = filterDepartmentId === null || task.patient?.department?.id === filterDepartmentId
        const doctorMatch = filterDoctorId === null || task.patient?.doctor?.id === filterDoctorId

        return statusMatch && priorityMatch && departmentMatch && doctorMatch
    })

    return (
        <Container>
            <TaskFilter
                status={filterStatus}
                priority={filterPriority}
                onStatusChange={setFilterStatus}
                onPriorityChange={setFilterPriority}
                departments={departments}
                selectedDepartmentId={filterDepartmentId}
                onDepartmentChange={setFilterDepartmentId}
                doctors={doctors}
                selectedDoctorId={filterDoctorId}
                onDoctorChange={setFilterDoctorId}
            />
            <TaskList tasks={filteredTasks} />
        </Container>
    )
}

export default TaskListContainer
