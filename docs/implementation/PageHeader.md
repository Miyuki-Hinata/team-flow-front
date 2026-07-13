# PageHeader

## 何を作ったか
一覧ページ・ダッシュボードの上部に置く共通ヘッダー（`src/components/ui/PageHeader.tsx`）。タイトル・任意サブテキスト・任意アクション（右側）を1行で並べる薄いコンポーネント。

## 何に使うか
`TeamFlow.dc.html` を確認したところ、`h1{ margin:0; font-size:28px; font-weight:500 }` のタイトルは5画面で共通：ダッシュボード（183行）／患者一覧（262行）／患者詳細（358行）／お知らせ一覧（434行）／タスク詳細（476行）。うち一覧系（患者・お知らせ・全タスク・マイタスク）は「タイトル＋サブ＋右アクション」の同型（432–442行）。audit M の対象そのもの。

## props 設計
| prop | 型 | 必須 | 用途 |
|---|---|---|---|
| `title` | `string` | 必須 | ページタイトル |
| `subtitle` | `string?` | 任意 | 「未読 3 件」等の補助テキスト |
| `action` | `ReactNode?` | 任意 | 右側の要素。`<Button>` でも `<Link>` でも自由に差し込める |

## なぜこの設計にしたか
- **action を `ReactNode` にした**：一覧3ページでは「新規作成ボタン」がある画面と、ダッシュボードのように無い画面がある。またリンクの実体が `<Button>` の場合と `<Link>` の場合があるので、型を固定せず「呼び出し側で好きな要素を差し込む」合成パターン（Modal と同じ発想）にした。この設計だと将来「フィルタ切替」「エクスポート」など別種のアクションが来ても props 変更不要。
- **subtitle も任意**：ダッシュボードは「今日の日付 ・ 3F 内科病棟」のような長めのサブがあるが、他画面では無いこともある。任意にして呼び出し側で判断させる。短絡評価（`{subtitle && ...}`）で「無いなら DOM に出さない」パターンは Select の placeholder・FormField の error と同じ。
- **`h1` を使う**：デザイン準拠かつ意味的にも正しい（ページで1つの主要見出し）。`margin: 0` にしておかないとブラウザ既定 margin で上下がズレるため明示的にゼロ化。
- **`align-items: flex-end`**：デザイン（432行）に完全一致。タイトルの下端と右ボタンの下端が揃うことで、視覚的な安定感が出る。
- **`margin-bottom: spacing.lg`（24px）**：デザイン準拠。ページ本文との間の余白をヘッダーが持つことで、呼び出し側は続けて中身を書くだけで済む。

## 使い方（想定）
```tsx
// 一覧ページ（新規作成ボタン付き）
<PageHeader
    title="お知らせ"
    subtitle="未読 3 件"
    action={<Button variant="primary" onClick={goCreate}>新規作成</Button>}
/>

// ダッシュボード（アクションなし）
<PageHeader
    title="おはようございます、中島さん"
    subtitle={`${today} ・ 3F 内科病棟`}
/>
```

## 使用した theme トークン
- 余白：`spacing.lg`（Wrapper の gap と margin-bottom = 24px）/ `spacing.xs`（タイトルとサブテキストの間 = 4px、デザインの `margin:4px 0 0` に一致）
- 色：`text.primary`（タイトル）/ `text.secondary`（サブテキスト）
- 文字：`fontSize.xxl`（タイトル = 28px）/ `fontWeight.bold`（タイトル）/ `fontSize.sm`（サブテキスト = 14px）

## 判断した点・申し送り
- **アクション用アイコン（＋マーク SVG）は PageHeader に持たせない**：デザインでは「新規作成」ボタンに `+` の SVG アイコンが付いているが、これはアクション側（Button の中身）の責任として呼び出し側で `<Button><PlusIcon />新規作成</Button>` のように書く方針。PageHeader が特定アクションを想定した作りを持たないことで単一責任を保つ。
- **audit M 対応**：現状 `TasksPage:18` / `PatientPage:36` / `AnnouncementsPage:34` に同型の素実装が散在。今回は新設のみで、置換は各ページ着手時に順次適用する。

## 面接で説明できるポイント
- **合成（composition）の徹底**：`action: ReactNode` により、PageHeader は特定のボタン実装に依存せず、あらゆる右アクション（Button / Link / DropdownMenu 等）を受け入れられる。
- **意味的な HTML**：`h1` を使い、`margin: 0` で既定を打ち消す。デザイン合わせだけでなくアクセシビリティ・SEO 観点でも正しい。
- **align-items:flex-end** のような些細な指定が「視覚の安定感」を生むという判断の言語化。
