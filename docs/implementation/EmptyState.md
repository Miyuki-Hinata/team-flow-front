# EmptyState

## 何を作ったか
「〜ありません」の共通表示（`src/components/ui/EmptyState.tsx`）。リストや検索結果が空の時のプレースホルダとして各ページで再利用する薄いコンポーネント。

## なぜこの設計にしたか
- **`message` を必須 props にした**：Loading と違って EmptyState は「何が」ないのかが呼び出し側の文脈でしか決まらない（「お知らせはありません」「タスクはありません」「変更履歴はありません」等）。既定値を持たせると汎用文言（「該当するものがありません」）になって親切さが薄れるため、明示的に指定させる方針にした。
- **単一責任：表示のみ**：空判定（`items.length === 0`）は呼び出し側で行い、EmptyState 自体は「表示するかどうか」を判断しない。ページ側で `{items.length === 0 && <EmptyState message="..." />}` のように使う想定。
- **デザインの正解値をトークンにマッピング**：`TeamFlow.dc.html` 466行の主要パターン（`padding:48px; text-align:center; color:#9298A6; font-size:16px; background:#FFFFFF; border:1px solid #E2E5EB; border-radius:12px`）をすべて theme トークンで表現：
  - `#FFFFFF` → `surface.raised`
  - `#E2E5EB` → `border.default`
  - `12px` → `radius.lg`
  - `48px` → `spacing.xxl`（トークンに完全一致する値がある）
  - `#9298A6` → `text.muted`
  - `16px` → `fontSize.md`
- **audit L 対応**：現状「〜ありません」文言が `DashboardPage:20` / `AnnouncementCreatePage:135` / `TaskDetailPage:255` / `PatientDetailPage:254` 等に散在。今回は新設のみ行い、置換は各ページ着手時に順次適用する。

## 判断した点・申し送り
- **デザインには亜種がある**：`TeamFlow.dc.html` を見ると、メインタイプ（padding:48px・枠あり）以外に、サブタイプ（padding:32px・枠あり）や履歴なしタイプ（padding:24px・枠なし・fontSize:14px）が存在する。今回はメインタイプを EmptyState として実装し、亜種は必要性が明確になったタイミングで props 追加（`size` や `variant`）または別コンポーネント化を検討する（YAGNI）。特に**変更履歴の空表示**は HistoryList 内部の責任として持たせるのが自然なので、EmptyState では扱わない方針。
- **アイコンは今回入れない**：デザインにも無いため。将来「もっと親切にしたい」要件が出たら `<EmptyState icon={...} message="...">` に拡張可能。

## 使用した theme トークン
- 色：`surface.raised`（背景）/ `border.default`（枠線）/ `text.muted`（文字）
- 余白：`spacing.xxl`（padding = 48px）
- 角丸：`radius.lg`（12px）
- 文字：`fontSize.md`（16px）

## 面接で説明できるポイント
- **必須 props と任意 props の使い分け**：Loading の `message?` と対比。既定値が意味を持つか（Loading = 常に「読み込み中」）／持たないか（EmptyState = 文脈依存）で判断が分かれる。
- **YAGNI**：亜種（padding 違い、枠なし版）を先取りしない。使う場面が2つ以上出たら props で共通化する、というルール。
- **トークン厳守の徹底**：デザインの直値（`#9298A6` / `48px` / `12px` 等）を1つも直書きせず、すべて theme に対応させた。
