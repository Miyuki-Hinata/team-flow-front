# PasswordChangeModal（リファクタ）

## 何を作ったか
`src/components/PasswordChangeModal.tsx` のリファクタ。パスワード変更モーダル。素の `<input>`×3、`<button>`×2、生の `<label>`＋`<h2>`＋`<p style>` を、土台コンポーネント（`ui/Input` / `ui/FormField` / `ui/Button`）と theme トークンで整えた styled に置き換えた。

## 何を何に置き換えたか
| 旧 | 新 |
|---|---|
| `<h2>パスワード変更</h2>` | `Title`（styled.h2、`fontSize.lg`・`fontWeight.bold`・`text.primary`） |
| `<div><label>…<input type="password"/></label></div>`×3 | `FormField label htmlFor` + `Input id type="password"` の組×3 |
| `<p style={{ color: 'red' }}>` | `ErrorText`（`semantic.danger.main` + `fontSize.xs`） |
| `<button>変更</button>` | `ui/Button variant="primary"` |
| `<button>閉じる</button>` | `ui/Button variant="secondary"` |
| モーダル中身の並び（暗黙） | `Content`（縦積み＋`spacing.md`）＋ `Actions`（右寄せ・横並び） |

## なぜこの設計にしたか
- **FormField ＋ Input の合成**：ラベルと入力の紐付け（`htmlFor` ↔ `id`）を明示し、ラベルクリックでフォーカスが移る（アクセシビリティ）。id は `pw-current` / `pw-new` / `pw-confirm` で衝突しない値にした。
- **エラーは FormField ではなく独立表示**：3つの入力のうち特定1つに紐付くエラーではなく、**フォーム全体のバリデーション結果**（新パスワード8文字未満／不一致／API エラー）なので、FormField の error props ではなく独立した `ErrorText` として `Content` 直下に置いた。
- **ボタン配置は ConfirmDialog と揃えた**：`Actions` で右寄せ・横並び・`gap: spacing.sm`。閉じるを左、主要操作の変更を右、という視線動線を共通化。
- **`variant`**：変更＝主要操作なので `primary`、閉じる＝中立操作なので `secondary`。削除ではないので `danger` は使わない。

## 挙動を維持するために気をつけた点
- **バリデーション・API 呼び出し・alert・onClose のロジックは一切変更なし**（`handleSubmit` そのまま）。
- **props（`isOpen` / `onClose`）不変**。Modal に流すだけ。
- **default export のまま**維持（`Navigation` が default import で読んでいる）。

## 使用した theme トークン
- 余白：`spacing.md`（Content 縦間隔）/ `spacing.sm`（ボタン列 gap）
- 色：`text.primary`（見出し）/ `semantic.danger.main`（エラー）
- 文字：`fontSize.lg`・`fontWeight.bold`（見出し）/ `fontSize.xs`（エラー）
- ボタンの色・余白は Button 側、器の白背景/角丸/padding は Modal が包む Card 側に委譲。直書きは無し。

## 判断した点・申し送り
- **成功時の `alert('パスワードを変更しました')`**：既存挙動のまま温存。将来的にはトースト等に置き換えたい（別Issue）。
- **type="password" のトグル表示（目のアイコン）**：デザインでも指定なし＆既存にもないため今回は入れない。
- **エラー表示位置**：フォーム下・ボタンの上に配置。デザインのモーダルには具体位置指定がないため、視認性を優先してここに置いた。

## 面接で説明できるポイント
- **フォームの合成**：FormField × Input で「額縁＋中身」を組み、各フィールドが同じ書き味で並ぶ。3つとも同じパターンなので読みやすい。
- **エラーの粒度で置き場所を変える**：フィールド固有なら FormField、フォーム全体なら独立表示、という判断。
- **Modal / Button / Input / FormField の 4 土台の合成**で、モーダル固有のスタイルをほぼ持たずに完成させた（薄い層）。
