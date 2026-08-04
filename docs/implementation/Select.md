# Select

## 何を作ったか
全フォーム／フィルタの素の `<select>` を置き換える共通セレクト（`src/components/ui/Select.tsx`）。`options` 配列を受けて `<option>` を描画し、標準の select 属性を転送する。見た目は Input と完全に揃える。

## なぜこの設計にしたか
- **options を配列（`{ value, label }[]`）で受ける**：audit で「A. Select ★最大の重複」とされた通り、素の `<select>` は `<option>` を JSX で直書きしていて 6ファイル以上に同型コードが散っていた。選択肢を「データ」として props で受け取り、描画を Select 内部に閉じ込めることで、呼び出し側は配列を渡すだけになり重複が消える。value と label を分けたのは「送信値」と「表示文言」が別物（例：value=`HIGH` / label=`高`）だから。
- **placeholder を空 value（`""`）で表す**：未選択状態を HTML の標準的な作法どおり `<option value="">…</option>` で表現する。フォームの状態が空文字なら「未選択」と一意に判定でき、`required` バリデーションとも自然に噛み合う。placeholder を任意（`?`）にしたのは、フィルタのように「初期から何か選ばれている」ケースでは不要なため。
- **key に option.value を使う**：value は選択肢の中で一意な識別子であり、React のリスト再描画で安定したキーになる。配列の index をキーにすると並び替え時に不整合が起きるため避けた。
- **`SelectHTMLAttributes` 継承＋独自 props は2つだけ**：value / onChange / disabled / name / id 等を自前で列挙せず継承する（Input と同じ思想）。独自に足すのは options / placeholder のみに絞り、単一責任を保った。
- **独自 props を rest から除外**：`{ options, placeholder, ...rest }` と明示的に取り出す。options や placeholder を `<select>` にそのまま spread すると、DOM に存在しない不正な属性として警告が出るため、rest には標準属性だけが残るようにした。
- **単一責任**：優先度・ステータス固有の選択肢は持たない。それらは Select をラップする PrioritySelect / TaskStatusSelect が担当する（値→options のマッピングを内包させる）。

## どのお手本に倣ったか
- **Input.tsx（直前の実装）**：見た目を `StyledSelect`（styled 要素）に分離し、本体は props を分割代入で受けて `{...rest}` を転送する構成。theme トークンは Input と同一値で揃え、同じフォーム内に並んだときに見た目が一致するようにした（本依頼で最重要とされた点）。
- **AISummaryCard / Modal**：`type ○○Props = {...}` で型を定義し `({ ... }: ○○Props)` で分割代入する書式。

## 使用した theme トークン（Input と統一）
| 用途 | トークン | 値 |
|---|---|---|
| 背景（沈んだ面） | `colors.surface.sunken` | `#EEF0F4` |
| 文字 | `colors.text.primary` | `#1A1D24` |
| 枠線（通常） | `colors.border.default` | `#E2E5EB` |
| 枠線（focus 時） | `colors.brand.teal` | `#0E9384` |
| 角丸 | `radius.md` | `0.5rem`（8px） |
| 余白（上下 / 左右） | `spacing.sm` / `spacing.md` | `8px` / `16px` |
| 文字サイズ | `fontSize.md` | `1rem`（16px） |
| disabled 時の文字 | `colors.text.muted` | `#9298A6` |

すべて theme 経由。`#xxxxxx`・px の直書きは無し。
