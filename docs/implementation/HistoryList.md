# HistoryList

## 何を作ったか
変更履歴の共通表示コンポーネント（`src/components/ui/HistoryList.tsx`）。お知らせ詳細・タスク詳細で使い回す。共通型 `HistoryEntry`（`src/types/historyEntry.ts`）も同時に新設した。

## なぜこの設計にしたか

### 共通型 `HistoryEntry` を新設した
`AnnouncementHistory` と `TaskHistory` は**完全に同じ構造**（`id / fieldName / oldValue / newValue / changedAt / changedBy`）。両者のドメイン型はそのまま残しつつ、`HistoryEntry` を「HistoryList が受け取る形」として集約した。TypeScript の structural typing により、既存の `AnnouncementHistory[]` / `TaskHistory[]` は変換なしでそのまま `HistoryEntry[]` として渡せる。

将来、両者が異なる構造になるかもしれないので、ドメイン型（`AnnouncementHistory` / `TaskHistory`）はそのまま残した。共通化するときも `type AnnouncementHistory = HistoryEntry` の型 alias で済む。

### props は `histories` のみ
「変更履歴の描画」だけに責任を絞る。データ取得・並び替え・空判定の呼び出し側都合は含めない（PatientListContainer と PatientList の分離と同じ発想）。

### 日時のフォーマットは `formatDueDate` を再利用
既に `utils/task.ts` に「M/D H:mm」形式の `formatDueDate` があり、デザインの履歴フォーマット（TeamFlow.dc.html：例 `"6/29 08:40"`）と一致するため再利用した。名前が「due（期限）」だが、実質「短い日時フォーマット」なので流用可能。将来汎用化するなら `utils/date.ts` に切り出す余地あり（YAGNI で今はしない）。

### ドットは `brand.teal` + `radius.full`
デザイン準拠：ティール色の 8px 丸。`spacing.sm`（8px）と `radius.full`（円）を組み合わせて theme トークンだけで表現。`aria-hidden="true"` を付けてスクリーンリーダーには読み上げない。

### 空表示は EmptyState を使わず内包した
理由：
- HistoryList の空表示は「セクション内の1つの状態」なので、大きい `EmptyState`（padding: xxl、白カード枠付き）は過剰
- デザインでも履歴なしの見た目はシンプルなテキスト（padding: 24px, text-align: center, muted）
- ページ全体の EmptyState と混同されないよう、より控えめな見た目にしている

### 「フィールド：旧 → 新」の1行表現
現状 `fieldName` は英語（`priority`, `taskStatus`）で保存されている可能性が高いが、既存実装でも変換していないためそのまま表示する。日本語化（`priority` → `優先度` 等）は別Issue案件として progress.md に申し送り予定。

### `null` / 空値のフォールバック
`displayValue(value)` で `null` を `(なし)` に変換。既存実装のロジックを踏襲。

## どのお手本に倣ったか
- **PatientCard**：単一責任・表示のみ・`useTheme` パターンではなく theme トークンを styled 内で参照
- **PriorityBadge / StatusBadge**：`{値：表示}` のマッピングを別関数で表現するパターン（`displayValue`）
- **Divider（PatientCard）**：小さな装飾要素（Dot）を独立 span として持ち、`aria-hidden` を付ける

## 使用した theme トークン
- 余白：`spacing.md`（Wrapper / List の gap）/ `spacing.sm`（Entry の gap・ドットサイズ）/ `spacing.xs`（EntryBody の縦積み gap・ドット上マージン）/ `spacing.lg`（空表示の上下 padding）
- 色：`text.primary`（見出し・変更内容）/ `text.secondary`（メタ）/ `text.muted`（空表示）/ `brand.teal`（ドット）
- 文字：`fontSize.lg`（見出し）/ `fontWeight.bold`（見出し）/ `fontSize.md`（変更内容）/ `fontSize.xs`（メタ）/ `fontSize.sm`（空表示）
- 角丸：`radius.full`（ドット）

## 判断した点・申し送り
- **`fieldName` の日本語化**（例：`priority` → `優先度`）：既存も変換していないためそのまま。将来 utils に `fieldNameLabel: Record<string, string>` を追加する形が自然。progress.md 申し送り候補。
- **`oldValue` / `newValue` の値変換**（例：`HIGH` → `高`）：既存も変換していない。上記と同じく別Issue。バックエンドが日本語ラベルで送ってくる可能性もあり、要確認。
- **並び替え**：呼び出し側の責任。API が新しい順に返してくる想定だが、将来 `sort((a, b) => b.changedAt - a.changedAt)` を追加する場合は呼び出し側で。

## 面接で説明できるポイント
- **構造的型付け（Structural Typing）の活用**：`AnnouncementHistory` / `TaskHistory` を変換せず、共通型 `HistoryEntry` として受けられる TypeScript の特性を利用した集約
- **単一責任**：データ取得・並び替え・空判定を含めず、描画に絞った
- **既存ユーティリティの再利用**：`formatDueDate` を意味的にほぼ同じ用途で流用（将来汎用化の余地あり）
- **`aria-hidden` によるアクセシビリティ**：装飾ドットは支援技術で読み上げない
