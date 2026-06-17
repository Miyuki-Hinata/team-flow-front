import type { Patient } from '../../types/patient'

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
        sex: '男性',
        address: '東京都',
        tel: '090-0000-0000',
        emergencyContactName: '山田花子',
        emergencyContactTel: '090-0000-0001',
        doctor: null as any,
        department: null as any,
        createdAt: '2026-06-17T08:00:00',
        updatedAt: '2026-06-17T08:00:00',
        deletedAt: '',
        updatedBy: 0,
        ...overrides,
    }
}