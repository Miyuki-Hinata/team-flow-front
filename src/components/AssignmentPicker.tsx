import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { FilterBar } from './ui/FilterBar'
import { EmptyState } from './ui/EmptyState'
import { Loading } from './ui/Loading'
import { SelectablePatientCard } from './ui/SelectablePatientCard'
import { patients as fetchPatients } from '../api/patients'
import { departments as fetchDepartments } from '../api/departments'
import { replaceAssignedPatients } from '../api/assignments'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import type { Patient } from '../types/patient'
import type { Department } from '../types/department'

// 受け持ち患者を選ぶモーダル。
// 「全患者を部署で絞り込み → 複数チェック → まとめて保存（集合置換PUT）」を担う中核UI。
//
// 状態設計の要：
// ・選択の「下書き」（selectedIds）は Picker がローカルに持つ。開くたびに initialSelectedIds で初期化し、
//   キャンセルすれば下書きは破棄される（保存を押すまで確定しない）。
// ・保存はこの Picker が replaceAssignedPatients を呼び、成功後 onSaved で最新一覧を親へ返す
//   （親＝ページは受け持ちの確定状態だけを持てばよく、選択途中の状態を知る必要がない）。
type AssignmentPickerProps = {
    isOpen: boolean
    onClose: () => void
    initialSelectedIds: number[]           // 現在の受け持ち（開いた時点の初期チェック状態）
    onSaved: (patients: Patient[]) => void // 保存成功後、サーバが返す最新の受け持ち一覧を親へ渡す
}

// モーダル本体の器。幅は画面に合わせて可変（狭幅でもはみ出さない）。
const Container = styled.div`
    width: min(600px, 90vw);
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 見出し
const Title = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 選択件数の補助表示（今何名選んでいるかを常に見せる）
const CountText = styled.p`
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 患者カードの縦リスト。件数が多くてもモーダルが伸びすぎないよう max-height＋スクロール。
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    max-height: 50vh;
    overflow-y: auto;
    /* スクロールバーと選択リング（box-shadow）が重ならないよう右に軽く余白を取る */
    padding-right: ${props => props.theme.spacing.xs};
`

// フッター：操作ボタンを右寄せ（キャンセル＝副次、保存＝主要）
const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

export const AssignmentPicker = ({ isOpen, onClose, initialSelectedIds, onSaved }: AssignmentPickerProps) => {
    const toast = useToast()
    const { currentUser } = useAuth()

    // 全患者・部署一覧。null は「未取得」を表し Loading 表示の切替に使う（既存ページと同じ規約）
    const [allPatients, setAllPatients] = useState<Patient[] | null>(null)
    const [departmentList, setDepartmentList] = useState<Department[]>([])

    // 選択の下書き。Set にして has/add/delete を O(1) で扱う
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

    // 部署フィルタ。null は「すべて」
    const [departmentFilter, setDepartmentFilter] = useState<number | null>(null)

    // 保存中フラグ（二重送信防止＆ボタン表示切替）
    const [saving, setSaving] = useState(false)

    // 患者・部署は初回マウント時に一度だけ取得する
    useEffect(() => {
        fetchPatients().then(setAllPatients)
        fetchDepartments().then(setDepartmentList)
    }, [])

    // 開いた瞬間に下書きを現在の受け持ちへ初期化する。
    // これにより「前回いじりかけてキャンセル → 再度開くと確定済みの状態から再開」になる。
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set(initialSelectedIds))
            // 部署フィルタの初期値はログインユーザーの所属部署にする（自分の部署の患者から選ぶことが多いため）。
            // 未所属（departmentId が null）なら「すべて」。
            // ※ UserResponse は departmentId を単一で持つモデルなので「複数あれば最初の一つ」は
            //   自動的に departmentId 一択に帰着する。
            setDepartmentFilter(currentUser?.departmentId ?? null)
        }
    }, [isOpen, initialSelectedIds, currentUser])

    // チェックのトグル。前の Set を壊さず新しい Set を作って返す（Reactの不変更新）
    const toggle = (patientId: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(patientId)) next.delete(patientId)
            else next.add(patientId)
            return next
        })
    }

    // 部署フィルタ適用後の患者。department が null の患者もあるため optional chaining でガードする
    // （過去に null 部署でホワイトアウトした不具合の再発防止）
    const filteredPatients = useMemo(() => {
        if (!allPatients) return []
        if (departmentFilter === null) return allPatients
        return allPatients.filter(patient => patient.department?.id === departmentFilter)
    }, [allPatients, departmentFilter])

    // 部署 Select 用の選択肢（Select は string を扱うので value を文字列化）
    const departmentOptions = departmentList.map(department => ({
        value: String(department.id),
        label: department.departmentName,
    }))

    // 保存：集合置換PUT。成功したらサーバ返却の最新一覧を親へ渡して閉じる。
    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await replaceAssignedPatients(Array.from(selectedIds))
            onSaved(updated)
            toast.success('受け持ち患者を更新しました')
            onClose()
        } catch (error) {
            // api 層が投げるユーザー向けメッセージをそのまま出す（無ければ既定文）
            toast.error(error instanceof Error ? error.message : '受け持ち患者の更新に失敗しました')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Container>
                <Title>受け持ち患者を選択</Title>

                {/* 部署フィルタ：要件どおり部署で絞り込める。FilterBar＋Select は PatientFilter と同じ部品 */}
                <FilterBar>
                    <Select
                        placeholder="部署：すべて"
                        options={departmentOptions}
                        value={departmentFilter === null ? '' : String(departmentFilter)}
                        onChange={(e) => setDepartmentFilter(e.target.value === '' ? null : Number(e.target.value))}
                    />
                </FilterBar>

                <CountText>{selectedIds.size} 名 選択中</CountText>

                {/* 一覧：未取得は Loading、該当0件は EmptyState、あれば選択可能カードを並べる */}
                {allPatients === null ? (
                    <Loading />
                ) : filteredPatients.length === 0 ? (
                    <EmptyState message="該当する患者がいません" />
                ) : (
                    <List>
                        {filteredPatients.map(patient => (
                            <SelectablePatientCard
                                key={patient.id}
                                patient={patient}
                                selected={selectedIds.has(patient.id)}
                                onToggle={toggle}
                            />
                        ))}
                    </List>
                )}

                <Footer>
                    {/* キャンセル：下書きを破棄して閉じる（保存しない限り確定しない） */}
                    <Button variant="secondary" onClick={onClose} disabled={saving}>
                        キャンセル
                    </Button>
                    {/* 保存：集合置換PUT。保存中は二重送信を防ぐため無効化 */}
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? '保存中...' : '保存'}
                    </Button>
                </Footer>
            </Container>
        </Modal>
    )
}
