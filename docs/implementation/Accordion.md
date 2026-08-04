# Accordion（折りたたみ表示）

## 何を作ったか
タイトル行をクリックすると本文の開閉を切り替える汎用パーツ。PatientDetailPage の追加情報（生年月日・電話・住所・緊急連絡先）のように「必要だが常時表示するほどではない情報」を畳んでおくために使う。

## なぜこの設計にしたか
- **開閉状態を内包する**：Modal.tsx と同じく、呼び出し側に state を持たせず自分で `useState` する。呼び出しは `<Accordion title="...">中身</Accordion>` だけで済む。
- **初期状態は props で選べる**：`defaultOpen` を受け取り、ページごとの好みで初期表示を変えられる（患者詳細では閉じ、他画面では開きたいケースにも対応）。
- **閉じているときは中身を DOM に出さない**：`{isOpen && <Body>...}` で条件描画。内側に重い描画コスト（フォームや長い表）が来ても閉じている間はレンダーコスト 0。
- **aria-expanded を付ける**：スクリーンリーダーで開閉状態が伝わる。
- **キャレットは AppHeader と同じ SVG + 180 度回転**：既存のドロップダウン UI と挙動を統一。
- **条件描画で描画コストを抑える**：`display:none` ではなく `{isOpen && ...}` を使う理由：閉じている間は React ツリーに存在しない → 内側のコンポーネントの render / useEffect が走らない。

## どのお手本に倣ったか
- **Modal.tsx**：開閉判断を自身に持ち、外からは「見出し」と「中身」だけを渡す分離パターン。isOpen state の内包も同じ。
- **AppHeader.tsx のドロップダウン**：`$open` を transient prop で受け、キャレット回転で開閉状態を視覚化。DOM に漏らさない書き方も踏襲。
- **Card 系**：白背景・薄い枠線・角丸で他のカード類と統一感を出す。

## 使用した theme トークン
- `colors.surface.raised` / `.sunken` — カード土台色 + ホバー時の反転
- `colors.border.default` — 枠線と Body 上部の区切り線
- `colors.text.primary` / `.secondary` — タイトル文字 / キャレット
- `spacing.md` / `.lg` — ヘッダーとボディのパディング
- `radius.lg` — カードの角丸
- `fontSize.lg` / `fontWeight.bold` — タイトル
