# AssignmentPicker

## 何を作ったか
受け持ち患者を選ぶモーダル。「全患者を部署で絞り込み → 複数チェック → まとめて保存（集合置換PUT）」を担う中核UI。

## なぜこの設計にしたか
- **選択は「下書き」としてローカルに持つ**：`selectedIds`（`Set<number>`）を Picker がローカル state で保持し、開くたびに `initialSelectedIds` で初期化。保存を押すまで確定せず、キャンセルで破棄される（＝トランザクション的なUX）。`Set` にしたのは has/add/delete が O(1) で、多人数選択でも軽いため。
- **保存はこの Picker が担い、結果を親へ返す（`onSaved`）**：`replaceAssignedPatients` を呼び、成功後にサーバ返却の最新 `Patient[]` を親へ渡す。親（ページ）は「確定した受け持ち」だけを持てばよく、選択途中の状態を知らずに済む＝関心の分離。
- **部署フィルタは要件に絞って `Select`＋`FilterBar`**：`PatientFilter` 全体（検索＋部署＋担当医）は担当医などが不要なので使わず、同じ部品（`Select`/`FilterBar`）だけを再利用してモーダルを「部署で絞る」ことに集中させた。
- **null 部署のガード**：`patient.department?.id` で optional chaining。過去に null 部署でホワイトアウトした不具合の再発を防ぐ。
- **リストは `max-height`＋スクロール**：患者が多くてもモーダルが伸びすぎない。
- **保存中フラグ**：二重送信防止＋ボタン表示（「保存中...」）＋キャンセルも無効化。
- **未取得/0件/一覧の3状態**：`allPatients === null`→`Loading`、該当0件→`EmptyState`、あればカード列。既存ページと同じ `useState<T[] | null>` の Loading 規約に揃えた。
- **集合置換PUTとの噛み合わせ**：UIが最終的な選択集合を持ち、それをそのまま送るので、冪等なPUTと素直に対応する（差分計算不要）。
- **`Set` を使った不変更新**：`new Set(prev)` で作り直す React の不変更新パターン。

## どのお手本に倣ったか
- `Modal`：`isOpen`/`onClose`/`children` を受け、開閉状態は親が持つ。オーバーレイのクリック/Escで閉じる挙動はそのまま利用。
- `PatientFilter`：`Select`＋`FilterBar` による部署フィルタの組み方。
- `MyTasksPage`/既存ページ：`useState<T[] | null>` による未取得表現と `useMemo` でのフィルタ、`useToast` での成否通知。

## 使用した theme トークン
- `spacing.md` / `spacing.sm` / `spacing.xs` — レイアウトの間隔・余白
- `fontSize.xl` / `fontSize.sm`、`fontWeight.bold` — 見出し・補助文言
- `colors.text.primary` / `colors.text.secondary` — 文字色
- ボタン色は `Button` の variant（primary/secondary）に委譲
