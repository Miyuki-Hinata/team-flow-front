# AppHeader

## 何を作ったか
App Shell 上部のヘッダーバー（`src/layouts/AppHeader.tsx`）。デザイン（`TeamFlow.dc.html` 140–175行）どおり、左にパンくず、右に日付＋ユーザーメニュー（アバター・名前・キャレット＋ドロップダウン）を配置する。旧 `components/Navigation.tsx` のユーザーメニューのロジック（`useAuth` / `logout()` / `PasswordChangeModal` 起動）はすべてこちらに移植した。

## 構造
```
┌──────────────────────────────────────────────────────┐
│ 病棟管理 / お知らせ       6/29 (土)  [中] 中島 看護師 ▼ │
└──────────────────────────────────────────────────────┘
 bg:#001F5B, h:64, sticky top:0, z:5, padding:0 32
```

## なぜこの設計にしたか
- **パンくず現在画面名は `findCurrentLabel(pathname)` で一元化**：Sidebar と同じ `NAV_ITEMS` を参照するため、ラベル変更のコストが最小になる（Q&A #4 の合意）。マッチしない画面（詳細ページ等）は現在画面名を出さず「病棟管理」のみを表示（区切り「/」も出さない）。
- **旧 Navigation のロジックをまるごと移植**：`useAuth`、`logout()` の try/catch/finally、`setAccessToken(null)` → `setCurrentUser(null)` → `navigate('/login')` の順序、および `PasswordChangeModal` の開閉フックはそのまま。挙動を1ミリも変えず、UI 表現だけデザインに寄せた。
- **外クリックで閉じるを追加**：旧 Navigation は開きっぱなしになる挙動だった。`useEffect` + `document.addEventListener('click', ...)` + `wrapperRef.current.contains` で、ラッパー外クリック時に `setIsMenuOpen(false)`。既存コンポーネント `ui/UserMenu.tsx` の同パターンに倣った。
- **`$open` transient prop**：トグル背景の切替とキャレットの回転（0deg ↔ 180deg）を DOM 属性に漏らさず表現。
- **アバターは姓の1文字目**：`currentUser?.lastName?.charAt(0)`。未取得時は `?`。デザイン（153行）の「中」1文字と同じ表現。
- **ログアウト項目だけ danger トーン**：赤テキスト＋赤系ホバー背景。README §1色1意味・デザイン167行に一致。
- **ドロップダウン内は `ui/Button` を使わずメニュー項目 styled で作った**：Button はアクション用の塗りボタン（primary/secondary/danger）で、メニュー項目とはデザイン言語が異なる（塗り枠なし、左寄せテキスト、全幅ホバー背景）。Button に無理に寄せるとデザインが崩れるので、メニュー項目専用の `MenuItem` / `LogoutMenuItem` を用意した。
- **日付は端末時刻から生成**：`formatToday()` で「M/D (曜)」形式（例：`6/29 (土)`）。データ取得不要。
- **PasswordChangeModal を Header の外側に配置**：Fragment `<>` の直下に置く。ヘッダーの `position: sticky` / `z-index:5` の stacking context にモーダルを閉じ込めないため。

## 使用した theme トークン
- 色：`brand.navy`（ヘッダー背景）/ `text.onBrand`（既定文字・現在画面名・アバター文字）/ `border.strong`（パンくず・日付の淡色）/ `text.secondary`（パンくず区切り「/」）/ `brand.teal`（アバター背景）/ `surface.raised`（ドロップダウン背景）/ `border.default`（ドロップダウン枠線）/ `text.primary`（メニュー項目文字）/ `surface.sunken`（メニュー項目 hover 背景）/ `semantic.danger.main`・`semantic.danger.bg`（ログアウトの文字と hover 背景）
- 余白：`spacing.xl`（ヘッダー左右 padding）/ `spacing.lg`（右ブロック間 gap）/ `spacing.sm`（パンくず gap・トグル gap・アイコン gap・メニュー項目 padding 縦）/ `spacing.xs`（ドロップダウン内 gap・トグル padding 縦・ドロップダウン開き幅マージン）/ `spacing.md`（メニュー項目 padding 横）
- 角丸：`radius.md`（トグル・アバター・メニュー項目）/ `radius.lg`（ドロップダウン）
- 文字：`fontSize.sm`（パンくず・日付・アバター文字・ユーザー名）/ `fontSize.md`（メニュー項目）/ `fontWeight.bold`（アバター文字）

## 判断した点・申し送り
- **ダークモード切替 UI は入れなかった**（progress.md でスコープ外を明記済み）。将来追加時は「パスワード変更」と「ログアウト」の間に `MenuItem` を1つ挟むだけで済む構造にしてある。
- **ハンバーガーボタンは入れなかった**（オフキャンバス自体がスコープ外のため）。将来追加時は `Crumb` の左端に SVG ボタンを1つ差し込む。
- **日付フォーマットは簡易版**：デザイン（150行）は `{{ today }}` プレースホルダで実値不明のため「M/D (曜)」で妥当なところを実装。将来デザインが確定したら差し替え可能。
- **影 `0 8px 24px rgba(0,7,45,.16)`** は theme トークンに無いため直書き：README §Design Tokens の「ドロップダウン/メニューの影」定義値そのまま。将来 theme に `shadow.dropdown` 系を足すのが理想。
- **ブランドカラー背景専用の淡色 `border.strong`（#C5CAD4）をパンくず/日付の文字色に使った**：暗背景に載せる淡グレー文字として、既存トークンで最も近いものを流用。将来「暗背景上の補助文字色」を専用トークンで定義する余地あり（Sidebar と同じ判断）。
