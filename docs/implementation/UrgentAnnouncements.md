# UrgentAnnouncements（リファクタ）

## 何を作ったか
`src/components/UrgentAnnouncements.tsx` のリファクタ。優先度=HIGH かつ未読のお知らせだけを抜き出してカードで並べるリスト。素の器 `<div>` を、theme トークンで縦積み＋間隔を付けた styled コンテナに置き換えた。

## 何を何に置き換えたか
| 旧 | 新 |
|---|---|
| 器 `<div>`（gap なし・カード密着） | `List`（縦積み＋`gap: spacing.md`） |

素の `<button>/<input>/<select>/<span>` は無く、置換対象は器のみ。カードは既にリファクタ済みの `AnnouncementCard` に委譲。

## なぜこの設計にしたか
- **AnnouncementList / TaskList / PatientList と同一パターン**：gap を `spacing.md` に統一し、一覧系の間隔をアプリ全体で揃える（一体感）。
- **絞り込みは維持**：`filter(a => a.priority === "HIGH" && !a.isRead)` は元コードのまま。責務は「緊急のみを抜き出して並べる」ことに絞る。
- **filter を JSX 内から変数へ抽出**：可読性のため。挙動は同じ。

## 挙動を維持するために気をつけた点
- props（`announcements` / `onRead`）不変。
- 絞り込み条件（priority=HIGH かつ未読）不変。
- default export のまま。

## 使用した theme トークン
- `spacing.md`（カード間 gap）
