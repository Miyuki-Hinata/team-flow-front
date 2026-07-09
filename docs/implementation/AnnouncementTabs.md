# AnnouncementTabs（リファクタ）

## 何を作ったか
`src/components/AnnouncementTabs.tsx` のリファクタ。未読/既読を切り替えるタブ。素の `<button>`＋インライン style（fontWeight のみ切替）を、theme トークンでデザインのセグメントコントロール表現に整えた。挙動（タブ切替・件数表示）は維持。

## 何を何に置き換えたか
| 旧（素の実装） | 新 | 補足 |
|---|---|---|
| 器の `<div>`（スタイル無し） | `TabList`（styled.div、セグメントの器） | 沈んだ面背景＋内側 padding |
| `<button style={{fontWeight: active ? 'bold':'normal'}}>` ×2 | `Tab`（styled.button、`$active` で見た目切替） | 背景・文字色・太さをまとめて切替 |

## なぜこの設計にしたか
- **汎用 Tabs にも ui/Button にも寄せなかった**：本タスクの指示どおり、汎用 Tabs は別フェーズで実装する。またタブは「アクション用ボタン」ではなく**セグメント切替（トグル）**なので、`ui/Button` の variant（primary/secondary/danger）とは意味が異なる。無理に Button へ寄せるとデザイン（セグメント）と衝突するため、既存の `<button>` を維持したまま styled-components＋theme で「スタイルだけ」デザインに寄せた。
- **アクティブ状態を `$active`（transient prop）で表現**：styled-components の `$` 始まり prop は DOM に転送されないため、`<button>` に不正な属性（`active`）が付かない。旧実装は fontWeight だけを切り替えていたが、デザインの tabStyle に合わせ「背景・文字色・太さ」を一括で切り替えるようにした。
- **デザインのセグメント値を theme トークンへマッピング**（`TeamFlow.dc.html` 443–445行 / tabStyle 1132行）：
  - 器：背景 `#EEF0F4`→`surface.sunken`、gap/padding `4px`→`spacing.xs`、角丸 `8px`→`radius.md`、`width:fit-content`→`display:inline-flex`。
  - タブ：`font-size:14px`→`fontSize.sm`。角丸 `6px` はトークンに無いため、器(md=8px)より一段小さい `radius.sm`(4px) を採用し「内側タブが器に収まる入れ子感」を保った。padding 左右 `18px` もトークンに無いため最も近い `spacing.md`(16px) に寄せた。
  - アクティブ：bg `#FFFFFF`→`surface.raised`、文字 `#1A1D24`→`text.primary`、weight 500→`fontWeight.bold`（theme は 400/600 の2段のため 500 は bold へ丸め）。非アクティブ：bg transparent、文字 `#5A6072`→`text.secondary`、weight→`fontWeight.normal`。

## 挙動を維持するために気をつけた点
- **props インターフェースは不変**（`announcements` / `activeTab` / `onTabChange`）。
- **件数の算出ロジック（`unreadCount` / `readCount`）と onTabChange の発火は変更なし**。見た目だけを置換。
- **default export のまま**維持。

## 使用した theme トークン
- 余白：`spacing.xs`（器の gap/padding）/ `spacing.sm`・`spacing.md`（タブの padding）
- 角丸：`radius.md`（器）/ `radius.sm`（タブ）
- 色：`surface.sunken`（器背景）/ `surface.raised`（アクティブ背景）/ `text.primary`（アクティブ文字）/ `text.secondary`（非アクティブ文字）
- 文字：`fontSize.sm` / `fontWeight.bold`・`fontWeight.normal`

## 判断した点・申し送り
- **件数表記を統一**：旧実装は「未読 (0)」（スペースあり）と「既読(1)」（スペースなし）で不揃いだった。一体感を優先し、両方「未読 (N)」「既読 (N)」の統一表記に揃えた（＝ごく軽微な表示変更。挙動・数値は不変）。
- **角丸 6px / padding 18px はトークンに丸めた**：厳密なピクセル一致より、トークン体系（8の倍数・radius 3段）の一貫性を優先。
- **汎用 Tabs 化は別フェーズ**：患者詳細のカンバンタブ（すべて/マイタスク）も同じ tabStyle を使うため、専用フェーズで `Tabs` に共通化する際、この Tab/TabList のスタイルを土台にできる。

## 面接で説明できるポイント
- **transient prop（`$active`）**：見た目切替用の prop を DOM に漏らさない styled-components の作法。
- **セグメントとボタンの区別**：トグル UI をアクションボタン（ui/Button）に寄せなかった設計判断。意味に合ったマークアップ／スタイルを選ぶこと。
- **トークンへの丸め**：デザインの実値（6px/18px/weight500）がトークンに無いとき、体系を崩さず最も近い値へ寄せる一貫した判断。
