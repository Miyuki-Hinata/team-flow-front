# TaskListContainer（リファクタ）

## 何を作ったか
`src/components/TaskListContainer.tsx` のリファクタ。フィルタ状態（ステータス・優先度）を持ち、`TaskFilter` と `TaskList` を組み合わせるコンテナ。素の器 `<div>` を、縦積み＋間隔を付けた styled コンテナに置き換えた。

## 何を何に置き換えたか
| 旧（素の実装） | 新 | 補足 |
|---|---|---|
| `<div>`（スタイル無し・フィルタと一覧が密着） | `Container`（styled.div、縦積み＋gap） | フィルタと一覧の間に `spacing.md` |

素の `<button>/<input>/<select>/<span>` は無く、置換対象は器の `<div>` のみ。フィルタUIの中身は `TaskFilter`、一覧は `TaskList` に委譲。

## なぜこの設計にしたか
- **コンテナは「状態管理と組み立て」に責任を絞る**：フィルタ state（`filterStatus` / `filterPriority`）と絞り込みロジックを持ち、`TaskFilter`（操作UI）と `TaskList`（結果表示）を並べる。見た目は各子に委ね、Container 自身は縦並びと間隔だけを持つ。
- **gap は他の一覧系と同じ `spacing.md`**：一覧まわりの間隔を統一して一体感を出す。

## 挙動を維持するために気をつけた点
- **フィルタのロジック・state は一切変更なし**：`useState`、`filteredTasks` の絞り込み条件（status/priority 一致）、子への props（`status` / `priority` / `onStatusChange` / `onPriorityChange` / `tasks`）はそのまま。見た目（器）だけを置換した。
- **props インターフェースは不変**（`tasks`）。
- **default export のまま**維持。

## 使用した theme トークン
- 余白：`spacing.md`（フィルタと一覧の間隔）

## 面接で説明できるポイント
- **Container / Presentational の分離**：状態と絞り込みを Container、表示を List/Filter が担う構造。今回は状態ロジックに触れず、レイアウトの器だけを土台方針（トークン化）に寄せた。
- **一覧レイアウトの統一**：間隔トークンを他一覧と揃え、画面をまたいだ一体感を保つ。
