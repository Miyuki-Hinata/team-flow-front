import type { AgeGroup, Sex } from '../types/patient'

// 生年月日から年齢を計算する
export const calcAge = (birth: string): number => {
    const today = new Date()
    const birthDate = new Date(birth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}

// 年齢層判定
export const getAgeGroup = (age: number): AgeGroup => {
    if (age < 15) return 'child'
    if (age >= 65) return 'elderly'
    return 'adult'
}

// ------------------------------------------------------------
// 表示用ラベル（一元管理）
// これまで各コンポーネント（PatientCard, PatientCreatePage 等）で同じ対応表を
// 個別に定義していたのを1箇所に集約。文言変更時はここだけ直せば全画面が追従する。
// Record<Sex, string> と Record<AgeGroup, string> の型で「値の追加漏れ」を型で防ぐ。
// ------------------------------------------------------------

// 性別 → 日本語ラベル
export const sexLabel: Record<Sex, string> = {
    MALE: '男性',
    FEMALE: '女性',
    UNKNOWN: '不明',
}

// 年齢層 → 日本語ラベル
export const ageGroupLabel: Record<AgeGroup, string> = {
    child: '小児',
    adult: '成人',
    elderly: '高齢',
}

// Select 用の options（value/label のペア配列）。
// Sex 型を配列の元にすることで、型に値が追加された時に自動で追従する（ラベル漏れは Record 側で検出）。
export const SEX_OPTIONS = (['MALE', 'FEMALE', 'UNKNOWN'] as Sex[]).map(value => ({
    value,
    label: sexLabel[value],
}))
