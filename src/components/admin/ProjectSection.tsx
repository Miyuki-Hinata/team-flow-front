import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'
import type { Project } from '../../types/project'
import type { Department } from '../../types/department'
import { projects as fetchProjects, createProject, updateProject, deleteProject } from '../../api/projects'

// プロジェクトのCRUDセクション。プロジェクトは「名前＋所属部署」の2項目なので、
// 汎用の MasterSection ではなく専用コンポーネントにする（部署ドロップダウンを持つ）。
// 構造は MasterSection と同じ（一覧・追加・インライン編集・削除確認）。

// 余白の考え方は MasterSection と同じ（見出し／追加フォーム／一覧を lg で分ける）
const Wrapper = styled(Card)`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

const Title = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 追加/編集フォーム：名前＋部署セレクト＋ボタン。狭幅では折り返す
const FormRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
    flex-wrap: wrap;
`

const ItemList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

const ItemRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.sm};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
    flex-wrap: wrap;
`

const ItemName = styled.span`
    flex: 1 1 auto;
    min-width: 0;
    color: ${props => props.theme.colors.text.primary};
`

// プロジェクト名の横に出す所属部署（控えめ）
const ItemDept = styled.span`
    flex: 0 0 auto;
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

const RowActions = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.xs};
    flex: 0 0 auto;

    /* margin-left:auto で左側の余りを吸わせ、常に行の右端に寄せる。
       1行に収まるときは ItemName が伸びて自然に右端へ来るが、
       幅が狭くて折り返したときは操作ボタンだけの行になり、
       これが無いと左端に張り付いて他の行とボタン位置が揃わなくなる。 */
    margin-left: auto;
`

// 部署一覧は親(AdminPage)が保持して渡す。部署セクションで追加/削除されたら親が取り直して
// この props も更新される → ドロップダウンが即座に最新化される（リロード不要）。
type ProjectSectionProps = {
    departments: Department[]
}

export const ProjectSection = ({ departments }: ProjectSectionProps) => {
    const toast = useToast()

    const [projectList, setProjectList] = useState<Project[] | null>(null)

    // 追加フォーム
    const [newName, setNewName] = useState('')
    const [newDeptId, setNewDeptId] = useState<number | null>(null)

    // インライン編集
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState('')
    const [editingDeptId, setEditingDeptId] = useState<number | null>(null)

    // 削除確認
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

    // 一覧を再取得（操作後にも呼ぶ）
    const reload = () => {
        fetchProjects().then(setProjectList).catch(() => setProjectList([]))
    }
    // 初回：プロジェクト一覧を取得（部署は props で受け取るのでここでは取らない）
    useEffect(() => {
        reload()
    }, [])

    // 部署セレクトの選択肢（Select は string を扱う）
    const departmentOptions = departments.map(d => ({ value: String(d.id), label: d.departmentName }))

    const handleAdd = async () => {
        const projectName = newName.trim()
        if (!projectName || newDeptId === null) {
            toast.error('プロジェクト名と部署を入力してください')
            return
        }
        try {
            await createProject({ projectName, departmentId: newDeptId })
            setNewName('')
            setNewDeptId(null)
            reload()
            toast.success('プロジェクトを追加しました')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'プロジェクトの追加に失敗しました')
        }
    }

    const startEdit = (project: Project) => {
        setEditingId(project.id)
        setEditingName(project.projectName)
        setEditingDeptId(project.department?.id ?? null)
    }
    const cancelEdit = () => {
        setEditingId(null)
        setEditingName('')
        setEditingDeptId(null)
    }
    const handleSave = async (id: number) => {
        const projectName = editingName.trim()
        if (!projectName || editingDeptId === null) {
            toast.error('プロジェクト名と部署を入力してください')
            return
        }
        try {
            await updateProject(id, { projectName, departmentId: editingDeptId })
            cancelEdit()
            reload()
            toast.success('プロジェクトを更新しました')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'プロジェクトの更新に失敗しました')
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await deleteProject(deleteTarget.id)
            reload()
            toast.success('プロジェクトを削除しました')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'プロジェクトの削除に失敗しました')
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <Wrapper>
            <Title>プロジェクト</Title>

            {/* 追加フォーム：名前＋部署 */}
            <FormRow>
                <Input
                    type="text"
                    placeholder="プロジェクト名を入力"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Select
                    placeholder="部署を選択"
                    options={departmentOptions}
                    value={newDeptId === null ? '' : String(newDeptId)}
                    onChange={(e) => setNewDeptId(e.target.value === '' ? null : Number(e.target.value))}
                />
                <Button variant="primary" onClick={handleAdd}>追加</Button>
            </FormRow>

            {/* 一覧 */}
            {projectList === null ? (
                <Loading />
            ) : projectList.length === 0 ? (
                <EmptyState message="プロジェクトがありません" />
            ) : (
                <ItemList>
                    {projectList.map(project => (
                        <ItemRow key={project.id}>
                            {editingId === project.id ? (
                                <>
                                    <Input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                    />
                                    <Select
                                        placeholder="部署を選択"
                                        options={departmentOptions}
                                        value={editingDeptId === null ? '' : String(editingDeptId)}
                                        onChange={(e) => setEditingDeptId(e.target.value === '' ? null : Number(e.target.value))}
                                    />
                                    <RowActions>
                                        <Button variant="primary" onClick={() => handleSave(project.id)}>保存</Button>
                                        <Button variant="secondary" onClick={cancelEdit}>取消</Button>
                                    </RowActions>
                                </>
                            ) : (
                                <>
                                    <ItemName>{project.projectName}</ItemName>
                                    <ItemDept>{project.department?.departmentName ?? '部署なし'}</ItemDept>
                                    <RowActions>
                                        <Button variant="secondary" onClick={() => startEdit(project)}>編集</Button>
                                        <Button variant="danger" onClick={() => setDeleteTarget(project)}>削除</Button>
                                    </RowActions>
                                </>
                            )}
                        </ItemRow>
                    ))}
                </ItemList>
            )}

            {/* 削除確認 */}
            <ConfirmDialog
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="プロジェクトの削除"
                message={`「${deleteTarget?.projectName}」を削除します。よろしいですか？`}
                confirmLabel="削除する"
            />
        </Wrapper>
    )
}
