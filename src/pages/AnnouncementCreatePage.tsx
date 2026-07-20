import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Project } from '../types/project'
import type { Category } from '../types/category'
import type { Department } from '../types/department'
import type { Announcement } from '../types/announcement'
import type { Priority } from '../types/task'
import { createAnnouncement, getMyAnnouncements, deleteAnnouncement } from '../api/announcements'
import { projects as fetchProjects } from '../api/projects'
import { categories as fetchCategories } from '../api/categories'
import { departments as fetchDepartments } from '../api/departments'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { PrioritySelect } from '../components/ui/PrioritySelect'
import { Button } from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'

// ------------------------------------------------------------
// レイアウト用の styled（PatientCreatePage と同じ思想でページローカル）
// ------------------------------------------------------------

// フォーム画面用の中央カラム（760px 上限）
const Column = styled.div`
    max-width: 760px;
    margin: 0 auto;
`

// 戻るリンク（PatientCreatePage と同じ）
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

// 白カード（PatientCreatePage の FormCard と同じ理由・値）
const FormCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

// 3列グリッド（カテゴリ・対象部署・優先度の並び）。md 未満では 1 列に
const Grid3 = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};

    @media (max-width: ${props => props.theme.breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`

// ボタン列
const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

// フォーム全体エラー
const ErrorText = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

// 本文用 textarea（デザイン準拠：複数行入力）。Input と同じ theme トークンで揃える
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

// 自分の作成一覧のセクション見出し（Divider 相当・薄い区切り線＋見出し）
const SectionDivider = styled.div`
    margin-top: ${props => props.theme.spacing.xl};
    border-top: 1px solid ${props => props.theme.colors.border.default};
    padding-top: ${props => props.theme.spacing.lg};
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.muted};
    font-weight: ${props => props.theme.fontWeight.bold};
    margin-bottom: ${props => props.theme.spacing.md};
`

// 自分が作成したお知らせのリスト器
const MyList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
`

// 自分が作成した1件のカード（簡易表示）
const MyCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.md};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${props => props.theme.spacing.md};
`

const MyCardContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
    min-width: 0;
`

const MyCardTitle = styled.div`
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

const MyCardMeta = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 空表示（EmptyState 相当だが 1 行の簡易版）
const EmptyLine = styled.p`
    margin: 0;
    padding: ${props => props.theme.spacing.md};
    text-align: center;
    color: ${props => props.theme.colors.text.muted};
    font-size: ${props => props.theme.fontSize.sm};
`

const AnnouncementCreatePage = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState<number | null>(null)
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [departmentId, setDepartmentId] = useState<number | null>(null)
    const [priority, setPriority] = useState<Priority>('MEDIUM')
    const [expiredAt, setExpiredAt] = useState('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const toast = useToast()

    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([])

    const navigate = useNavigate()

    const loadMyAnnouncements = async () => {
        const data = await getMyAnnouncements()
        setMyAnnouncements(data)
    }

    // 送信処理：成功時は /announcements へ、失敗時はエラーメッセージを表示する
    const handleSubmit = async () => {
        setErrorMessage('')
        try {
            await createAnnouncement({
                title: title,
                description: description,
                projectId: projectId ?? undefined,
                categoryId: categoryId ?? undefined,
                departmentId: departmentId ?? undefined,
                priority: priority,
                expiredAt: expiredAt ? `${expiredAt}:00` : undefined,
            })
            // 成功通知：無音だと「登録できたのか」がユーザーに伝わらないため明示する
            toast.success('お知らせを作成しました')
            navigate('/announcements')
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteAnnouncement(id)
            toast.success('お知らせを削除しました')
            await loadMyAnnouncements()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    useEffect(() => {
        fetchProjects().then(setProjects)
        fetchCategories().then(setCategories)
        fetchDepartments().then(setDepartments)
        loadMyAnnouncements()
    }, [])

    // Select 用 options：ドメインは number ID → string に変換
    const projectOptions = projects.map(p => ({ value: String(p.id), label: p.projectName }))
    const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.categoryName }))
    const departmentOptions = departments.map(d => ({ value: String(d.id), label: d.departmentName }))

    return (
        <Column>
            {/* 戻るリンク */}
            <BackLink to="/announcements">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                お知らせ一覧へ戻る
            </BackLink>

            <PageHeader title="お知らせを作成" />

            <FormCard>
                {/* タイトル */}
                <FormField label="タイトル" htmlFor="ann-title">
                    <Input
                        id="ann-title"
                        type="text"
                        placeholder="お知らせのタイトルを入力"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </FormField>

                {/* プロジェクト（デザインにはないが既存機能維持のため残す・1列） */}
                <FormField label="プロジェクト" htmlFor="ann-project">
                    <Select
                        id="ann-project"
                        placeholder="プロジェクトを選択"
                        options={projectOptions}
                        value={projectId === null ? '' : String(projectId)}
                        onChange={(e) => setProjectId(e.target.value === '' ? null : Number(e.target.value))}
                    />
                </FormField>

                {/* カテゴリ / 対象部署 / 優先度：3列グリッド */}
                <Grid3>
                    <FormField label="カテゴリ" htmlFor="ann-category">
                        <Select
                            id="ann-category"
                            placeholder="選択してください"
                            options={categoryOptions}
                            value={categoryId === null ? '' : String(categoryId)}
                            onChange={(e) => setCategoryId(e.target.value === '' ? null : Number(e.target.value))}
                        />
                    </FormField>
                    <FormField label="対象部署" htmlFor="ann-department">
                        <Select
                            id="ann-department"
                            placeholder="全体"
                            options={departmentOptions}
                            value={departmentId === null ? '' : String(departmentId)}
                            onChange={(e) => setDepartmentId(e.target.value === '' ? null : Number(e.target.value))}
                        />
                    </FormField>
                    <FormField label="優先度" htmlFor="ann-priority">
                        <PrioritySelect
                            id="ann-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                        />
                    </FormField>
                </Grid3>

                {/* 掲載終了日時 */}
                <FormField label="掲載終了日時" htmlFor="ann-expiredAt">
                    <Input
                        id="ann-expiredAt"
                        type="datetime-local"
                        value={expiredAt}
                        onChange={(e) => setExpiredAt(e.target.value)}
                    />
                </FormField>

                {/* 本文（textarea） */}
                <FormField label="本文" htmlFor="ann-description">
                    <Textarea
                        id="ann-description"
                        rows={6}
                        placeholder="お知らせの本文を入力"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </FormField>

                {/* エラー */}
                {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                {/* ボタン列 */}
                <Actions>
                    <Button variant="secondary" onClick={() => navigate('/announcements')}>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        投稿する
                    </Button>
                </Actions>
            </FormCard>

            {/* 自分が作成したお知らせ一覧 */}
            <SectionDivider>作成したお知らせ</SectionDivider>
            {myAnnouncements.length === 0 ? (
                <EmptyLine>作成したお知らせはありません</EmptyLine>
            ) : (
                <MyList>
                    {myAnnouncements.map(a => (
                        <MyCard key={a.id}>
                            <MyCardContent>
                                <MyCardTitle>{a.title}</MyCardTitle>
                                <MyCardMeta>
                                    {a.category?.categoryName}
                                    {a.department?.departmentName ? ` ・ ${a.department.departmentName}` : ''}
                                </MyCardMeta>
                            </MyCardContent>
                            <Button variant="danger" onClick={() => handleDelete(a.id)}>
                                削除
                            </Button>
                        </MyCard>
                    ))}
                </MyList>
            )}
        </Column>
    )
}

export default AnnouncementCreatePage
