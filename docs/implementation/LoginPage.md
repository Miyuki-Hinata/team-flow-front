# LoginPage（ページ整備）

## 何を作ったか
`src/pages/LoginPage.tsx` の整備。素の `<div>` / `<input>` / `<h1>` / `<p style>` を、フェーズ1で用意した土台コンポーネント（Input / FormField / Button）＋ theme トークン化した styled でデザイン準拠に置き換えた。認証ロジック・遷移処理には手を入れていない。

## 何を何に置き換えたか
| 旧 | 新 | 補足 |
|---|---|---|
| 器の `<div>`（レイアウトなし） | `Screen`（全画面濃紺 fixed）＋ `Column`（max-width:420px 中央） | 全画面レイアウト |
| なし | `Brand` + `LogoMark` + `LogoIcon` + `BrandName` | 上部ロゴ行（Sidebar と同じ稲妻風 SVG） |
| 白カード器なし | `FormCard`（白背景・角丸 lg・padding xl） | ページローカルの styled |
| `<h1>ログイン</h1>` | `Title`（fontSize.xl・bold・text.primary） | 見出し |
| なし | `Subtitle`（fontSize.sm・text.secondary） | 案内文「ログインIDと〜」 |
| 素 `<input type="text">` | `FormField` + `Input`（type="text"） | ログインID |
| 素 `<input type="password">` | `FormField` + `Input`（type="password"） | パスワード |
| `<p style={{color:'red'}}>` | `ErrorText`（`semantic.danger.main` + `fontSize.xs`） | フォーム全体エラー |
| `<Button>` | `SubmitButton = styled(Button)` | フル幅＋高さ48px |
| なし | `Footer`（fontSize.xs・text.secondary・中央） | 「さくら総合病院 業務支援システム」 |

## なぜこの設計にしたか
### App Shell の外に置く
LoginPage は `AppLayout` の外にある唯一のページ（`App.tsx` 参照）。ログイン前なのでサイドバー・ヘッダーは出さない、という既存の構造を維持。`position: fixed; inset: 0` で全画面を占有。

### ページローカルの styled を使った箇所（理由あり）
- **`FormCard`**：デザインは `padding: 32px` の白カード。`ui/Card` は `padding: spacing.md（16px）` 固定でデザインの 32px に届かない。指示「新規に土台を作らない・既存土台を変更しない」に沿うため、ページローカルで `FormCard`（`padding: spacing.xl`）を用意。Card 本体は変更しない。
- **`SubmitButton = styled(Button)`**：デザインはフル幅・高さ 48px。`ui/Button` にサイズや `fullWidth` prop は無い。既存 Button の見た目・variant（primary/secondary/danger）はそのまま活かしつつ、ページ固有の寸法だけ styled 継承で上書き。`height: spacing.xxl` は 48px と一致するのでトークンから引ける。
- 上記2つは**このページ固有の要件**（他ページで使い回さない）なので、汎用化せずページ内 styled で持たせるのが単一責任・YAGNI として妥当。

### フォーム全体のエラーは独立表示（PasswordChangeModal と同じ流儀）
フィールド固有のエラー（例：8文字未満）ではなく、認証失敗（サーバー返却の message）というフォーム全体の状態なので、FormField の `error` props ではなく独立した `ErrorText` として送信ボタンの直前に置く。

### FormField × Input で htmlFor / id を紐付け
`htmlFor="login-id"` ↔ `<Input id="login-id">` を対応させ、ラベルクリックで入力にフォーカスが移る（アクセシビリティ）。値は他ページと衝突しないよう `login-id` / `login-password` にした。

### ロゴアイコンをページ内に留めた
Sidebar と同じ稲妻風 SVG だが、共通の SVG コンポーネントとして切り出さずページ内に `LogoIcon` として保持。理由：Sidebar から import すると Login → Sidebar への依存が生まれ、責務が入り乱れる（LoginPage は Sidebar と関係ない画面）。SVG は数行なので重複コストが低く、疎結合を優先。将来3箇所目で使うことになったら `ui/BrandLogo` として独立させる（今作らないのは YAGNI）。

## 挙動を維持するために気をつけた点
- **認証・遷移ロジックは1ミリも変更なし**：`handleLogin` の try/catch、`login()` → `setAccessToken()` → `getCurrentUser()` → `setCurrentUser()` → リダイレクト先決定（3段階の優先順位）→ `sessionStorage.removeItem` → `navigate(from, {replace:true})` の順序をそのまま維持。
- **Enter キーでの submit は未対応**：デザインには `<form>` タグが無く、既存も onClick 方式のみ。Enter で submit させるには `<form onSubmit>` に変える必要があるが、これは挙動の追加なので今回スコープ外（将来の改善候補）。
- **エラーメッセージ表示位置**：既存はボタンの上にあった。新実装でも同じ位置（送信ボタン直前）。
- **default export のまま**維持（App.tsx が default import で読んでいる）。

## 使用した theme トークン
- 色：`brand.navyDeep`（全画面背景）/ `brand.teal`（ロゴ四角）/ `text.onBrand`（ブランド名文字）/ `surface.raised`（白カード）/ `text.primary`（見出し）/ `text.secondary`（サブ・フッター）/ `semantic.danger.main`（エラー）
- 余白：`spacing.lg`（画面 padding・見出し下・フッター上）/ `spacing.xl`（ブランド行下・カード padding）/ `spacing.md`（Fields gap）/ `spacing.sm`（ブランド行 gap・ボタン上）/ `spacing.xs`（見出しとサブの間）/ `spacing.xxl`（ボタン高さ = 48px）
- 角丸：`radius.md`（ロゴ四角）/ `radius.lg`（白カード）
- 文字：`fontSize.xl`（見出し・ブランド名）/ `fontSize.sm`（サブ）/ `fontSize.xs`（エラー・フッター）/ `fontWeight.bold`（見出し・ブランド名・ボタン）

## 判断した点・申し送り
- **`max-width: 420px` は直書き**：ページ固有のレイアウト定数（AppLayout の 1080px と同じ扱い）。トークン化するほど再利用性がないため、ここで直書き採用。
- **フォームの Enter 送信**：`<form onSubmit>` 化で対応可能。挙動追加なので今回はスコープ外。別Issue候補。
- **エラーメッセージが「英語のまま」返る可能性**：API 側の翻訳に依存。UI では改善しない。

## 面接で説明できるポイント
- **App Shell の外側というレイアウト判断**：ログイン前と後で必要な UI が違うため、レイアウト階層を分ける定石（`Route` 定義でも `AppLayout` の外に置く）。
- **土台とページローカル styled の使い分け**：3回以上使うものは土台へ、このページだけの装飾はページ内に、という YAGNI 準拠の線引き。
- **アクセシビリティ（htmlFor / id）** と **1箇所エラー集約**の設計。
- **依存の切り方**：ロゴアイコンを Sidebar から import しない判断（疎結合優先）。
