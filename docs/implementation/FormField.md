# FormField

## 何を作ったか
フォームの各入力欄を「ラベル ＋ 入力欄 ＋ エラー表示」で包む共通の額縁（`src/components/ui/FormField.tsx`）。中身（Input / Select）は children で受け取り、FormField 自身は中身の種類を問わない。

## なぜこの設計にしたか
- **children で中身を受ける合成設計**：ラベルとエラーの「額縁」だけを FormField が担い、中身は呼び出し側が Input でも Select でも自由に差し込める。Modal と同じ children 合成パターンで、中身の種類ごとに FormField を作り分けずに済み、組み合わせが自由になる。Input を包むために Input を継承・改造するのではなく「外から包む」ことで、単一責任（Input＝入力欄、FormField＝額縁）を保つ。
- **`htmlFor` を必須 props にした**：`<label htmlFor>` と中身の `<input id>` を同じ値で紐付けると、ラベルクリックで入力欄にフォーカスが移り、スクリーンリーダーもラベルと入力を関連付けて読む（アクセシビリティ）。この紐付けは呼び出し側が `<FormField htmlFor="x"><Input id="x" /></FormField>` と同じ値を渡すことで成立する設計にした。FormField 側で id を自動採番して children に注入する手もあるが、children の型が Input/Select に限定されないため、明示的に呼び出し側で揃える方式にして単純さと汎用性を優先した。React では `for` が JS の予約語のため `htmlFor` を使う。
- **error は短絡評価で「ある時だけ」表示**：`{error && <ErrorText>{error}</ErrorText>}` とし、エラーが無いときは DOM に出さない。Select の placeholder と同じパターンで、任意表示を簡潔に表現している。error を任意（`?`）にしたのは、正常時は不要だから。
- **中身のスタイルには触れない**：children 自体の見た目は Input / Select 側の責任。FormField は縦並びの器・ラベル・エラーだけをスタイルする。

## どのお手本に倣ったか
- **Modal.tsx**：`children: ReactNode` を受けて包む合成パターン。中身を呼び出し側に委ね、自分は「枠」の責任だけを持つ構成をそのまま踏襲。
- **Input.tsx / Select.tsx**：props を分割代入で受け取り、theme トークンを `props => props.theme.xxx` で引く書き味、名前付き export のみ、日本語コメントの付け方。

## 使用した theme トークン
| 用途 | トークン | 値 |
|---|---|---|
| 要素間の間隔（label/中身/エラー） | `spacing.xs` | `4px` |
| ラベル文字色 | `colors.text.secondary` | `#5A6072` |
| ラベル文字サイズ | `fontSize.sm` | `0.875rem`（14px） |
| ラベル太さ | `fontWeight.bold` | `600` |
| エラー文字色 | `colors.semantic.danger.main` | `#A32D2D` |
| エラー文字サイズ | `fontSize.xs` | `0.75rem`（12px） |

中身（children）の色・余白は FormField では扱わない（Input/Select 側）。直書きは無し。

## 面接で説明できるポイント
- **合成（composition）でフォームを組む**：FormField × Input/Select の組み合わせで、あらゆるフィールドを同じ額縁で統一できる。中身の種類が増えても FormField は変更不要。
- **htmlFor / id の紐付け＝アクセシビリティ**：ラベルと入力の関連付けがなぜ重要か（クリックでフォーカス、支援技術の読み上げ）を説明できる。React での `htmlFor` の理由（予約語 `for`）も含む。
- **責務の線引き**：「入力欄そのもの（Input）」「ラベルとエラーの額縁（FormField）」を分けたことで、それぞれが小さく単純に保たれている。
- **短絡評価による任意表示**：error の有無で DOM 出力を切り替える定番パターン。
