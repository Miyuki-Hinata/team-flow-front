// layouts/navItems.ts
// サイドバーとヘッダーのパンくずで共有するナビ定義。
// 「パス ⇔ 日本語ラベル」の対応をここ1箇所に集約し、二重管理を防ぐ。
// 追加/変更時はここだけ直せば、サイドバーの項目もパンくずの現在画面名も自動で追従する。

export type NavItem = {
    path: string   // ルーティングのパス（前方一致でアクティブ判定に使う）
    label: string  // サイドバーとパンくずで共通の日本語ラベル
}

// ※順序はサイドバーの表示順（デザインどおり：ダッシュボード → 患者 → お知らせ → 全タスク → マイタスク）
export const NAV_ITEMS: NavItem[] = [
    { path: '/dashboard',      label: 'ダッシュボード' },
    { path: '/patients',       label: '患者一覧' },
    { path: '/announcements',  label: 'お知らせ' },
    { path: '/tasks',          label: '全タスク' },
    { path: '/tasks/my-tasks', label: 'マイタスク' },
]

// 現在の pathname から、対応する日本語ラベル（＝パンくずの現在画面名）を引く。
// 前方一致で判定するため、より長いパスを優先する（例：/tasks/my-tasks が /tasks より先に一致する）。
// 一致するものが無ければ空文字を返す（呼び出し側でハンドリング）。
export const findCurrentLabel = (pathname: string): string => {
    const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length)
    const hit = sorted.find(item => pathname.startsWith(item.path))
    return hit ? hit.label : ''
}
