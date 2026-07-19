import type { TaskStatus, Priority } from '../types/task'

// ------------------------------------------------------------
// 表示用ラベル・選択肢データ（一元管理）
//
// これまで StatusBadge / TaskStatusSelect / PrioritySelect で同じ対応表を
// 個別に定義していたのを1箇所に集約。文言変更時はここだけ直せば全画面が追従する。
// `Record<TaskStatus, string>` / `Record<Priority, string>` の型で「値の追加漏れ」を
// 型で防ぐ（TaskStatus に値が増えたら Record にキーがなくコンパイルエラー）。
//
// なお PriorityBadge の "優先度 高" 等の詳細ラベルは、バッジ単体で意味が伝わる文言が
// 必要なため意図的に別文言として PriorityBadge 側に単独定義している。詳細はそちら参照。
// ------------------------------------------------------------

// TaskStatus → 日本語ラベル（バッジ / セレクト 共通）
export const statusLabel: Record<TaskStatus, string> = {
    CREATED: '未着手',
    PROGRESS: '進行中',
    REVIEWING: 'レビュー待ち',
    DONE: '完了',
}

// TaskStatus の Select 用 options（作業フロー順：未着手→進行中→レビュー待ち→完了）
export const TASK_STATUS_OPTIONS = (['CREATED', 'PROGRESS', 'REVIEWING', 'DONE'] as TaskStatus[]).map(value => ({
    value,
    label: statusLabel[value],
}))

// Priority → セレクト用の短縮ラベル（フォームで「優先度」ラベル横に並ぶ想定なので簡潔に）
export const priorityLabel: Record<Priority, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
}

// Priority の Select 用 options（重い順：高→中→低）
export const PRIORITY_OPTIONS = (['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(value => ({
    value,
    label: priorityLabel[value],
}))

// タスクの期限（ISO 文字列）を日本語風の短い表示に整形する。
// 例: "2026-11-11T11:11:00" → "11/11 11:11"
// デザイン準拠（README §8 / TeamFlow.dc.html の期限表示形式）。
// 空文字や不正な日付はそのまま（もしくは空）を返し、UI がクラッシュしないようにフォールバックする。
export const formatDueDate = (isoString: string | null | undefined): string => {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString  // パース失敗時は元の文字列をそのまま返す
    const mm = String(d.getMonth() + 1) // 月：先頭0埋めせず「6/29」のような表記に
    const dd = String(d.getDate())
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${mm}/${dd} ${hh}:${mi}`
}
