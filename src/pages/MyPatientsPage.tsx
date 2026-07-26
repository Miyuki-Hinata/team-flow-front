import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { Patient } from '../types/patient'
import type { Task } from '../types/task'
import { getAssignedPatients, replaceAssignedPatients } from '../api/assignments'
import { getTasksByPatientId } from '../api/tasks'
import { PatientCard } from '../components/ui/PatientCard'
import { PatientTimeline } from '../components/ui/PatientTimeline'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Loading } from '../components/ui/Loading'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Tabs } from '../components/ui/Tabs'
import type { TabItem } from '../components/ui/Tabs'
import { AssignmentPicker } from '../components/AssignmentPicker'
import { useToast } from '../contexts/ToastContext'

// 受け持ち患者一覧 / 本日のタイムライン の表示切替タブの値
type ViewTab = 'patients' | 'timeline'

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

// 患者カード群とタイムラインを大きめの間隔で縦に積む（セクションの区切りを明確にする）
const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xl};
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

// タイムラインの上に置く日付切替バー（今日〜6日後）。狭幅では横スクロール
const DateBar = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.xs};
    overflow-x: auto;
    padding-bottom: ${props => props.theme.spacing.xs};
`

// 日付チップ：選択中はティール塗り＋白文字、非選択は白背景＋枠線
const DateChip = styled.button<{ $active: boolean }>`
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 52px;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.radius.md};
    cursor: pointer;
    font-family: inherit;
    background: ${props => props.$active ? props.theme.colors.brand.teal : props.theme.colors.surface.raised};
    color: ${props => props.$active ? props.theme.colors.text.onBrand : props.theme.colors.text.primary};
    border: 1px solid ${props => props.$active ? props.theme.colors.brand.teal : props.theme.colors.border.default};
`

// チップ内の曜日（小さめ）と日付
const DateChipDow = styled.span`
    font-size: ${props => props.theme.fontSize.xs};
`
const DateChipMd = styled.span`
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
`

// 1日分のセル：上に「今日」バッジ枠、下にチップ。バッジ枠は常に確保して高さを揃える
const DateCell = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 0 0 auto;
`

// 「今日」バッジ（ティールの小さなピル）
const TodayBadge = styled.span`
    font-size: 10px;
    line-height: 16px;
    height: 16px;
    padding: 0 ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.radius.full};
    background: ${props => props.theme.colors.brand.teal};
    color: ${props => props.theme.colors.text.onBrand};
    font-weight: ${props => props.theme.fontWeight.bold};
`

// 今日以外のセルで高さを合わせるための空スロット（バッジと同じ高さ）
const TodayBadgeSlot = styled.span`
    height: 16px;
`

// タイムラインタブの中身（日付バー＋タイムライン）を縦に積む
const TimelineWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const MyPatientsPage = () => {
    const toast = useToast()

    // 確定した受け持ち。null は未取得を表す（既存ページと同じ Loading 規約）
    const [assignedPatients, setAssignedPatients] = useState<Patient[] | null>(null)

    // タイムライン用：受け持ち患者たちのタスク。null は未取得（Loading 切替）
    const [patientTasks, setPatientTasks] = useState<Task[] | null>(null)

    // モーダル/確認ダイアログの開閉（開閉状態は各コンポーネントに渡すためここで持つ）
    const [pickerOpen, setPickerOpen] = useState(false)
    const [confirmClearOpen, setConfirmClearOpen] = useState(false)

    // 表示切替：受け持ち患者が多いとタイムラインまで大きくスクロールが要るため、一覧とタイムラインをタブで分ける。
    // デフォルトは「受け持ち患者」（まず誰を受け持つか確認する導線）
    const [activeView, setActiveView] = useState<ViewTab>('patients')

    // タイムラインで表示する日付（既定は今日の 0:00）。日付チップで切り替える
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    })

    // 切替候補：今日〜6日後の7日分（向こう1週間）
    const weekDates = useMemo<Date[]>(() => (
        Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            d.setDate(d.getDate() + i)
            return d
        })
    ), [])

    // 初回に現在の受け持ちを取得する
    useEffect(() => {
        getAssignedPatients().then(setAssignedPatients)
    }, [])

    // 受け持ちが変わるたび（初回取得・保存・クリア）、その患者たちのタスクをまとめて取得する。
    // 患者ごとに getTasksByPatientId を並列で呼び、結果を1本の配列に平坦化してタイムラインへ渡す。
    // ※ MyPatients は患者起点なので「その患者に紐づく全タスク」を対象にする（自分のタスクだけではない）。
    useEffect(() => {
        if (assignedPatients === null) return
        if (assignedPatients.length === 0) {
            setPatientTasks([])
            return
        }
        setPatientTasks(null) // 再取得中は Loading に戻す
        Promise.all(assignedPatients.map(patient => getTasksByPatientId(patient.id)))
            .then(results => setPatientTasks(results.flat() as Task[]))
            .catch(() => setPatientTasks([]))
    }, [assignedPatients])

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
            <Stack>
                {/* 一覧 / タイムライン の切替タブ。受け持ち数が多い時のスクロール負担を避ける（#5対策） */}
                <Tabs
                    items={([
                        { value: 'patients', label: '受け持ち患者', count: assignedPatients.length },
                        { value: 'timeline', label: 'タイムライン' },
                    ]) as TabItem<ViewTab>[]}
                    activeValue={activeView}
                    onChange={setActiveView}
                />

                {activeView === 'patients' ? (
                    // 受け持ち患者カード：クリックで詳細へ
                    <List>
                        {assignedPatients.map(patient => (
                            <CardLink key={patient.id} to={`/patients/${patient.id}`}>
                                <PatientCard patient={patient} />
                            </CardLink>
                        ))}
                    </List>
                ) : (
                    // タイムライン：日付チップ（今日〜6日後）で表示日を切り替え、選択日のタスクを可視化
                    <TimelineWrap>
                        <DateBar>
                            {weekDates.map((d, i) => {
                                const dow = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
                                const active = d.getTime() === selectedDate.getTime()
                                const isToday = i === 0 // weekDates は今日始まりなので先頭が今日
                                return (
                                    <DateCell key={d.getTime()}>
                                        {isToday ? <TodayBadge>今日</TodayBadge> : <TodayBadgeSlot />}
                                        <DateChip
                                            type="button"
                                            $active={active}
                                            onClick={() => setSelectedDate(d)}
                                        >
                                            <DateChipDow>{dow}</DateChipDow>
                                            <DateChipMd>{d.getMonth() + 1}/{d.getDate()}</DateChipMd>
                                        </DateChip>
                                    </DateCell>
                                )
                            })}
                        </DateBar>
                        {patientTasks === null
                            ? <Loading />
                            : <PatientTimeline tasks={patientTasks} date={selectedDate} />}
                    </TimelineWrap>
                )}
            </Stack>
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
