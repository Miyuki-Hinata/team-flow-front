# AnnouncementCard（リファクタ）

## 何を作ったか
既存の `src/components/AnnouncementCard.tsx` を、素の HTML 要素から完成済みの土台コンポーネントへ置き換えるリファクタ。表示項目・props・遷移/既読化の挙動は維持したまま、見た目の層だけを土台に揃えた。

## 何を何に置き換えたか
| 旧（素の実装） | 新（土台コンポーネント） | 補足 |
|---|---|---|
| 器の `<div style={{ background: isRead ? '#f0f0f0' : '#fff' }}>` | `ui/Card`（白背景固定） | 背景の濃淡で既読/未読を区別する実装を廃止 |
| 既読/未読の背景切替（`#f0f0f0`） | `UnreadDot`（styled、未読時のみ表示） | **デザイン仕様に一致させた**（下記） |
| `<span>{category.categoryName}</span>` | `ui/Badge`（tone="neutral"） | カテゴリは分類タグ＝意味の色を持たせない |
| `<span>{department?.departmentName ?? '全体'}</span>` | `ui/Badge`（tone="neutral"） | 部署も分類タグ |
| `<span>{priority}</span>`（"HIGH" 等の生表示） | `ui/PriorityBadge` | 値→色/ラベルのマッピングを内包 |
| `<h1>{title}</h1>`（素の見出し） | `Title`（styled、theme トークン） | 18px相当（fontSize.lg）・強調・主要文字色 |

## 既読/未読表現をドットに変えた理由（デザイン確認の結果）
旧実装は「既読=グレー背景 `#f0f0f0` / 未読=白」だったが、これは **デザイン仕様外の独自実装** だった。

- README §5：「未読は左に `#0E9384` の小ドット」
- `TeamFlow.dc.html`（453行目）：未読時のみ `width:8px; height:8px; border-radius:4px; background:#0E9384` の左ドット。カード背景は既読・未読とも白。

→ デザインの正解は「未読=ティール左ドット／背景は常に白」。`ui/Card`（白背景固定）とも整合する。ハードコード `#f0f0f0` も排除でき、§2 のトークン厳守にも適合する。ドットの色は `brand.teal`、サイズ 8px は `spacing.sm`、角丸は `radius.sm` とすべて theme から引いた。

## 挙動を維持するために気をつけた点
- **props インターフェースは不変**（`announcement` / `onRead`）。親（AnnouncementList）の呼び出しをそのまま動かせる。
- **遷移＋既読化のロジックは従来どおり**：`<Link to={...}>` の内側 `<div onClick={() => onRead(id)}>` を維持。イベントハンドラ・データ取得には一切手を入れていない（見た目の層のみ置換）。
- **default export のまま**：AnnouncementList が `import AnnouncementCard from './AnnouncementCard'`（default）で読み込んでいるため、名前付きに変えると import が壊れる。export 形式は今回のリファクタ対象外として維持した。
- **表示項目は増やしていない**：デザインのお知らせカードには本文・投稿者・日付・緊急時の赤ストリップ等もあるが、現状 props で表示していないため今回は追加せず、既存の表示項目（カテゴリ・部署・タイトル・優先度）を土台へ置換するだけに留めた（redesign ではなく refactor）。

## 使用した theme トークン
- 余白：`spacing.md`（行間隔）/ `spacing.sm`（ドットサイズ・バッジ間）/ `spacing.xs`（縦積み間隔・ドット上マージン）
- 角丸：`radius.sm`（ドット）
- 色：`brand.teal`（未読ドット）/ `text.primary`（タイトル）
- 文字：`fontSize.lg`・`fontWeight.bold`（タイトル）
- ※カテゴリ/部署の色・余白は Badge、優先度は PriorityBadge、器の白背景/角丸/padding は Card に委譲。直書きは無し。

## 判断した点・申し送り
- **カテゴリ/部署は neutral バッジに統一**：デザインではカテゴリに意味の色（緊急=赤 等）が付くが、`category.categoryName` は文字列で汎用的なため、audit の指針どおり neutral とした。カテゴリ名→tone のマッピングは別途 enhancement 候補。
- **優先度バッジは表示を維持**：デザインのお知らせカードは優先度を明示せず緊急を赤ストリップで示すが、現状カードが優先度を表示していたため、情報を落とさないよう PriorityBadge で残した。デザイン完全準拠（赤ストリップ化）はページ実装フェーズで再検討したい。

## 追記：初回レビューでの修正（実機確認から）
実機表示で2点の不具合が判明し修正した。
1. **優先度バッジが横幅いっぱいに伸びる**：`Content` が縦積み（`flex-direction: column`）で `align-items` 未指定＝既定 `stretch` のため、バッジ（フレックスアイテム）が横に引き伸ばされていた。→ `Content` に `align-items: flex-start` を追加し左寄せ固定。
2. **タイトルが紫＋下線で表示**：カード全体を包む `<Link>`（`<a>`）の既定スタイルが中の文字に継承されていた。→ `CardLink = styled(Link)` に `text-decoration: none; color: inherit; display: block;` を当てて打ち消し。

## 面接で説明できるポイント
- **「現状の見た目」ではなく「デザインの正解」を根拠に判断した**：既読=グレー背景は独自実装で、README と HTML プロトタイプを確認して未読ドットが正解と判明。憶測で寄せず一次資料を当たった。
- **refactor と redesign の線引き**：表示項目を増やさず、素の要素の土台化に徹した。
- **土台への委譲**：色・余白・角丸を Card / Badge / PriorityBadge に委ね、AnnouncementCard 自身は「並べ方」と「未読ドット」だけを持つ薄い構成にした。
