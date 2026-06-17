import type { Task } from '../../types/task'

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
        project: null as any,
        category: null as any,
        patient: null as any,
        assignees: [],
        relatedTasks: [],
        createdAt: '2026-06-17T08:00:00',
        updatedAt: '2026-06-17T08:00:00',
        deletedAt: '',
        updatedBy: 0,
        ...overrides,  // ← 渡された値で上書き
    }
}