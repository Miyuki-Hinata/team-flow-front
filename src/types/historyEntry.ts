// 変更履歴の共通型。
// AnnouncementHistory / TaskHistory は完全に同じ構造なので、
// ui/HistoryList が両者を同じ描画で扱えるようにここで型を集約する。
// 各ドメイン型（AnnouncementHistory / TaskHistory）は互換な構造なので
// TypeScript の structural typing でそのまま HistoryEntry として渡せる。
export type HistoryEntry = {
    id: number
    fieldName: string             // 変更されたフィールド名（例: "priority", "taskStatus"）
    oldValue: string | null       // 変更前の値
    newValue: string | null       // 変更後の値
    changedAt: string             // ISO 文字列（例: "2026-06-29T15:30:00"）
    changedBy: {
        id: number
        lastName: string
        firstName: string
    }
}
