import type { AgeGroup } from '../types/patient'
  
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