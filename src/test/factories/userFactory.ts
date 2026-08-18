import type { User } from '../../types/user'
import type { Department } from '../../types/department'

/**
 * テスト用のモック User を作成するファクトリ関数
 *
 * デフォルト値を持つ User を返す。
 * overrides で必要なフィールドだけ上書きできる。
 *
 * 使い方:
 * const user = createMockUser({ lastName: '田中', role: 'DOCTOR' })
 */
export function createMockUser(overrides?: Partial<User>): User {
    return {
        id: 1,
        loginId: 'testuser',
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        email: 'testuser@example.com',
        // 型上は必須だが、テストの関心は氏名等の表示であり所属は不要なことが多いので
        // 既定は null。any を避けて unknown 経由で明示キャストする
        // （型定義そのものの是正（| null 化）は別 Issue で扱う）
        department: null as unknown as Department,
        level: 1,
        role: 'NURSE',
        createdAt: '2026-06-17T08:00:00',
        updatedAt: '2026-06-17T08:00:00',
        deletedAt: '',
        updatedBy: 0,
        ...overrides,
    }
}
