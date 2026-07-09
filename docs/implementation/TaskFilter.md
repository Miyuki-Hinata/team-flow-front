# TaskFilter（リファクタ）

## 何を作ったか
`src/components/TaskFilter.tsx` のリファクタ。タスク一覧のステータス／優先度の絞り込みバー。素の `<select>` 2つを、専用の土台コンポーネント `TaskStatusSelect` / `PrioritySelect` に置き換えた。

## 何を何に置き換えたか
| 旧（素の実装） | 新（土台） | 補足 |
|---|---|---|
| ステータスの `<select>`＋`<option>`直書き | `ui/TaskStatusSelect` | 選択肢はコンポーネント内蔵 |
| 優先度の `<select>`＋`<option>`直書き | `ui/PrioritySelect` | 選択肢はコンポーネント内蔵 |
| 器の `<div>` | `Filters`（styled.div、横並び＋gap） | セレクトを並べる器 |
| `<option value="">すべて</option>` | 各 Select の `placeholder="すべて"` | 空値＝絞り込み解除を先頭に |

## なぜこの設計にしたか
- **FilterBar は新規に作らない**（本タスクの指示）：既存のフィルタ構造を保ち、中の素の `<select>` を土台 Select に差し替えるだけに留めた。器の `<div>` は横並び＋gap の styled にして見た目だけ整えた（汎用 FilterBar への統合は別フェーズ）。
- **「すべて」を placeholder で表現＋フィルタ名プレフィックス**：旧実装は先頭に `<option value="">すべて</option>` を直書きしていた。TaskStatusSelect / PrioritySelect は固定の選択肢だけを持ち「すべて」は含まないが、両者は `placeholder` prop で先頭に空値 option を出せる（Select の仕様）。デザイン（`TeamFlow.dc.html` 487・493行）に合わせ、単なる「すべて」ではなく **`状態：すべて` / `優先度：すべて`** をプレースホルダとして渡し、そのセレクトが何のフィルタかが未選択時にも分かるようにした。
- **`'' ⇔ null` のマッピングは維持**：フィルタ state は「未選択＝null」。value は `status ?? ''`、onChange は `e.target.value === '' ? null : ...` で従来どおり空文字と null を相互変換する。土台 Select は `SelectHTMLAttributes` を継承しているので value / onChange はそのまま通る。

## 挙動を維持するために気をつけた点
- **props インターフェースは不変**（`status` / `priority` / `onStatusChange` / `onPriorityChange`）。親 TaskListContainer の呼び出しはそのまま。
- **絞り込みの値（CREATED/PROGRESS/… や LOW/MEDIUM/HIGH）は不変**。onChange の型キャストも従来どおり。
- **default export のまま**維持。

## 判断した点・申し送り（ラベル表記の変化）
土台 Select への置換に伴い、**選択肢のラベル表記が変わる**（値は不変）。これは指示された「優先度/ステータスの select → PrioritySelect/TaskStatusSelect」への置換の結果であり、表示を各 Badge・Select と統一するもの。
- 優先度：旧「LOW / MEDIUM / HIGH」（英字）→ 新「低 / 中 / 高」（PrioritySelect のラベル）。
- ステータス：旧「レビュー中」→ 新「レビュー待ち」（TaskStatusSelect＝StatusBadge と統一）。

→ アプリ全体で優先度・ステータスの表記が一本化される。もし「フィルタでは英字ラベルのままにしたい」等の要望があれば戻せるが、一体感の観点からは統一を推奨。

## 使用した theme トークン
- 余白：`spacing.sm`（セレクト間の gap）
- ※セレクト自体の見た目（背景・枠線・角丸・focus）は Select 側に委譲。直書きは無し。

## 面接で説明できるポイント
- **placeholder で「すべて」を表す設計**：固定選択肢を持つ専用 Select に、絞り込み解除の空値を placeholder で足すという、汎用 Select の仕組みを活かした置き換え。
- **表記の一元化**：フィルタの選択肢ラベルも Badge / Select と揃え、画面をまたいだ用語の一貫性を担保した。
- **既存挙動の温存**：`'' ⇔ null` 変換・props・値を変えず、見た目の層（素 select → 土台 Select）だけを差し替えた。
