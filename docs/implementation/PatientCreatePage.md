# PatientCreatePage（ページ整備）

## 何を作ったか
`src/pages/PatientCreatePage.tsx` の全面リファクタ。素の `<h1>` / `<input>` / `<select>` / `<button>` の縦一列を、フェーズ1の土台コンポーネント（PageHeader / FormField / Input / Select / Button）と theme トークンで整えたグリッドレイアウトに置き換えた。既存の state 管理・API 呼び出し・遷移ロジックは変更なし。

## レイアウト構造（デザイン `TeamFlow.dc.html` 520–612行 準拠）
```
Column (max-width: 760px, 中央寄せ)
 ├─ BackLink       ← 患者一覧へ戻る（styled(Link) + 戻る SVG）
 ├─ PageHeader     title="患者を追加"
 └─ FormCard (padding: xl, gap: lg)
     ├─ GroupLabel "氏名"
     ├─ Grid2      [苗字] [名前]
     ├─ Grid2      [苗字かな] [名前かな]
     ├─ Grid3      [生年月日] [性別] [電話番号]
     ├─ FormField  [住所]（1列）
     ├─ Divider    緊急連絡先
     ├─ Grid2      [人物名] [電話番号]
     ├─ Divider    医療情報
     ├─ Grid2      [部署（科）] [担当医]
     └─ Actions    [キャンセル] [登録する]（右寄せ）
```

## 何を何に置き換えたか（全12入力 + 見た目全体）
| 旧 | 新 | 補足 |
|---|---|---|
| 素の器 `<div>`（レイアウトなし） | `Column`（max-w:760px 中央）+ `FormCard`（styled）| README §Design Tokens「フォーム系画面は760px」対応 |
| （なし） | `BackLink`（styled(Link) + 戻る SVG） | 「患者一覧へ戻る」導線 |
| `<h1>患者作成</h1>` | `PageHeader title="患者を追加"` | 一覧の追加ボタン文言と統一 |
| 素の `<input>` × 8 | `FormField + Input`（type: text/date/tel を使い分け） | 各項目に htmlFor/id で label 紐付け |
| 素の `<select>` × 3（性別・部署・担当医） | `FormField + Select` | options 配列でデータドリブンに |
| 素の `<button>作成</button>` | `Button variant="primary"`「登録する」 | primary 塗り |
| （なし） | `Button variant="secondary"`「キャンセル」 | `/patients` へ navigate |
| （なし） | `GroupLabel` / `Divider`（区切り線＋見出し） | 「氏名」「緊急連絡先」「医療情報」でセクション化 |
| （なし） | `Grid2` / `Grid3` | デザインの2列/3列レイアウト |

## なぜこの設計にしたか
### `Column` / `FormCard` / `BackLink` / `Grid2` / `Grid3` はページローカル styled
- **Column**：「フォーム系画面は 760px」というレイアウト定数はページごとに違う。AppLayout の 1080px の内側で、フォームだけ絞る位置づけなのでページローカルが妥当
- **FormCard**：`ui/Card` は `padding: spacing.md（16px）` 固定で、デザインの 32px に届かない。LoginPage の FormCard と同じ理由で新設。既存 Card は変更しない
- **Grid2 / Grid3**：フォームの列レイアウトは各作成ページで頻出パターン。今後 3ページ以上で使うことになったら `ui/FieldRow` として汎用化を検討（YAGNI）
- **BackLink**：戻るリンクは複数の作成ページで再登場するが、パスと文言が違う（`/patients` vs `/announcements` vs `/tasks`）ため、汎用化するには prop 設計が必要。今は3個以下でページローカル維持で十分

### `sex` の値は既存日本語のまま
`PatientRequest.sex` は `string` 型（緩い）。既存の値「男性/女性/その他」を送信する仕様に合わせて、`SEX_OPTIONS` も日本語ラベル・日本語 value で定義。**表示・挙動を変えない**原則に従い、型を狭める（`'MALE'|'FEMALE'|'UNKNOWN'` に揃える）変更は別Issueに委ねる。

### `handleChange` の型 union
Input と Select の onChange イベント型が異なるため、汎用ハンドラは `React.ChangeEvent<HTMLInputElement | HTMLSelectElement>` で受け取る。既存パターンを維持。

## 挙動を維持するために気をつけた点
- **`useState<PatientRequest>` の初期値・全12フィールド不変**
- **`useEffect` の `fetchDepartments` / `fetchUsers('DOCTOR')` 呼び出し不変**
- **`handleSubmit`** の `createPatient(patient)` → `navigate('/patients')` の順序・引数不変
- **成功通知（alert 等）追加なし**：既存になかった
- **バリデーション追加なし**：既存になかった
- **default export のまま**維持

## 使用した theme トークン
- 余白：`spacing.xs`（BackLink gap）/ `spacing.md`（BackLink 下 margin）/ `spacing.lg`（FormCard gap・Grid gap・Divider padding-top）/ `spacing.xl`（FormCard padding）/ `spacing.sm`（Actions gap）
- 色：`text.secondary`（BackLink）/ `text.primary`（BackLink hover）/ `text.muted`（GroupLabel / Divider）/ `surface.raised`（FormCard）/ `border.default`（FormCard border / Divider border）
- 角丸：`radius.lg`（FormCard）
- 文字：`fontSize.sm`（BackLink / GroupLabel / Divider）/ `fontWeight.bold`（GroupLabel / Divider）

## 判断した点・申し送り
- **max-width: 760px は直書き**：AppLayout の 1080 と同じレイアウト定数扱い。トークン化はしない（PatientCreatePage / AnnouncementCreatePage / TaskCreatePage で共通化するかは3画面揃った時点で再検討）
- **`sex` 型の整理**：ドメイン型として `'MALE'|'FEMALE'|'UNKNOWN'` に狭める価値は高いが、表示値の変更＋バックエンドAPIとの整合確認が必要なので別Issue
- **バリデーション/エラー表示**：`FormField` は既に `error?: string` prop を持つ。将来バリデーション実装時、`FormField` に error を渡すだけで表示できる
- **ボタンの Enter 送信対応**：`<form onSubmit>` 化は挙動の追加なのでスコープ外（LoginPage と同様）

## 面接で説明できるポイント
- **土台の合成でフォームを組み立てる**：`FormField × Input/Select` の統一パターンで12入力を並べているが、各行は宣言的で読みやすい。将来のフィールド追加もパターンをコピーするだけ
- **レイアウトの層構造**：AppLayout(1080) → Column(760) → FormCard(padding+gap) → Grid2/Grid3（列） → FormField（1入力）と、責務を層で分けている
- **土台の再利用と新規判断**：`ui/Card` は padding が合わないので新設せず、ページローカル FormCard で対応する判断（既存土台に手を入れる影響を最小化）
- **既存のバグ（sex の型 vs 表示値の齟齬）を「見つけたが今回は温存」した判断**：範囲を守るためにドキュメントに残し、別Issue に切り出す姿勢を説明できる
