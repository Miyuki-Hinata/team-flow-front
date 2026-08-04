# SelectablePatientCard

## 何を作ったか
受け持ち選択で使う「チェックできる患者カード」。`PatientCard`（表示のみ）と `Checkbox` を合成しただけの部品で、選択状態そのものは持たない。

## なぜこの設計にしたか
- **状態を持たない（`selected`/`onToggle` を props で受ける）**：どの患者が選択中かは呼び出し側（Picker）が一元管理する。PatientCard と同じ「表示のみ・状態は親」方針で、選択集合の単一情報源を親に保つ。
- **全体を `<label>` で包む**：ネイティブのラベル関連付けにより、カードのどこをクリックしても内側 Checkbox がトグルされる。手動の `onClick`/`stopPropagation` が不要になり、キーボード操作も checkbox 標準のまま活きる。
- **PatientCard を丸ごと再利用（改変しない）**：患者の見た目（アイコン・氏名・メタ）の責任は PatientCard に委ね、重複実装を避ける。選択リングは PatientCard の枠線を触らず、外側 `CardWrapper` の `box-shadow` で表現。
- **`onToggle(patientId)` の粒度**：親が ID の集合（配列/Set）で選択管理しやすいよう、トグル時に患者 ID を返す。
- **`CardWrapper` に `min-width: 0`**：メタ情報が長くても flex 子が縮み、横あふれしないようにする定石。
- **selected のビジュアル**：均質に並べず選択にメリハリ（リング強調）を付ける、というデザイン原則の反映。

## どのお手本に倣ったか
`PatientCard`：①表示に責任を絞り状態を持たない ②`useTheme`/トークンで色を引く（ここでは styled 経由）③単一責任。加えて `Card` を土台に組む思想（AISummaryCard 系）を、PatientCard 越しに踏襲。

## 使用した theme トークン
- `spacing.md` — チェックボックスとカードの間隔
- `radius.lg` — 選択リングを Card の角丸に沿わせる
- `colors.brand.teal` — 選択中の2pxリング（`box-shadow`）
