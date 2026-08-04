# PatientFilter（リファクタ）

## 何を作ったか
`src/components/PatientFilter.tsx` のリファクタ。部署・担当医の絞り込みバー。素の `<select>` 2つを汎用 `ui/Select` に置き換えた。TaskFilter と同じ方針。

## 何を何に置き換えたか
| 旧 | 新 |
|---|---|
| 部署の素 `<select>`＋`<option>`直書き | `ui/Select`（`options` 配列＋`placeholder="部署：すべて"`） |
| 担当医の素 `<select>`＋`<option>`直書き | `ui/Select`（`options` 配列＋`placeholder="担当医：すべて"`） |
| 器 `<div>` | `Filters`（横並び＋`gap: spacing.sm`） |

## なぜこの設計にしたか
- **専用 Select ではなく汎用 `ui/Select` を使った**：部署・担当医の選択肢は API から動的に来るため、値・ラベル固定の専用ラッパー（PrioritySelect のような）は作れない。汎用 Select に options を渡す形が最適。
- **`options` は `String(id)` で組み立て**：ドメインは number ID だが Select は string を扱う。呼び出し側で string に変換して渡し、onChange 側で `Number(...)` に戻す（TaskFilter と同じ「'' ⇔ null / string ⇔ number」変換パターン）。
- **placeholder に「部署：」「担当医：」のプレフィックス**：TaskFilter と同じく、未選択時にも何のフィルタか分かる。デザインの「〜：すべて」表記に一致（`TeamFlow.dc.html` 284行「部署：すべて」/ 290行「担当医：すべて」）。
- **担当医ラベルは姓名スペース入り**：元コードも `lastName + " " + firstName` でスペース入りだったのでそのまま維持。

## 挙動を維持するために気をつけた点
- props インターフェース不変（6 props すべて同名同型）。
- `'' ⇔ null` および `string ⇔ number` の変換は従来どおり。絞り込みの動作は不変。
- default export のまま。

## 使用した theme トークン
- `spacing.sm`（セレクト間 gap）
- ※セレクト自体の見た目は Select 側に委譲
