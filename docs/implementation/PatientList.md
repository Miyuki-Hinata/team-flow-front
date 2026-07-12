# PatientList（リファクタ）

## 何を作ったか
`src/components/PatientList.tsx` のリファクタ。素の `<div>` 器と素の `<Link>` を、theme トークンで整えた縦積みコンテナと `styled(Link)` に置き換えた。

## 何を何に置き換えたか
| 旧 | 新 |
|---|---|
| 器 `<div>`（gap なし） | `List`（縦積み＋`gap: spacing.md`） |
| 素 `<Link>`（下線・紫継承） | `CardLink = styled(Link)`（下線・色リセット） |

## なぜこの設計にしたか
- **リンクは List 側にあるのが正解**：`PatientCard` はお手本どおり「表示のみ」で遷移を持たない設計。Link は呼び出し側（List）の責任、という既存の構造を維持し、そこに下線打ち消しだけを足した。
- **gap は他一覧と同じ `spacing.md`**：AnnouncementList / TaskList と揃えて一体感。

## 挙動を維持するために気をつけた点
- props（`patients`）不変。key・遷移先（`/patients/:id`）不変。
- default export のまま。

## 使用した theme トークン
- `spacing.md`（カード間 gap）
