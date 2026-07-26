import type { Role } from '../types/role'

// 職種(role)の日本語ラベル。role の値 → 表示名の対応表。
// utils/task.ts の priorityLabel / statusLabel と同じ流儀で1箇所に集約する。
export const roleLabel: Record<Role, string> = {
    DOCTOR: '医師',
    NURSE: '看護師',
    PHARMACIST: '薬剤師',
    CARE_MANAGER: 'ケアマネジャー',
    OT: '作業療法士',
    PT: '理学療法士',
    MT: '臨床検査技師',
    RADIOLOGIST: '放射線技師',
    DIETITIAN: '管理栄養士',
    SOCIAL_WORKER: 'ソーシャルワーカー',
    CLERK: '事務',
}

// 部署内で職種順に並べたいときの並び順（医師→看護師→…）。数値が小さいほど先。
export const roleOrder: Record<Role, number> = {
    DOCTOR: 0,
    NURSE: 1,
    PHARMACIST: 2,
    PT: 3,
    OT: 4,
    MT: 5,
    RADIOLOGIST: 6,
    DIETITIAN: 7,
    SOCIAL_WORKER: 8,
    CARE_MANAGER: 9,
    CLERK: 10,
}
