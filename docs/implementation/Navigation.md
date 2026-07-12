# Navigation（リファクタ・暫定）

## 何を作ったか
`src/components/Navigation.tsx` のリファクタ。素の `<div>` / `<Link>` / `<button>` を、theme トークンで整えた styled と `ui/Button` に置き換えた。

> **暫定リファクタ**：README §App Shell では Navigation は「サイドバー内のナビ項目（現在地=ティール塗り、未読バッジ、施設情報 等）」だが、今回は App Shell 実装フェーズが別途あるため、既存の横並びナビ構造を維持したまま素の要素の土台化に留めた。サイドバー化は App Shell フェーズで実施予定。

## 何を何に置き換えたか
| 旧 | 新 |
|---|---|
| 器 `<div>` | `Nav`（styled.nav、横並び＋余白トークン） |
| 素 `<Link>`（下線・紫継承） | `NavLink = styled(Link)`（色/サイズ/hover をトークン化） |
| ユーザー名トグル `<button>` | `ui/Button` variant="secondary" |
| ドロップダウン器 `<div style={{position, background:'var(--bg)'}}>` | `Dropdown`（surface.raised・枠線・角丸・padding） |
| パスワード変更 `<button>` | `ui/Button` variant="secondary" |
| ログアウト `<button>` | `ui/Button` variant="danger"（取り消せない操作を赤で警告） |

## なぜこの設計にしたか
- **`ui/UserMenu` は使わなかった**：UserMenu は雛形で機能未実装（ユーザー名ハードコード、ログアウト処理・パスワード変更フォームなし）。差し替えると認証・ログアウト API 連携が壊れるため、今回は既存 Navigation のロジックを温存し、見た目の層だけを土台化した。UserMenu への統合は App Shell フェーズで別途検討。
- **ログアウトは danger バリアント**：セッションを失う「取り消せない」操作。README §1色1意味（赤＝緊急）に沿い赤で警告。
- **ドロップダウンの `var(--bg)` / `var(--border)` を排除**：未定義の CSS 変数を参照していたためドロップダウンが不可視だった。theme の `surface.raised` / `border.default` に置換。

## 挙動を維持するために気をつけた点
- **認証・ログアウトのロジック不変**：`handleLogout`（try/catch/finally での `logout()` → `setAccessToken(null)` → `setCurrentUser(null)` → `navigate('/login')`）はそのまま。
- **PasswordChangeModal の開閉フックはそのまま**（`isPasswordModalOpen` / `onClose`）。
- **default export のまま**維持。

## 使用した theme トークン
- 余白：`spacing.md`（ナビ全体 gap/padding、NavLink 左右）/ `spacing.sm`（NavLink 上下）/ `spacing.xs`（Dropdown 内部 gap/padding、Dropdown margin-top）
- 色：`text.primary`（リンク文字）/ `surface.sunken`（NavLink hover）/ `surface.raised`（Dropdown 背景）/ `border.default`（Dropdown 枠線）
- 角丸：`radius.md`
- 文字：`fontSize.md`

## 判断した点・申し送り
- **App Shell 実装フェーズで大改造予定**：サイドバー化（`#00072D` 背景、現在地=ティール塗り、未読バッジ、施設情報、レスポンシブでオフキャンバス化）はこの Navigation を廃止／再設計する形になる可能性が高い。
- **アクティブ状態のハイライトは未実装**：現状 hover のみ。App Shell フェーズで `useLocation` を使って現在地ハイライトを追加する。
- **クリック外での閉じ**：現状ドロップダウンは開いたら外クリックで閉じない（既存挙動どおり温存）。App Shell フェーズで対応。
