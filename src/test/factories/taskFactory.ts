import type { Task } from '../../types/task'
import type { Project } from '../../types/project'
import type { Category } from '../../types/category'
import type { Patient } from '../../types/patient'

/**
 * テスト用のモック Task を作成するファクトリ関数
 * 
 * デフォルト値を持つ Task を返す。
 * overrides で必要なフィールドだけ上書きできる。
 * 
 * 使い方:
 * const task = createMockTask({ title: '体位変換', priority: 'HIGH' })
 */
export function createMockTask(overrides?: Partial<Task>): Task {
    return {
        id: 1,
        title: 'デフォルトタスク',
        description: '',
        taskStatus: 'CREATED',
        priority: 'MEDIUM',
        assignedToAll: false,
        dueDate: '',
        // 型上は必須だが、「患者に紐付かないタスク」等をテストで作るため既定は null。
        // any を避けて unknown 経由で明示キャストする
        // （型定義そのものの是正（| null 化）は別 Issue で扱う）
        project: null as unknown as Project,
        category: null as unknown as Category,
        patient: null as unknown as Patient,
        assignees: [],
        relatedTasks: [],
        createdAt: '2026-06-17T08:00:00',
        updatedAt: '2026-06-17T08:00:00',
        deletedAt: '',
        updatedBy: 0,
        ...overrides,  // ← 渡された値で上書き
    }
}