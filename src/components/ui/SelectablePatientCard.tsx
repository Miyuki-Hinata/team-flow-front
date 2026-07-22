import styled from 'styled-components'
import { Checkbox } from './Checkbox'
import { PatientCard } from './PatientCard'
import type { Patient } from '../../types/patient'

// 受け持ち選択で使う「チェックできる患者カード」。
// PatientCard（表示のみ）＋ Checkbox（選択部品）を合成しただけで、選択状態そのものは持たない。
// どの患者が選ばれているかは呼び出し側（Picker 等）が管理する（PatientCard と同じ「状態は親」方針）。
type SelectablePatientCardProps = {
    patient: Patient
    selected: boolean                    // 選択中かどうか（親が持つ状態を受け取るだけ）
    onToggle: (patientId: number) => void // トグル時に患者 ID を親へ通知する
}

// 全体を <label> にする狙い：
// ネイティブのラベル関連付けにより、カードのどこをクリックしても内側の Checkbox がトグルされる。
// → 手動の onClick や stopPropagation が不要になり、キーボード操作も checkbox 標準のまま活きる。
// 選択中は $selected を見てティールのリングで強調する（PatientCard は改変不可なので外側で表現）。
const SelectableLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    cursor: pointer;
`

// PatientCard を囲む器。残り幅いっぱいに広げつつ、選択リングを角丸に沿わせるための箱。
// min-width: 0 は、内側のメタ情報が長くても flex 子が縮めるようにして横あふれを防ぐ定石。
const CardWrapper = styled.div<{ $selected: boolean }>`
    flex: 1 1 auto;
    min-width: 0;
    border-radius: ${props => props.theme.radius.lg}; /* Card と同じ角丸。box-shadow のリングを角に沿わせる */

    /* 選択中：ティールの2pxリングで「選ばれている」ことを示す。
       PatientCard 内の Card の枠線は触れないため、外側の box-shadow で強調する。
       未選択との差をはっきりさせ、均質に並べない（メリハリ）という原則にも沿う。 */
    box-shadow: ${props =>
        props.$selected ? `0 0 0 2px ${props.theme.colors.brand.teal}` : 'none'};

    transition: box-shadow 0.15s ease;
`

export const SelectablePatientCard = ({ patient, selected, onToggle }: SelectablePatientCardProps) => {
    // アクセシビリティ用に患者名を用意（checkbox の aria-label に使い、何を選ぶかを読み上げさせる）
    const patientName = `${patient.lastName} ${patient.firstName}`

    return (
        <SelectableLabel>
            {/* checked/onChange は親状態に従属。onChange で ID を親へ返すだけで自身は state を持たない */}
            <Checkbox
                checked={selected}
                onChange={() => onToggle(patient.id)}
                aria-label={`${patientName} を受け持ちに選択`}
            />

            {/* PatientCard は丸ごと再利用（表示の責任は PatientCard に委ねる）。選択リングは器側で付ける */}
            <CardWrapper $selected={selected}>
                <PatientCard patient={patient} />
            </CardWrapper>
        </SelectableLabel>
    )
}
