# KanbanBoard

## 何を作ったか
タスクをステータス別の4列（未着手／進行中／レビュー待ち／完了）で表示するボード（`src/components/ui/KanbanBoard.tsx`）。現状 `PatientDetailPage.tsx` 内にローカル定義されていた KanbanBoard を、独立した ui コンポーネントとして切り出した。

## props 設計の変更（今回の要点）

### Before（切り出し前）
```typescript
type KanbanBoardProps = {
    tasks: Task[]
    statuses: TaskStatus[]                                        // 外から渡す
    groupByStatus: (tasks: Task[]) => { [key in TaskStatus]: Task[] }  // 外から渡す
    sortTasks: (tasks: Task[]) => Task[]                           // 外から渡す
}
```
呼び出し側から 4 つの props を渡していた。特にグルーピング関数・並び替え関数・ステータス配列まで外部に依存していたため、KanbanBoard 自体の責任範囲が曖昧だった。

### After（切り出し後）
```typescript
type KanbanBoardProps = {
    tasks: Task[]   // 表示するタスク（並び替え済みで渡される）
}
```
**props は `tasks` のみ**の単一責任設計。

## なぜこの設計にしたか

### props を `tasks` のみに絞った理由
「呼び出し側がやるべきこと」と「KanbanBoard がやるべきこと」を明確に分けるため。責任分割の判断基準：

- **グルーピング（ステータス別に列に分ける）は「カンバンとは何か」の定義そのもの** — 外から渡してもらう類のロジックではなく、KanbanBoard 内部に持つべき。よって `groupByStatus` は削除して内部関数に移した。
- **STATUS_ORDER（列の順序）も「カンバンの表示ルール」の一部** — 外から `statuses` として受け取る必要はなく、KanbanBoard 内で `['CREATED', 'PROGRESS', 'REVIEWING', 'DONE']` を定数で持てば済む（作業フロー順で固定）。
- **並び替え（priority / createdAt 等）はページ側の関心事** — 並び替えの UI（Select）と state（sortBy / sortOrder）は呼び出し側にある。並び替え済みの配列を渡してもらう形にすることで、KanbanBoard は「並び替えの選択肢が増減した時の影響を受けない」。

結果として、KanbanBoard の責任は「渡されたタスクをステータス別の列に並べて表示する」だけになった。

### グルーピングを内部に持つ判断
- 「ステータス別に4列に分ける」は KanbanBoard の**存在意義そのもの**。呼び出し側にこの責務を持たせると、KanbanBoard を使う全ページで同じロジックを書く必要が出る（DRY 違反）
- 内部で `Record<TaskStatus, Task[]>` として全キーを初期化しておくことで、「その列にタスクが1件もない」ケースを空配列として自然に扱える（`grouped[status]` が undefined にならない）
- 想定外の `taskStatus` 値でもクラッシュしないよう、`if (groups[task.taskStatus])` でキーの存在を確認してから push（堅牢性）

### 並び替えを呼び出し側に委ねた理由
- 並び替えの選択肢（priority / createdAt / assignee 等）は**ページの UI・仕様**に依存する
- PatientDetailPage 側には既に `sortBy` / `sortOrder` の state と Select UI があり、`sortTasks` 関数もある。これらを KanbanBoard に取り込むと、他のページ（例：将来 タスク一覧ページでカンバン表示したい場合）で異なる並び替え要件が出た時にコンポーネントの型を変更する必要が出る
- 「KanbanBoard は並び替え済みの配列を受け取る」というインターフェースなら、どんな並び替えロジックでも自由に使える

### D&D（ドラッグ&ドロップ）を採用しない判断
デザイン仕様・現場要件を加味した意図的な選択：

- **医療現場での誤操作リスクを避ける**：カンバンの D&D は「ドラッグしたつもりが動いてしまう」誤操作が起きやすい。医療タスクの状態を誤って変えるとインシデントに直結する
- **状態変更には履歴が必要**：タスクのステータス変更は変更履歴に残す必要がある（TaskDetailPage で実装済み）。D&D で変えると「誰がどのタイミングで変えたか」の意識が薄くなる
- **明示的な操作導線を用意している**：ステータス変更は TaskDetailPage の「ステータス変更バー」で行う（変更すると履歴に記録されます、というヒント表示付き）

将来 D&D を追加する場合は、`@dnd-kit/*` 等のライブラリ導入＋確認ダイアログの併用が前提。

### インラインスタイルを全廃
切り出し前は `style={{ display: 'flex', gap: '16px', border: '1px solid #ccc', padding: '8px' }}` などの直書きだった。theme トークンで置換：
- `gap: 16px` → `spacing.md`
- `border: 1px solid #ccc` → `border: 1px solid ${border.default}`
- `padding: 8px` → `spacing.sm`（列見出しとカード間の狭い間隔）／`spacing.md`（列全体の内側 padding）

### 列見出しの日本語ラベル化
切り出し前は `{status}` で `CREATED` などの英語がそのまま表示されていたバグを修正。`utils/task.ts` の `statusLabel` から日本語ラベルを引く（未着手／進行中／レビュー待ち／完了）。件数は `Count`（xs / secondary）で控えめに添えた。

### 列内の空表示（`ui/EmptyState` を使わなかった理由）
`ui/EmptyState` は `padding: spacing.xxl（48px）` と大きく、狭いカンバン列（`flex: 1 1 200px`）には過剰。KanbanBoard 内部に列向けの控えめな空表示（`padding: md, fontSize: xs, muted`）を持たせた。

これは「単一責任は保ちつつ、局所的な体裁調整はコンポーネント内に閉じ込める」判断。将来 `ui/EmptyState` に `size` prop を追加して共通化する余地はあるが、YAGNI で今はしない。

## 使用した theme トークン
- 余白：`spacing.md`（Board の gap・列の内側 padding）/ `spacing.sm`（列内の gap・カード間）/ `spacing.xs`（Heading の gap）
- 色：`surface.sunken`（列の背景）/ `border.default`（列の枠線）/ `text.primary`（見出し）/ `text.secondary`（件数）/ `text.muted`（空表示）
- 角丸：`radius.md`（列）
- 文字：`fontSize.sm`（見出し）/ `fontWeight.bold`（見出し）/ `fontSize.xs`（件数・空表示）

## PatientDetailPage 側の修正
指示どおり、KanbanBoard の切り出しに必要な変更のみを実施：
- ローカル定義の `KanbanBoard` コンポーネントを削除
- ページ内の `tasksByStatus` 関数を削除（KanbanBoard 内部に移った）
- `TASK_STATUSES` 定数を削除（KanbanBoard 内部に移った）
- `import { KanbanBoard } from '../components/ui/KanbanBoard'` を追加
- 呼び出しを `<KanbanBoard tasks={sortTasks(filteredTasks)} />`／`<KanbanBoard tasks={sortTasks(categoryTasks)} />` に変更（**並び替え済み配列を渡す形**）
- 未使用になった `TaskStatus` 型 import と `TaskCard` の直接 import を削除
- **それ以外のロジック**（データ取得・タブ切替・並び替え state・useMemo）**には手を入れていない**

## 面接で説明できるポイント
- **単一責任の実践**：「渡されたタスクをステータス別の列に並べて表示する」だけに絞り、それ以外のロジックは呼び出し側に返した設計判断
- **props を減らす価値**：`4 個 → 1 個` の props 削減で、呼び出し側のコード量が減り、KanbanBoard のテスト・再利用が容易になった
- **コンポーネントの本質を見極める**：グルーピングは「カンバンの定義そのもの」だから内部に、並び替えは「ページの UI 都合」だから外部に、という判断基準
- **D&D を採用しない意図的な設計**：機能を作らないという判断も、医療現場のドメイン理解に基づく設計。面接では「何を作らなかったか」も語れる
- **英語ラベルバグの副次修正**：切り出しのついでに `{status}` の生表示（`CREATED` 等）を `statusLabel[status]` で日本語化した。実装漏れの発見と修正を同時にできる分割設計の副次効果
