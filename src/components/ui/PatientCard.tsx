import { Card } from "./Card"
import { StatusBadge } from "./StatusBadge"
import { PatientIcon } from "./PatientIcon"
import { useTheme } from "styled-components"
import type { Patient } from "../../types/patient"
import { calcAge, getAgeGroup } from "../../utils/patient"

// patient という名前で Patient型を受け取る
type PatientCardProps = { patient: Patient }

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
    
    return (
        <Card>
            {/* 性別×年齢層のアイコン（形=ageGroup、色=iconColor） */}
            <PatientIcon ageGroup={ageGroup} color={iconColor} />

            {/* 氏名 */}
            <div>{patient.lastName} {patient.firstName}</div>
            {/* 振り仮名（読み間違い防止のため常に表示） */}
            <div>{patient.lastNameKana} {patient.firstNameKana}</div>
            {/* 年齢・部署・担当医 */}
            <div>
                {age}歳　{patient.department?.departmentName}　担当医師 {patient.doctor ? `${patient.doctor.lastName} ${patient.doctor.firstName}` : '-'}
            </div>
        </Card>
    )
}