import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import type { Announcement } from "../types/announcement"
import type { AnnouncementHistory } from "../types/announcementHistory"
import type { Project } from "../types/project"
import type { Category } from "../types/category"
import type { Department } from "../types/department"
import type { Priority } from "../types/task"
import { getAnnouncementById as fetchAnnouncement, getAnnouncementHistories, updateAnnouncement, deleteAnnouncement } from "../api/announcements"
import { projects as fetchProjects } from '../api/projects'
import { categories as fetchCategories } from '../api/categories'
import { departments as fetchDepartments } from '../api/departments'
import { useAuth } from "../contexts/AuthContext"
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { PrioritySelect } from '../components/ui/PrioritySelect'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PriorityBadge } from '../components/ui/PriorityBadge'
import { HistoryList } from '../components/ui/HistoryList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Loading } from '../components/ui/Loading'
import { formatDueDate } from '../utils/task'
import { getCategoryTone } from '../utils/category'

// ------------------------------------------------------------
// レイアウト（お知らせ詳細は本文がある画面なので詳細ページ用の 880px を採用。
// README §Design Tokens「タスク詳細/編集は 880px」に倣う。編集はフォームなので同じ幅を維持）
// ------------------------------------------------------------

const Column = styled.div`
    max-width: 880px;
    margin: 0 auto;
`

// 戻るリンク（作成ページと同じ）
const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    text-decoration: none;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: ${props => props.theme.spacing.md};

    &:hover {
        color: ${props => props.theme.colors.text.primary};
    }
`

// 詳細表示の白カード
const DetailCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.xl};
`

// 上段：バッジ列 + 右側の編集/削除ボタン
const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    flex-wrap: wrap;
`

// バッジ列（カテゴリ・部署・優先度）
const BadgeRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;
`

// 右側の編集/削除ボタン列
const ActionRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
`

// タイトル（詳細ページ用の大見出し）
const Title = styled.h1`
    margin: 0;
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// メタ情報（投稿者・日付）
const Meta = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 本文：改行を維持（white-space: pre-wrap）、行間はゆったり
const Body = styled.div`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
    white-space: pre-wrap;
    line-height: ${props => props.theme.lineHeight.normal};
`

// 編集モードのフォームカード（AnnouncementCreatePage と同じ流儀）
const FormCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.xl};
`

const Grid3 = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};
`

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

const ErrorText = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

const Textarea = styled.textarea`
    background: ${props => props.theme.colors.surface.sunken};
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSize.md};
    font-family: inherit;
    resize: vertical;
    min-height: 128px;

    &::placeholder {
        color: ${props => props.theme.colors.text.muted};
    }
    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.brand.teal};
    }
`

const AnnouncementDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { currentUser } = useAuth()

    const [announcement, setAnnouncement] = useState<Announcement | null>(null)
    const [histories, setHistories] = useState<AnnouncementHistory[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    // 編集フォーム用 state
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editProjectId, setEditProjectId] = useState<number | null>(null)
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
    const [editDepartmentId, setEditDepartmentId] = useState<number | null>(null)
    const [editPriority, setEditPriority] = useState<Priority>('MEDIUM')
    const [editExpiredAt, setEditExpiredAt] = useState('')

    // ドロップダウン用データ
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [departments, setDepartments] = useState<Department[]>([])

    const loadAnnouncement = async () => {
        const data = await fetchAnnouncement(Number(id))
        setAnnouncement(data)
    }

    const loadHistories = async () => {
        const data = await getAnnouncementHistories(Number(id))
        setHistories(data)
    }

    // 詳細 → 編集モードへ切り替え。現状値を編集フォームにコピーする
    const enterEditMode = () => {
        if (!announcement) return
        setEditTitle(announcement.title)
        setEditDescription(announcement.description || '')
        setEditProjectId(announcement.project?.id ?? null)
        setEditCategoryId(announcement.category?.id ?? null)
        setEditDepartmentId(announcement.department?.id ?? null)
        setEditPriority(announcement.priority)
        setEditExpiredAt(announcement.expiredAt ? announcement.expiredAt.substring(0, 16) : '')
        setErrorMessage('')
        setIsEditing(true)
    }

    // 保存：成功時に本体と履歴を再取得して詳細モードに戻る
    const handleSave = async () => {
        setErrorMessage('')
        try {
            await updateAnnouncement(Number(id), {
                title: editTitle,
                description: editDescription,
                projectId: editProjectId ?? undefined,
                categoryId: editCategoryId ?? undefined,
                departmentId: editDepartmentId ?? undefined,
                priority: editPriority,
                expiredAt: editExpiredAt ? `${editExpiredAt}:00` : undefined,
            })
            await loadAnnouncement()
            await loadHistories()
            setIsEditing(false)
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    // 削除：確認ダイアログで OK を押した後に呼ばれる
    const handleDelete = async () => {
        try {
            await deleteAnnouncement(Number(id))
            // 成功通知は既存挙動どおり alert のまま（トースト化は別Issue）
            alert('お知らせを削除しました')
            navigate('/announcements')
        } catch (error) {
            alert((error as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([loadAnnouncement(), loadHistories()]).catch((error) => {
            alert(error.message)
            navigate('/announcements')
        })
        fetchProjects().then(setProjects)
        fetchCategories().then(setCategories)
        fetchDepartments().then(setDepartments)
    }, [])

    // 読み込み中は Loading コンポーネントで統一表示
    if (!announcement) {
        return (
            <Column>
                <Loading />
            </Column>
        )
    }

    // 編集/削除が可能か：作成者本人 or 管理者（既存挙動どおり）
    const canEdit = !!currentUser && !!announcement.createdBy
        && (currentUser.id === announcement.createdBy.id || currentUser.admin)

    // Select 用 options
    const projectOptions = projects.map(p => ({ value: String(p.id), label: p.projectName }))
    const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.categoryName }))
    const departmentOptions = departments.map(d => ({ value: String(d.id), label: d.departmentName }))

    // 投稿者名（null 安全）
    const authorName = announcement.createdBy
        ? `${announcement.createdBy.lastName} ${announcement.createdBy.firstName}`
        : '-'

    return (
        <Column>
            <BackLink to="/announcements">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                お知らせ一覧へ戻る
            </BackLink>

            {isEditing ? (
                // ============ 編集モード ============
                <>
                    <PageHeader title="お知らせを編集" />
                    <FormCard>
                        <FormField label="タイトル" htmlFor="ann-edit-title">
                            <Input
                                id="ann-edit-title"
                                type="text"
                                placeholder="お知らせのタイトルを入力"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </FormField>

                        <FormField label="プロジェクト" htmlFor="ann-edit-project">
                            <Select
                                id="ann-edit-project"
                                placeholder="プロジェクトを選択"
                                options={projectOptions}
                                value={editProjectId === null ? '' : String(editProjectId)}
                                onChange={(e) => setEditProjectId(e.target.value === '' ? null : Number(e.target.value))}
                            />
                        </FormField>

                        <Grid3>
                            <FormField label="カテゴリ" htmlFor="ann-edit-category">
                                <Select
                                    id="ann-edit-category"
                                    placeholder="選択してください"
                                    options={categoryOptions}
                                    value={editCategoryId === null ? '' : String(editCategoryId)}
                                    onChange={(e) => setEditCategoryId(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </FormField>
                            <FormField label="対象部署" htmlFor="ann-edit-department">
                                <Select
                                    id="ann-edit-department"
                                    placeholder="全体"
                                    options={departmentOptions}
                                    value={editDepartmentId === null ? '' : String(editDepartmentId)}
                                    onChange={(e) => setEditDepartmentId(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </FormField>
                            <FormField label="優先度" htmlFor="ann-edit-priority">
                                <PrioritySelect
                                    id="ann-edit-priority"
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                                />
                            </FormField>
                        </Grid3>

                        <FormField label="掲載終了日時" htmlFor="ann-edit-expiredAt">
                            <Input
                                id="ann-edit-expiredAt"
                                type="datetime-local"
                                value={editExpiredAt}
                                onChange={(e) => setEditExpiredAt(e.target.value)}
                            />
                        </FormField>

                        <FormField label="本文" htmlFor="ann-edit-description">
                            <Textarea
                                id="ann-edit-description"
                                rows={6}
                                placeholder="お知らせの本文を入力"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </FormField>

                        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                        <Actions>
                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                キャンセル
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                保存する
                            </Button>
                        </Actions>
                    </FormCard>
                </>
            ) : (
                // ============ 詳細表示モード ============
                <DetailCard>
                    <TopRow>
                        <BadgeRow>
                            {announcement.category?.categoryName && (
                                <Badge tone={getCategoryTone(announcement.category.categoryName)}>
                                    {announcement.category.categoryName}
                                </Badge>
                            )}
                            <Badge tone="neutral">
                                {announcement.department?.departmentName ?? '全体'}
                            </Badge>
                            <PriorityBadge priority={announcement.priority} />
                        </BadgeRow>

                        {canEdit && (
                            <ActionRow>
                                <Button variant="secondary" onClick={enterEditMode}>編集</Button>
                                <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>削除</Button>
                            </ActionRow>
                        )}
                    </TopRow>

                    <Title>{announcement.title}</Title>

                    <Meta>
                        <span>{authorName}</span>
                        {/* 投稿日はバックエンドが返さない場合があるため、値があるときだけ表示 */}
                        {announcement.createdAt && (
                            <>
                                <span>・</span>
                                <span>{formatDueDate(announcement.createdAt)}</span>
                            </>
                        )}
                    </Meta>

                    <Body>{announcement.description}</Body>
                </DetailCard>
            )}

            {/* 変更履歴：モードに関わらず常に下部に表示（AnnouncementHistory は HistoryEntry と互換） */}
            <HistoryList histories={histories} />

            {/* 削除確認ダイアログ */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => {
                    setIsDeleteOpen(false)
                    handleDelete()
                }}
                message="このお知らせを削除しますか？"
            />
        </Column>
    )
}

export default AnnouncementDetailPage
