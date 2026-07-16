import styled, { useTheme } from "styled-components"
import { Card } from "./Card"
import { PatientIcon } from "./PatientIcon"
import type { Patient } from "../../types/patient"
import { calcAge, getAgeGroup, sexLabel, ageGroupLabel } from "../../utils/patient"

// patient という名前で Patient型を受け取る
type PatientCardProps = { patient: Patient }

// カード内の横並び行：アイコン | 本文（縦積み） | 右端シェブロン。
// width: 100% と min-width: 0 で親幅を確実に占めて、内側の左寄せを保証する
const Row = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    width: 100%;
`

// 本文の縦積み：氏名 → 振り仮名 → メタ情報。
// align-items: flex-start で子要素（氏名など）が横に伸びず左寄せに揃う
const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.xs};
    flex: 1 1 auto;
    min-width: 0;
`

// 氏名：小見出しサイズ・強調・主要文字色（デザイン18px/500 相当）
const Name = styled.div`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 振り仮名：控えめに（読み間違い防止のため常に表示）
const Kana = styled.div`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.muted};
`

// メタ情報：ラベルサイズ・補助文字色。折り返し許容。
// 区切りはグループ単位。gap は spacing.md（16px）で情報が読みやすい間隔を維持する
// （lg=24px だと開きすぎて視線が飛び、md=16px の方が読み取りやすい）
const Meta = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// メタ情報の区切り：デザインの「｜」パイプに相当する縦の細い線。
// 疑似要素だと折り返し時にラップの計算が狂いやすいので、独立要素として持つ
const Divider = styled.span`
    display: inline-block;
    width: 1px;
    height: 12px;
    background: ${props => props.theme.colors.border.default};
`

// 右端シェブロン：クリック導線を示す装飾（詳細ページへ遷移することを暗示）
const Chevron = styled.span`
    display: inline-flex;
    color: ${props => props.theme.colors.text.muted};
    flex: 0 0 auto;
`

// シェブロン（＞）SVG。Sidebar / AppHeader と同じインライン SVG + currentColor パターン
const ChevronIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6"
              stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const PatientCard = ({ patient }: PatientCardProps) => {
    // ThemeProviderが配るthemeを取得（ライト/ダーク自動対応）
    const theme = useTheme()

    // 性別 → 色ペア の対応表（themeを使うのでコンポーネント内で作る）
    const sexToColor = {
        MALE: theme.colors.patientIcon.male,
        FEMALE: theme.colors.patientIcon.female,
        UNKNOWN: theme.colors.patientIcon.unknown,
    }

    // 患者データから、アイコンに必要な情報を計算
    const age = calcAge(patient.birth)           // 生年月日 → 年齢
    const ageGroup = getAgeGroup(age)            // 年齢 → 年齢層（形）
    const iconColor = sexToColor[patient.sex]    // 性別 → 色ペア

    // 担当医名の整形。null 対策で '-' を返す既存挙動を維持
    const doctorName = patient.doctor
        ? `${patient.doctor.lastName} ${patient.doctor.firstName}`
        : '-'

    return (
        <Card>
            <Row>
                {/* 性別×年齢層のアイコン（形=ageGroup、色=iconColor） */}
                <PatientIcon ageGroup={ageGroup} color={iconColor} />

                <Content>
                    {/* 振り仮名：漢字より先に表示（病院現場で「まずカナで読みを確認してから漢字を認識」の実務パターンに合わせる） */}
                    <Kana>{patient.lastNameKana} {patient.firstNameKana}</Kana>

                    {/* 氏名：テストは「姓 名」の半角スペースで完全一致を期待 */}
                    <Name>{patient.lastName} {patient.firstName}</Name>

                    {/*
                      メタ：デザイン準拠で「年齢 性別・年齢層 ｜ 部署 ｜ 担当医」の3グループを ｜ で区切る。
                      各グループは <span>、区切りは <Divider> の独立要素（折り返し時の見た目を安定させる）
                    */}
                    <Meta>
                        <span>{age}歳 {sexLabel[patient.sex]}・{ageGroupLabel[ageGroup]}</span>
                        <Divider aria-hidden="true" />
                        <span>{patient.department?.departmentName}</span>
                        <Divider aria-hidden="true" />
                        <span>担当医師 {doctorName}</span>
                    </Meta>
                </Content>

                {/* 右端シェブロン：クリック導線を示唆する装飾 */}
                <Chevron>
                    <ChevronIcon />
                </Chevron>
            </Row>
        </Card>
    )
}
