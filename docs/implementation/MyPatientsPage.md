# MyPatientsPage（/my-patients）

## 何を作ったか
受け持ち患者ビュー本体（患者起点）。選んだ受け持ち患者だけを一覧表示し、「受け持ちを選択」（Picker 起動）と「クリア」（全解除）を提供するページ。

## なぜこの設計にしたか
- **`assignedPatients` を確定状態の単一情報源にする**：`useState<Patient[] | null>`。`null`＝未取得（Loading 切替）。選択途中の下書きは Picker 側が持ち、保存成功時に `onSaved` でここへ最新一覧が返る＝「確定」と「下書き」の責務分離。
- **3状態の出し分け**：未取得→`Loading`／0件→`EmptyState`＋CTA／あれば `PatientCard` 一覧。既存ページと同じ規約。
- **カードは `Link` で包んで詳細へ遷移**：`PatientCard` は表示専用（シェブロンで遷移を示唆）なので、ナビゲーションは呼び出し側の責任として `styled(Link)` で包む（MyTasksPage と同じ分担）。
- **クリアは `ConfirmDialog` を挟む**：一括解除は取り消せないので確認を入れる。実体は `replaceAssignedPatients([])`（集合置換PUTに空配列）で、API を1つに保つ。
- **ヘッダーのクリアは受け持ちがある時だけ表示**：0件時に押せない操作を出さない。
- **MyTasksPage との棲み分け**：あちらはタスク起点（タスクを患者で束ねる）、こちらは患者起点（選んだ患者そのものを一覧）。統合せず、カードから患者詳細へ相互に行き来できる。

## どのお手本に倣ったか
- `PatientPage`：`PageHeader`＋`Button`（action）＋一覧、という素直なページ構成と `useState`/`useEffect` の取得パターン。
- `MyTasksPage`：`styled(Link)` で一覧要素を詳細へ遷移させる導線、`useToast` での通知、`T[] | null` の Loading 規約。
- `AppLayout`：ルートは `App.tsx` の `PrivateRoute`＋`AppLayout` 配下に追加（`/my-patients`）。

## 使用した theme トークン
- `spacing.sm` / `spacing.md` — ボタン間隔・カード間隔・空状態の縦積み
- 文字色・見出しは `PageHeader` / `PatientCard` / `EmptyState` に委譲

## 面接で説明できるポイント
- **確定状態と下書き状態の分離**：ページは確定（`assignedPatients`）、Picker は下書き。保存で確定が更新される流れを説明できる。
- **集合置換PUTの再利用**：保存もクリアも同じ `replaceAssignedPatients`（クリア＝空配列）。エンドポイントと考え方を1つに保つ設計。
- **表示とナビゲーションの責務分担**：`PatientCard` は見た目だけ、遷移は `Link` を被せる側が持つ。
- **患者起点/タスク起点の2ビュー**：同じデータを2つのメンタルモデルで見せる、機能全体の狙いをページ単位で体現している。
