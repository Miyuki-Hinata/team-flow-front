import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'

// 「名前1項目だけ」のマスタ（部署・カテゴリ）向けの汎用CRUDセクション。
// 一覧表示・追加・インライン編集・削除（確認つき）をまとめて持つ再利用部品。
// 呼び出し側（AdminPage）が「取得/作成/更新/削除」の関数と表示ラベルを渡すことで、
// 部署でもカテゴリでも同じUIを使い回せる（＝重複を避ける）。
type MasterItem = { id: number; name: string }

type MasterSectionProps = {
    title: string      // セクション見出し（例：部署）
    itemLabel: string  // 入力欄のプレースホルダ（例：部署名）
    // 一覧を {id, name} に正規化して返す（呼び出し側が departmentName 等をマッピング）
    fetchItems: () => Promise<MasterItem[]>
    onCreate: (name: string) => Promise<unknown>
    onUpdate: (id: number, name: string) => Promise<unknown>
    onDelete: (id: number) => Promise<unknown>
    // 作成/更新/削除が成功した後に呼ぶ（任意）。他セクション（例：この部署を使うプロジェクト）へ変更を伝える用途。
    onChanged?: () => void
}

// セクション内は「見出し／追加フォーム／一覧」の3ブロック。
// 一覧の行間(xs)より広い lg を空けることで、この3つが別のかたまりだと余白だけで伝わる。
// （md だと行間との差が小さく、全体がひと固まりに見えて窮屈になる）
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

// 追加フォーム（入力＋ボタンを横並び）
const AddRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
`

const ItemList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 一覧の1行：名前（or編集中は入力）＋操作ボタン
const ItemRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.sm};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
`

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

export const MasterSection = ({ title, itemLabel, fetchItems, onCreate, onUpdate, onDelete, onChanged }: MasterSectionProps) => {
    const toast = useToast()

    // 一覧。null は未取得（Loading 切替）
    const [items, setItems] = useState<MasterItem[] | null>(null)
    // 追加フォームの入力値
    const [newName, setNewName] = useState('')
    // インライン編集：編集中の id と入力値（null なら編集していない）
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingName, setEditingName] = useState('')
    // 削除確認：対象の item（null ならダイアログ閉）
    const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null)

    // 一覧を読み込む（作成/更新/削除の後にも呼んで最新化する）
    const reload = () => {
        fetchItems().then(setItems).catch(() => setItems([]))
    }
    // マウント時に一度だけ読み込む。fetchItems はセクションごとに固定の想定なので依存には入れず、
    // 以降の最新化は各操作ハンドラ内の reload() で明示的に行う。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(reload, [])

    // 追加
    const handleAdd = async () => {
        const name = newName.trim()
        if (!name) return
        try {
            await onCreate(name)
            setNewName('')
            reload()
            onChanged?.()
            toast.success(`${title}を追加しました`)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : `${title}の追加に失敗しました`)
        }
    }

    // 編集開始 / 保存 / 取消
    const startEdit = (item: MasterItem) => {
        setEditingId(item.id)
        setEditingName(item.name)
    }
    const cancelEdit = () => {
        setEditingId(null)
        setEditingName('')
    }
    const handleSave = async (id: number) => {
        const name = editingName.trim()
        if (!name) return
        try {
            await onUpdate(id, name)
            cancelEdit()
            reload()
            onChanged?.()
            toast.success(`${title}を更新しました`)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : `${title}の更新に失敗しました`)
        }
    }

    // 削除（確認ダイアログの実行から呼ぶ）
    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await onDelete(deleteTarget.id)
            reload()
            onChanged?.()
            toast.success(`${title}を削除しました`)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : `${title}の削除に失敗しました`)
        } finally {
            setDeleteTarget(null)
        }
    }

    return (
        <Wrapper>
            <Title>{title}</Title>

            {/* 追加フォーム */}
            <AddRow>
                <Input
                    type="text"
                    placeholder={`${itemLabel}を入力`}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Button variant="primary" onClick={handleAdd}>追加</Button>
            </AddRow>

            {/* 一覧 */}
            {items === null ? (
                <Loading />
            ) : items.length === 0 ? (
                <EmptyState message={`${title}がありません`} />
            ) : (
                <ItemList>
                    {items.map(item => (
                        <ItemRow key={item.id}>
                            {editingId === item.id ? (
                                <>
                                    <Input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                    />
                                    <RowActions>
                                        <Button variant="primary" onClick={() => handleSave(item.id)}>保存</Button>
                                        <Button variant="secondary" onClick={cancelEdit}>取消</Button>
                                    </RowActions>
                                </>
                            ) : (
                                <>
                                    <ItemName>{item.name}</ItemName>
                                    <RowActions>
                                        <Button variant="secondary" onClick={() => startEdit(item)}>編集</Button>
                                        <Button variant="danger" onClick={() => setDeleteTarget(item)}>削除</Button>
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
                title={`${title}の削除`}
                message={`「${deleteTarget?.name}」を削除します。よろしいですか？`}
                confirmLabel="削除する"
            />
        </Wrapper>
    )
}
