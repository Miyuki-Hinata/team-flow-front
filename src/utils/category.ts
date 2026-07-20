// カテゴリ名 → Badge の tone マッピング。
// Announcement / Task 両方で共通利用する（同じカテゴリ体系のため）。
//
// デザイン準拠（TeamFlow.dc.html 1108行）：
//   緊急 → 赤(danger) / 連絡 → 青(info) / シフト・その他 → グレー(neutral)
// 実運用のバックエンドが返しうる別名（「業務連絡」など）も想定して意味色を割り当てる。
// 未定義のカテゴリは neutral にフォールバック（新規カテゴリでもクラッシュせず地味に表示）。

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

// カテゴリ名 → tone。バックエンドが返す文字列そのままをキーにする
const CATEGORY_TONE_MAP: Record<string, Tone> = {
    緊急: 'danger',
    連絡: 'info',
    業務連絡: 'info',   // 「連絡」の言い換えとしてバックエンドが持ちうる
    シフト: 'neutral',
    その他: 'neutral',
}

// カテゴリ名から tone を引く。未定義なら neutral（グレー）にフォールバック
export const getCategoryTone = (categoryName: string | null | undefined): Tone => {
    if (!categoryName) return 'neutral'
    return CATEGORY_TONE_MAP[categoryName] ?? 'neutral'
}
