# PatientListContainer（リファクタ）

## 何を作ったか
`src/components/PatientListContainer.tsx` のリファクタ。フィルタ状態（部署・担当医）を持ち、`PatientFilter` と `PatientList` を組み合わせるコンテナ。素の器 `<div>` を縦積み styled に置換。

## 何を何に置き換えたか
| 旧 | 新 |
|---|---|
| 器 `<div>`（gap なし） | `Container`（縦積み＋`gap: spacing.md`） |

## なぜこの設計にしたか
- コンテナは state 管理と組み立てに責任を絞る（既存構造を維持）。
- gap は他一覧系（Task/Announcement）と同じ `spacing.md` で統一。

## 挙動を維持するために気をつけた点
- **フィルタの useState / 絞り込みロジックは一切変更なし**（`patient.department.id` / `patient.doctor.id` の一致判定）。
- 子への props は不変。
- default export のまま。

## 使用した theme トークン
- `spacing.md`（フィルタと一覧の間隔）
