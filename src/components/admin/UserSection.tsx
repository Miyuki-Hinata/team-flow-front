import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Loading } from '../ui/Loading'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { UserFormModal } from './UserFormModal'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { roleLabel, roleOrder } from '../../utils/role'
import { isAdminLevel } from '../../utils/user'
import type { Role } from '../../types/role'
import type { User } from '../../types/user'
import type { Department } from '../../types/department'
import type { UserInput } from '../../api/users'
import { users as fetchUsers, createUser, updateUser, deleteUser } from '../../api/users'

// ユーザー（職員）のCRUDセクション。
// 一覧表示・削除確認はマスタ系（MasterSection / ProjectSection）と同じ構造だが、
// 入力項目が10個あり行内編集に収まらないため、追加/編集は UserFormModal に切り出している。
// このコンポーネントの責任は「一覧の取得・表示」と「API呼び出しの取りまとめ」まで。

// 余白の考え方は MasterSection と同じ（見出し＋追加ボタン／一覧を lg で分ける）
const Wrapper = styled(Card)`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

// 見出しと「追加」ボタンを両端に配置する
const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${props => props.theme.spacing.sm};
`

const Title = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 職種グループ同士の間隔。中の部署グループ(md)より広く取り、階層を余白で表す
const GroupList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

const RoleGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 職種の見出し（第1階層）。下線を引いて「ここから別の職種」であることを示す
const RoleHeading = styled.h3`
    margin: 0;
    padding-bottom: ${props => props.theme.spacing.xs};
    border-bottom: 1px solid ${props => props.theme.colors.border.default};
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

const DepartmentGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 部署の見出し（第2階層）。職種見出しより小さく・淡くして従属関係を示す
const DepartmentHeading = styled.h4`
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.secondary};
`

const ItemList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 1行の中身は「氏名／管理者バッジ／操作ボタン」だけ。
// 職種・部署は見出しに移したので、行ごとの文字数の差が小さくなり、
// 画面幅を狭めても折り返し位置がばらつかない（＝表示がガタつかない）。
const ItemRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.sm};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
`

// 氏名（主情報）。残り幅を占有して、右の操作ボタンを端に押し出す
const ItemName = styled.span`
    flex: 1 1 auto;
    min-width: 0;
    color: ${props => props.theme.colors.text.primary};
`

const RowActions = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.xs};
    flex: 0 0 auto;
`

// 部署一覧は親(AdminPage)が保持して渡す。部署セクションで追加/削除された内容が
// このフォームの部署ドロップダウンにも即反映される（ProjectSection と同じ方針）。
type UserSectionProps = {
    departments: Department[]
}

export const UserSection = ({ departments }: UserSectionProps) => {
    const toast = useToast()
    // ログイン中のユーザー。自分自身の削除を防ぐ判定に使う
    const { currentUser } = useAuth()

    // 一覧。null は未取得（Loading 切替）
    const [userList, setUserList] = useState<User[] | null>(null)

    // フォームの開閉と対象。editingUser が null かつ isFormOpen なら「新規追加」
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // 削除確認：対象ユーザー（null ならダイアログ閉）
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

    const reload = () => {
        fetchUsers().then(setUserList).catch(() => setUserList([]))
    }
    useEffect(reload, [])

    // 一覧を「職種 → 部署」の2階層にまとめる。
    // 職種を外側にしたのは、職種は入職後ほとんど変わらないのに対し部署は異動で変わるため、
    // 管理者が人を探すときの手がかりとして安定している方を先に置く、という判断。
    // 並べ替えは表示のたびに走るので useMemo で userList が変わったときだけ計算する。
    const groupedUsers = useMemo(() => {
        if (userList === null) return []

        // まず職種ごとに振り分ける
        const byRole = new Map<Role, User[]>()
        for (const user of userList) {
            const members = byRole.get(user.role) ?? []
            members.push(user)
            byRole.set(user.role, members)
        }

        // 職種の並びは roleOrder（医師→看護師→…）に従う。職種名の五十音順ではなく
        // 業務上の並びを使うことで、他画面（担当者選択）と同じ順序になる
        const roles = [...byRole.keys()].sort((a, b) => roleOrder[a] - roleOrder[b])

        return roles.map(role => {
            // 次に部署ごとに振り分ける。部署未設定は空文字をキーにする
            const byDepartment = new Map<string, User[]>()
            for (const user of byRole.get(role) ?? []) {
                const departmentName = user.department?.departmentName ?? ''
                const members = byDepartment.get(departmentName) ?? []
                members.push(user)
                byDepartment.set(departmentName, members)
            }

            const departmentNames = [...byDepartment.keys()].sort((a, b) => {
                // 部署未設定は例外的な状態なので必ず末尾に置く（先頭に来ると目に付きすぎる）
                if (a === '') return 1
                if (b === '') return -1
                return a.localeCompare(b, 'ja')
            })

            return {
                role,
                departments: departmentNames.map(departmentName => ({
                    departmentName,
                    // 部署内は氏名のかな順。漢字の氏名で並べると読み方と一致せず探しにくいため
                    users: (byDepartment.get(departmentName) ?? []).sort((a, b) =>
                        `${a.lastNameKana}${a.firstNameKana}`.localeCompare(`${b.lastNameKana}${b.firstNameKana}`, 'ja')
                    ),
                })),
            }
        })
    }, [userList])

    const openCreateForm = () => {
        setEditingUser(null)
        setIsFormOpen(true)
    }
    const openEditForm = (user: User) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }
    const closeForm = () => {
        setIsFormOpen(false)
        setEditingUser(null)
    }

    // 追加と編集で保存先が違うだけなので、ハンドラは1つにまとめて分岐する。
    // 成功したときだけモーダルを閉じる（失敗時は入力内容を残して直せるようにする）。
    const handleSubmit = async (input: UserInput) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, input)
                toast.success('ユーザーを更新しました')
            } else {
                await createUser(input)
                toast.success('ユーザーを追加しました')
            }
            closeForm()
            reload()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'ユーザーの保存に失敗しました')
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await deleteUser(deleteTarget.id)
            reload()
            toast.success('ユーザーを削除しました')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'ユーザーの削除に失敗しました')
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <Wrapper>
            <Header>
                <Title>ユーザー</Title>
                {/* 項目が多くフォームはモーダルなので、追加は「入力欄」ではなくボタンで開く */}
                <Button variant="primary" onClick={openCreateForm}>追加</Button>
            </Header>

            {userList === null ? (
                <Loading />
            ) : userList.length === 0 ? (
                <EmptyState message="ユーザーがいません" />
            ) : (
                <GroupList>
                    {groupedUsers.map(group => (
                        <RoleGroup key={group.role}>
                            <RoleHeading>{roleLabel[group.role]}</RoleHeading>

                            {group.departments.map(department => (
                                // 部署未設定は空文字なので、key と表示は別に用意する
                                <DepartmentGroup key={department.departmentName || 'none'}>
                                    <DepartmentHeading>
                                        {department.departmentName || '部署なし'}
                                    </DepartmentHeading>

                                    <ItemList>
                                        {department.users.map(user => {
                                            // 自分自身を削除するとログイン中のアカウントが消えて操作不能になるため禁止する
                                            const isSelf = currentUser?.id === user.id
                                            return (
                                                <ItemRow key={user.id}>
                                                    <ItemName>{user.lastName} {user.firstName}</ItemName>
                                                    {/* 管理者だけバッジで示す。一般ユーザーには何も出さず視覚的ノイズを増やさない */}
                                                    {isAdminLevel(user.level) && <Badge tone="info">管理者</Badge>}
                                                    <RowActions>
                                                        <Button variant="secondary" onClick={() => openEditForm(user)}>編集</Button>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => setDeleteTarget(user)}
                                                            disabled={isSelf}
                                                            title={isSelf ? '自分自身は削除できません' : undefined}
                                                        >
                                                            削除
                                                        </Button>
                                                    </RowActions>
                                                </ItemRow>
                                            )
                                        })}
                                    </ItemList>
                                </DepartmentGroup>
                            ))}
                        </RoleGroup>
                    ))}
                </GroupList>
            )}

            {/* 追加/編集フォーム。user が null なら追加モードになる */}
            <UserFormModal
                isOpen={isFormOpen}
                onClose={closeForm}
                user={editingUser}
                departments={departments}
                onSubmit={handleSubmit}
            />

            {/* 削除確認 */}
            <ConfirmDialog
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="ユーザーの削除"
                message={`「${deleteTarget?.lastName ?? ''} ${deleteTarget?.firstName ?? ''}」を削除します。よろしいですか？`}
                confirmLabel="削除する"
            />
        </Wrapper>
    )
}
