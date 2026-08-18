import type { Patient } from '../../types/patient'
import type { User } from '../../types/user'
import type { Department } from '../../types/department'

/**
 * テスト用のモック Patient を作成するファクトリ関数
 */
export function createMockPatient(overrides?: Partial<Patient>): Patient {
    return {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        birth: '1980-01-01',
        sex: 'MALE',
        address: '東京都',
        tel: '090-0000-0000',
        emergencyContactName: '山田花子',
        emergencyContactTel: '090-0000-0001',
        // 型上は必須だが、「主治医表示なし」等をテストで作るため既定は null。
        // any を避けて unknown 経由で明示キャストする
        // （型定義そのものの是正（| null 化）は別 Issue で扱う）
        doctor: null as unknown as User,
        department: null as unknown as Department,
        createdAt: '2026-06-17T08:00:00',
        updatedAt: '2026-06-17T08:00:00',
        deletedAt: '',
        updatedBy: 0,
        ...overrides,
    }
}