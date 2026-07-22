import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { Patient } from '../types/patient'
import { getAssignedPatients, replaceAssignedPatients } from '../api/assignments'
import { PatientCard } from '../components/ui/PatientCard'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Loading } from '../components/ui/Loading'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { AssignmentPicker } from '../components/AssignmentPicker'
import { useToast } from '../contexts/ToastContext'

// 受け持ち患者ビュー（患者起点）。
// 「シフト開始時に選んだ受け持ち患者だけ」にフォーカスして表示する。
// タスク起点の MyTasksPage とは別軸で、こちらは選んだ患者そのものを一覧する。
//
// 状態の持ち方：
// ・assignedPatients が「確定した受け持ち」の単一情報源。null は未取得（Loading 切替）。
// ・選択途中の下書きは AssignmentPicker 側が持ち、保存成功時に onSaved でここへ最新一覧が返る。

// ヘッダー右のボタン群（クリア・受け持ちを選択）を横並びにする
const HeaderActions = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
`

// 受け持ちカードの縦リスト。他一覧と同じ標準余白で揃える
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// カード全体を詳細ページへのリンクにする。<a> 既定の下線を消し、ブロック要素として広げる
// （PatientCard はシェブロンで遷移を示唆する表示専用部品。ナビゲーションは呼び出し側の責任、という分担）
const CardLink = styled(Link)`
    text-decoration: none;
    display: block;
`

// 未選択時：メッセージと選択導線（CTA）を中央に縦積みする
const EmptyWrap = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
`

const MyPatientsPage = () => {
    const toast = useToast()

    // 確定した受け持ち。null は未取得を表す（既存ページと同じ Loading 規約）
    const [assignedPatients, setAssignedPatients] = useState<Patient[] | null>(null)

    // モーダル/確認ダイアログの開閉（開閉状態は各コンポーネントに渡すためここで持つ）
    const [pickerOpen, setPickerOpen] = useState(false)
    const [confirmClearOpen, setConfirmClearOpen] = useState(false)

    // 初回に現在の受け持ちを取得する
    useEffect(() => {
        getAssignedPatients().then(setAssignedPatients)
    }, [])

    // Picker 起動時の初期チェック状態＝今の受け持ちの ID 群
    const selectedIds = assignedPatients?.map(patient => patient.id) ?? []

    // 保存成功時：サーバ返却の最新一覧で確定状態を差し替える（再フェッチ不要）
    const handleSaved = (patients: Patient[]) => {
        setAssignedPatients(patients)
    }

    // クリア確定：空配列で集合置換PUT（＝全解除）。成功後は空一覧に差し替える
    const handleClearConfirm = async () => {
        try {
            const updated = await replaceAssignedPatients([])
            setAssignedPatients(updated) // 空配列が返る
            toast.success('受け持ちをクリアしました')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '受け持ちのクリアに失敗しました')
        } finally {
            setConfirmClearOpen(false)
        }
    }

    // ボディの出し分け：未取得 / 0件 / 一覧 の3状態
    let body
    if (assignedPatients === null) {
        body = <Loading />
    } else if (assignedPatients.length === 0) {
        body = (
            <EmptyWrap>
                <EmptyState message="受け持ち患者が選択されていません" />
                <Button variant="primary" onClick={() => setPickerOpen(true)}>
                    受け持ちを選択
                </Button>
            </EmptyWrap>
        )
    } else {
        body = (
            <List>
                {assignedPatients.map(patient => (
                    <CardLink key={patient.id} to={`/patients/${patient.id}`}>
                        <PatientCard patient={patient} />
                    </CardLink>
                ))}
            </List>
        )
    }

    return (
        <div>
            <PageHeader
                title="受け持ち患者"
                subtitle={assignedPatients ? `${assignedPatients.length} 名` : undefined}
                action={
                    <HeaderActions>
                        {/* クリアは受け持ちがある時だけ出す（無い時に出しても押せることがない） */}
                        {assignedPatients && assignedPatients.length > 0 && (
                            <Button variant="secondary" onClick={() => setConfirmClearOpen(true)}>
                                クリア
                            </Button>
                        )}
                        <Button variant="primary" onClick={() => setPickerOpen(true)}>
                            受け持ちを選択
                        </Button>
                    </HeaderActions>
                }
            />

            {body}

            {/* 受け持ち選択モーダル：現在の受け持ちを初期チェックに、保存で最新一覧を受け取る */}
            <AssignmentPicker
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                initialSelectedIds={selectedIds}
                onSaved={handleSaved}
            />

            {/* クリア確認：取り消せない一括解除なので確認を挟む */}
            <ConfirmDialog
                isOpen={confirmClearOpen}
                onClose={() => setConfirmClearOpen(false)}
                onConfirm={handleClearConfirm}
                title="受け持ちのクリア"
                message="受け持ち患者をすべて解除します。よろしいですか？"
                confirmLabel="クリアする"
            />
        </div>
    )
}

export default MyPatientsPage
