# ConfirmDialog

## 何を作ったか
削除など「取り消せない操作」の前に確認を取る共通ダイアログ（`src/components/ui/ConfirmDialog.tsx`）。既存の Modal を土台に、確認メッセージ ＋「キャンセル／実行」ボタンを載せたもの。

## なぜこの設計にしたか
- **Modal と Button を再利用した（新規に作り直さない）**：オーバーレイ・中央配置・Escape / オーバーレイクリックで閉じる挙動は Modal が既に持ち、ボタンの見た目（variant ごとの色）は Button が持つ。ConfirmDialog はそれらを組み合わせて「確認を取る」意味づけだけを足す薄い層にした。開閉ロジックやボタン色を再実装すると二重管理になり、Modal / Button を直しても追従しなくなる。既存資産の組み合わせで単一責任を保つ。
- **実行ボタンを danger（赤）にした**：削除は取り消せない操作。赤で「これは危険な操作だ」と視覚的に警告し、誤操作を抑止する。README の「1色1意味（赤＝緊急・危険）」にも沿う。キャンセルは中立的な secondary にして、危険なボタンと視覚的に差をつけた。
- **onClose と onConfirm を分けた**：「閉じる（キャンセル）」と「実行する（削除）」は結果がまったく違う操作。同じハンドラにまとめると、閉じただけのつもりが削除される事故が起きうる。呼び出し側で「キャンセル時の処理」と「実行時の処理」を別々に渡せるよう分離した。キャンセルボタンとオーバーレイクリックは同じ `onClose`（＝何もせず閉じる）に集約し、実行は `onConfirm` だけに割り当てている。
- **title / confirmLabel にデフォルトを持たせた**：多くの用途は「削除の確認」「削除する」なので、`title = '削除の確認'` / `confirmLabel = '削除する'` を既定にし、呼び出し側は最低限 `message` だけ渡せば動く。削除以外の確認（例：公開する等）では文言を上書きできるよう任意 props にした。message だけ必須なのは、何を確認するかは毎回異なるため。

## どのお手本に倣ったか
- **Modal.tsx**：`isOpen` / `onClose` / `children` を受ける合成パターン。ConfirmDialog はこの Modal に children として中身を差し込む。
- **Button.tsx**：`variant`（secondary / danger）で見た目を切り替える既存 API をそのまま利用。
- **Input.tsx / Select.tsx / FormField.tsx**：props を分割代入で受け（デフォルト値も分割代入で指定）、theme トークンを `props => props.theme.xxx` で引く書き味、名前付き export のみ、日本語コメント。

## 使用した theme トークン
| 用途 | トークン | 値 |
|---|---|---|
| 中身・ボタン列の要素間 | `spacing.md` / `spacing.sm` | `16px` / `8px` |
| 見出しサイズ | `fontSize.lg` | `1.125rem`（18px） |
| 見出し太さ | `fontWeight.bold` | `600` |
| 見出し文字色 | `colors.text.primary` | `#1A1D24` |
| 本文サイズ | `fontSize.md` | `1rem`（16px） |
| 本文文字色 | `colors.text.secondary` | `#5A6072` |

ボタンの色・余白は Button 側の責任（ここでは variant を指定するのみ）。器の白背景・角丸・padding は Modal が包む Card 側の責任。直書きは無し。
