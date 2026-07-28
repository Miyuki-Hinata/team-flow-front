// ユーザーの権限レベル(level)の意味を1箇所に集約する。
// サーバー側は User.isAdmin() が「level == 2」で管理者を判定しており、
// フロントで 2 という数値を各所に直書きすると意味が読めず、値が変わったときに追随漏れる。
// utils/role.ts の roleLabel と同じ流儀で「内部表現 → 意味」の対応をここに置く。
export const LEVEL_MEMBER = 1  // 一般ユーザー
export const LEVEL_ADMIN = 2   // 管理者（マスタ管理・ユーザー管理が可能）

// level から管理者かどうかを判定する。画面側はこの関数だけを使う
export const isAdminLevel = (level: number | undefined): boolean => level === LEVEL_ADMIN
