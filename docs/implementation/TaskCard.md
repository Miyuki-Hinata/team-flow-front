# TaskCard（リファクタ）

## 何を作ったか
`src/components/TaskCard.tsx` のリファクタ。タスク一覧の1件を表す、詳細へのリンクカード。素の HTML 要素を土台コンポーネントへ置き換えた。お知らせ系（AnnouncementCard）と同じ方針・書き味に揃えている。

## レイアウト（デザイン準拠に修正）
初回リファクタは縦積みだったが、`TeamFlow.dc.html`（502–513行）のタスク行は**横並び**だったため、デザインに合わせて作り直した。
```
[状態バッジ] [タイトル / 患者 ・ カテゴリ] …(flex)… [優先度バッジ] [期限 ・ 担当（右寄せ・ラベル付き）]
```

## 何を何に置き換えたか
| 旧（素の実装） | 新（土台） | 補足 |
|---|---|---|
| `<Link>`（下線・紫が中の文字に継承） | `CardLink = styled(Link)` | `text-decoration:none; color:inherit; display:block` で打ち消し |
| 器の `<div>` | `ui/Card` | 白背景・角丸・padding |
| `<span>{task.taskStatus}</span>`（"CREATED" 等の生表示） | `ui/StatusBadge`（左端） | 値→色/ラベルを内包 |
| `<span>{task.priority}</span>`（"HIGH" 等の生表示） | `ui/PriorityBadge`（中央右） | 値→色/ラベルを内包 |
| `<span>{category.categoryName}</span>` | `SubMeta` 内のテキスト「患者 ・ カテゴリ」 | **デザイン準拠でカテゴリは Badge ではなく plain text**（design 506行） |
| `<h1>{task.title}</h1>` | `Title`（styled、theme） | fontSize.lg・強調・主要文字色 |
| 患者の `<span>` | `SubMeta`（患者 ・ カテゴリ を「・」連結） | タイトル直下に配置 |
| 期限・担当者の `<span>` 群 | `DueAssignee`（右寄せ・「期限 ・ 担当」ラベル＋値） | design 509–512 の右ブロックを再現 |

## なぜこの設計にしたか
- **StatusBadge / PriorityBadge をそのまま使える**：`task.taskStatus`（`'CREATED'|'PROGRESS'|'REVIEWING'|'DONE'`）と `task.priority`（`'LOW'|'MEDIUM'|'HIGH'`）は、各 Badge が受け取る型と一致するため、値をそのまま渡すだけで色・日本語ラベルが付く。
- **カテゴリは neutral バッジ**：カテゴリ名は分類タグで意味の色を持たせない、という お知らせ系と同じ判断。
- **`align-items: flex-start`**：Content が縦積みのため、既定の stretch でバッジが横に伸びるのを防ぐ（AnnouncementCard で確認済みの対処と同じ）。
- **メタ情報（患者・期限・担当者）は Meta にまとめた**：これらは土台コンポーネントの対象ではない素のテキスト。theme の補助文字色・ラベルサイズで控えめに整え、`flex-wrap` で折り返す。表示条件（`task.patient &&` 等）は元コードのまま維持。

## 挙動を維持するために気をつけた点
- **props インターフェースは不変**（`task` のみ）。
- **表示条件・key・遷移先（`/tasks/${task.id}`）は変更なし**。患者名の連結（`lastName + '' + firstName`）も元のまま（※空文字連結で姓名が詰まる既存挙動もそのまま温存。修正すると表示が変わるため別Issue向け）。
- **default export のまま**維持（TaskList が default import）。

## 使用した theme トークン
- 余白：`spacing.xs`（縦積み）/ `spacing.sm`（バッジ間・メタ間）
- 色：`text.primary`（タイトル）/ `text.secondary`（メタ）
- 文字：`fontSize.lg`・`fontWeight.bold`（タイトル）/ `fontSize.sm`（メタ）
- ※ステータス/優先度/カテゴリの色は各 Badge、器の白背景/角丸/padding は Card に委譲。直書きは無し。

## 判断した点・申し送り
- **患者名の連結 `lastName + '' + firstName`**：空文字での連結は姓名が詰まる（例「山田太郎」）。デザイン的には姓名の間に空白が欲しいが、これは**表示内容の変更**になるため今回は温存し、別Issue向けの申し送りとする。
- 現状カードが表示している項目（ステータス・優先度・カテゴリ・患者・期限・担当者）は情報を落とさずすべて維持。

## 面接で説明できるポイント
- **既存 Badge 群の再利用**：値→表示の対応を Badge 側に閉じ込めているため、カードは値を渡すだけで済む。
- **お知らせ系との一貫性**：CardLink / Content の align-items / neutral バッジ、という同じパターンを横展開して一体感を出した。
- **refactor と redesign の線引き**：メタ情報の素テキストは残し、置換対象（バッジ・器・リンク）だけを土台化した。
