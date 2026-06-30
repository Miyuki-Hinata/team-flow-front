import { Card } from "./Card"
import type { Patient } from "../../types/patient"
import { StatusBadge } from "./StatusBadge"

// patient という名前で Patient型を受け取る
type PatientCardProps = { patient: Patient }

// 生年月日から年齢を計算する
const calcAge = (birth: string): number => {
  const today = new Date()
  const birthDate = new Date(birth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  return (
    <Card>
      {/* 氏名 */}
      <div>{patient.lastName} {patient.firstName}</div>
      {/* 振り仮名（現場で読み間違い防止のため常に表示） */}
      <div>{patient.lastNameKana} {patient.firstNameKana}</div>
      {/* 年齢・性別・部署・担当医 */}
      <div>
        {calcAge(patient.birth)}歳　{patient.sex}　
        {patient.department.departmentName}　担当 {patient.doctor.lastName}
      </div>
    </Card>
  )
}