# Input

## 何を作ったか
全フォームの素の `<input>`（text / password / date / tel / datetime-local）を置き換えるための、共通の入力欄コンポーネント（`src/components/ui/Input.tsx`）。見た目（theme トークン適用）と標準属性の転送だけを担う。

## なぜこの設計にしたか
- **props は `React.InputHTMLAttributes<HTMLInputElement>` を継承のみ**。独自 props はゼロにした。value / onChange / type / placeholder / disabled / name / id といった属性を自前で列挙すると、抜け漏れや二重管理が発生する。標準属性を丸ごと継承すれば、呼び出し側は素の `<input>` と同じ感覚で使え、将来 `type` や `autoComplete` などを渡したくなっても Input 側の改修が不要。
- **見た目は `StyledInput`（styled.input）に分離し、本体は `{...rest}` を転送するだけ**。スタイルの定義と「属性の受け渡し」という責務を分け、お手本（AISummaryCard / Modal）と同じ「props を分割代入で受け取り、下位へ渡す」書き味に揃えた。
- **単一責任**：label・エラーメッセージ・必須マークは含めない。それらは別途 `FormField` が担当する予定のため、Input は「入力欄そのもの」だけに絞った。将来 FormField が Input をラップして label を付ける形になっても、Input 側は変更不要。
- トレードオフ：独自 props を持たないため、エラー状態のスタイル（枠を赤くする等）は現状表現できない。これは意図的で、エラー表示の責務は FormField 側に寄せる方針。必要になった時点で `isError` などを追加する余地は残している。

## どのお手本に倣ったか
- **AISummaryCard / Modal**：`type ○○Props = {...}` で型を定義し、`({ ... }: ○○Props)` と分割代入で受け取るパターン。Input では独自 props が無いため `({ ...rest }: InputProps)` の形で受け、下位（StyledInput）へ転送している。
- **Button.tsx**：styled-components で theme トークンを `props => props.theme.xxx` で引く書き方、および見た目を styled 要素に持たせる構成を踏襲。

## 使用した theme トークン
| 用途 | トークン | 値 |
|---|---|---|
| 背景（入力欄の沈んだ面） | `colors.surface.sunken` | `#EEF0F4` |
| 文字 | `colors.text.primary` | `#1A1D24` |
| プレースホルダー（`::placeholder`） | `colors.text.muted` | `#9298A6` |
| 枠線（通常） | `colors.border.default` | `#E2E5EB` |
| 枠線（focus 時） | `colors.brand.teal` | `#0E9384` |
| 角丸 | `radius.md` | `0.5rem`（8px） |
| 余白（上下 / 左右） | `spacing.sm` / `spacing.md` | `8px` / `16px` |
| 文字サイズ | `fontSize.md` | `1rem`（16px） |
| disabled 時の文字 | `colors.text.muted` | `#9298A6` |

すべて theme 経由で参照し、`#xxxxxx` や px の直書きは一切していない。

## 面接で説明できるポイント
- **なぜ `InputHTMLAttributes` を継承したか**：HTML 標準属性の再発明を避けるため。ラッパーコンポーネントで DOM 要素の属性を「そのまま通す」ときの定石で、型の恩恵（onChange のイベント型補完など）もそのまま受けられる。
- **見た目とロジックの分離**：`StyledInput`（見た目）と `Input`（属性転送）を分けることで、単一責任を保ちつつお手本の関数コンポーネント書式に揃えた。
- **focus の扱い**：`outline: none` で標準の枠を消し、`border-color` をティールに変えることで、デザインの「今ここ」表現を枠線一本で統一している（README のフォーカス仕様に対応）。
- **theme 一元管理**：色や余白を変えたいときは theme.ts だけ直せばよく、ダークモードも theme 切替で自動追従する。
