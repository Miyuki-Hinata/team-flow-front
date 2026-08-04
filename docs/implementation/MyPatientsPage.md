# MyPatientsPage（/my-patients）

## 何を作ったか
受け持ち患者ビュー本体（患者起点）。選んだ受け持ち患者だけを一覧表示し、「受け持ちを選択」（Picker 起動）と「クリア」（全解除）を提供するページ。

## なぜこの設計にしたか
- **`assignedPatients` を確定状態の単一情報源にする**：`useState<Patient[] | null>`。`null`＝未取得（Loading 切替）。選択途中の下書きは Picker 側が持ち、保存成功時に `onSaved` でここへ最新一覧が返る＝「確定」と「下書き」の責務分離。
- **3状態の出し分け**：未取得→`Loading`／0件→`EmptyState`＋CTA／あれば `PatientCard` 一覧。既存ページと同じ規約。
- **カードは `Link` で包んで詳細へ遷移**：`PatientCard` は表示専用（シェブロンで遷移を示唆）なので、ナビゲーションは呼び出し側の責任として `styled(Link)` で包む（MyTasksPage と同じ分担）。
- **クリアは `ConfirmDialog` を挟む**：一括解除は取り消せないので確認を入れる。実体は `replaceAssignedPatients([])`（集合置換PUTに空配列）で、API を1つに保つ。
- **ヘッダーのクリアは受け持ちがある時だけ表示**：0件時に押せない操作を出さない。
- **MyTasksPage との棲み分け**：あちらはタスク起点（タスクを患者で束ねる）、こちらは患者起点（選んだ患者そのものを一覧）。統合せず、カードから患者詳細へ相互に行き来できる。同じデータを2つのメンタルモデルで見せる、機能全体の狙いをページ単位で体現している。
- **保存先は localStorage ではなく DB（`user_patient_assignments`）**：受け持ちは「どの端末でログインしても同じ」であるべきユーザー紐づきの業務データで、端末に縛られる localStorage では別端末で消える。ログイン維持＝ユーザー識別が要件なので DB が正しい置き場所。
- **standing assignment（日付を持たない受け持ち）**：シフト制なので「朝に today で固定」ではなく、クリア/再選択するまで維持される割り当てとした。`assigned_date` カラムはあえて持たず、日付単位の割り当てが必要になった時点の将来拡張に残した。

## どのお手本に倣ったか
- `PatientPage`：`PageHeader`＋`Button`（action）＋一覧、という素直なページ構成と `useState`/`useEffect` の取得パターン。
- `MyTasksPage`：`styled(Link)` で一覧要素を詳細へ遷移させる導線、`useToast` での通知、`T[] | null` の Loading 規約。
- `AppLayout`：ルートは `App.tsx` の `PrivateRoute`＋`AppLayout` 配下に追加（`/my-patients`）。

## 使用した theme トークン
- `spacing.sm` / `spacing.md` — ボタン間隔・カード間隔・空状態の縦積み
- 文字色・見出しは `PageHeader` / `PatientCard` / `EmptyState` に委譲
